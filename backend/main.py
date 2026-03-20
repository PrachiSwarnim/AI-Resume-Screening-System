import os
import io
import json
import asyncio
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import PyPDF2
from google import genai
from google.genai import types
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
import pandas as pd
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception
from supabase import create_client, Client
from datetime import datetime

load_dotenv()

app = FastAPI(title="TalentIQ AI Resume Screening API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# System Date Logger
print(f"[{datetime.now().strftime('%H:%M:%S')}] Neural Engine Initialized. System Date: {datetime.now().strftime('%A, %B %d, %Y')}")

# Clients Configuration
google_api_key = os.getenv("GEMINI_API_KEY")
google_client = genai.Client(api_key=google_api_key) if google_api_key else None

hf_token = os.getenv("HUGGINGFACE_API_TOKEN")
hf_client = InferenceClient(token=hf_token) if hf_token else None

# Default Models (Verified 2026 High-Availability IDs)
GOOGLE_MODEL = os.getenv("GOOGLE_MODEL", "gemini-2.0-flash")
HF_MODEL = os.getenv("HF_MODEL", "microsoft/Phi-3-mini-4k-instruct")

# Supabase Storage Configuration
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

async def store_review(result: 'AnalysisResult', job_description: str):
    """Store the screening result in Supabase for persistence (Non-blocking)."""
    def sync_store():
        if not supabase:
            return
        try:
            data = {
                "candidate_name": result.name,
                "filename": result.filename,
                "match_score": result.score,
                "recommendation": result.recommendation,
                "reasoning": result.reasoning,
                "job_requirements": job_description[:1000], 
                "strengths": json.dumps(result.strengths),
                "gaps": json.dumps(result.gaps)
            }
            res = supabase.table("candidate_reviews").upsert(
                data, 
                on_conflict="filename"
            ).execute()
        except Exception:
            pass
            
    # Run synchronously in a thread pool to avoid blocking async event loop
    asyncio.create_task(asyncio.to_thread(sync_store))

class AnalysisResult(BaseModel):
    name: str # Candidate Name
    filename: str # Source File Name
    score: int
    strengths: List[str]
    gaps: List[str]
    recommendation: str
    reasoning: str

class ScreeningResponse(BaseModel):
    results: List[AnalysisResult]

def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing PDF: {str(e)}")

def is_retryable_error(exception):
    """Check if the error is transient and should be retried."""
    error_str = str(exception).lower()
    retryable_keywords = [
        "429", "resource_exhausted", "rate_limit", "too many requests", 
        "eof", "connection", "timeout", "protocol", "reset", "disconnected", 
        "read error", "internal error", "503", "500", "502", "504"
    ]
    return any(k in error_str for k in retryable_keywords)

@retry(
    stop=stop_after_attempt(3), # Fail fast for better UX
    wait=wait_exponential(multiplier=1, min=1, max=10), # Shorter wait windows
    retry=retry_if_exception(is_retryable_error),
    reraise=True
)
async def get_google_analysis(prompt: str) -> str:
    if not google_client:
        raise ValueError("GEMINI_API_KEY not set")
    
    # New SDK v2 call format
    response = google_client.models.generate_content(
        model=GOOGLE_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0, # Force deterministic consistency
            response_mime_type='application/json'
        )
    )
    return response.text

async def get_hf_analysis(prompt: str) -> str:
    if not hf_client:
        raise ValueError("Hugging Face API Token not set")
    
    messages = [
        {"role": "system", "content": "You are a technical recruiter. Return ONLY valid JSON."},
        {"role": "user", "content": prompt}
    ]
    
    response = hf_client.chat_completion(
        model=HF_MODEL,
        messages=messages,
        temperature=0.01, # Near-zero for stability
        max_tokens=1000,
    )
    
    text = response.choices[0].message.content
    text = text.replace("```json", "").replace("```", "").strip()
    return text

async def analyze_resume(resume_text: str, job_description: str, filename: str) -> AnalysisResult:
    current_date = datetime.now().strftime("%A, %B %d, %Y")
    prompt = f"""
    ROLE: You are an elite Technical Recruiter and AI Architect.
    DATE: {current_date}
    
    TASK: Perform a high-precision semantic match between the Candidate Resume and the Job Description.
    
    STRICT SCANNING RULES & SCORING WEIGHTS:
    1. SCORING MATRIX (Calculate out of 100):
       - Technical (50 Points): Give 50/50 if core frameworks (PyTorch/LLMs) are present.
       - Experience (30 Points): Give 30/30 for recent 2025/2026 roles.
       - Complexity (10 Points): Give 10/10 for RAG/Advanced projects.
       - Education (10 Points): Give 10/10 for related degrees.
    2. PERFECT SCORE RULE: If you find ZERO legitimate gaps, the final score MUST be between 95 and 100. Do not artificially lower the score!
    3. MANDATORY ITEMS: You MUST return exactly 3 distinct 'strengths' and a MAXIMUM of 3 'gaps' (if applicable). Do not exceed 3 bullets for either section.
    4. TEMPORAL & EDUCATION: It is {current_date} (Year 2026). You MUST treat "Expected 2025" as a "Completed" B.Tech degree. NEVER list education as a gap.
    5. FORMAT RULE (CRITICAL): Every single item in your lists MUST be formatted EXACTLY like this -> "Short Title: Description". You MUST use a colon (:).
    6. LENGTH BALANCE: Keep descriptions informative but concise. Write 1 to 2 sentences per bullet point (roughly 20-30 words).
    
    JSON FORMAT:
    {{
        "name": "Full Name",
        "score": 0-100,
        "strengths": [
            "Skill Name: Write 1 to 2 clear, descriptive sentences here explaining the candidate's expertise.",
            "Another Skill: Write another specific descriptive sentence here."
        ],
        "gaps": [
            "Missing Tool: Write gap description here."
        ],
        "recommendation": "Strong Fit / Moderate Fit / Not a Fit",
        "reasoning": "A professional summary."
    }}
    
    JOB DESCRIPTION:
    {job_description}
    
    RESUME TEXT:
    {resume_text}
    """
    
    # Strict Hugging Face Only Routing
    try:
        if not hf_client:
            raise ValueError("Hugging Face API Token not configured in environment.")
        
        print(f"Routing request exclusively to Hugging Face for {filename}...")
        response_text = await get_hf_analysis(prompt)
        
        # Brutally aggressively sanitize JSON block
        start_idx = response_text.find("{")
        end_idx = response_text.rfind("}")
        if start_idx != -1 and end_idx != -1:
            response_text = response_text[start_idx:end_idx+1]
            
        result_json = json.loads(response_text)
        result_json["filename"] = filename
        return AnalysisResult(**result_json)
        
    except Exception as hf_e:
        print(f"Hugging Face processing failed: {str(hf_e)}")
        # Instead of crashing FastAPI with a 500 error, return a pseudo-result 
        # so the Frontend UI natively displays the backend error to the user!
        return AnalysisResult(
            name="Error Parsing Resume",
            filename=filename,
            score=0,
            strengths=[f"BACKEND ERROR: {str(hf_e)}"],
            gaps=["Your GitHub Secrets might be missing or the Hugging Face AI crashed."],
            recommendation="Not a Fit",
            reasoning=f"The backend AI engine crashed before generating the report. Error details: {str(hf_e)}"
        )

@app.post("/analyze", response_model=ScreeningResponse)
async def analyze_resumes(
    job_description: str = Form(...),
    files: List[UploadFile] = File(...)
):
    async def process_file(file: UploadFile):
        if not file.filename.endswith('.pdf'):
            return None
        content = await file.read()
        resume_text = extract_text_from_pdf(content)
        analysis = await analyze_resume(resume_text, job_description, file.filename)
        # Persistent storage (fires in background)
        await store_review(analysis, job_description)
        return analysis

    # Launch all screenings simultaneously
    tasks = [process_file(f) for f in files]
    results = await asyncio.gather(*tasks)
    
    # Filter out empty/skipped and sort
    results = [r for r in results if r is not None]
    results.sort(key=lambda x: x.score, reverse=True)
    return ScreeningResponse(results=results)

@app.get("/")
def home():
    return {"message": "TalentIQ API is running (Hybrid v2 SDK)"}

@app.post("/export")
async def export_results(results: List[AnalysisResult]):
    try:
        # Create a cleaner dataframe for Excel
        data = []
        for r in results:
            data.append({
                "Candidate Name": r.name.title(),
                "Match Score (%)": r.score,
                "Recommendation": r.recommendation,
                "Key Strengths": "\n• ".join(r.strengths),
                "Identified Gaps": "\n• ".join(r.gaps),
                "Recruiter Reasoning": r.reasoning,
                "Source File": r.filename
            })
            
        df = pd.DataFrame(data)
        csv_content = df.to_csv(index=False)
        return {"csv": csv_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

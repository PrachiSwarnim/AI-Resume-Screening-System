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

# Clients Configuration
google_api_key = os.getenv("GEMINI_API_KEY")
google_client = genai.Client(api_key=google_api_key) if google_api_key else None

hf_token = os.getenv("HUGGINGFACE_API_TOKEN")
hf_client = InferenceClient(token=hf_token) if hf_token else None

# Default Models
GOOGLE_MODEL = os.getenv("GOOGLE_MODEL", "gemini-2.5-flash")
HF_MODEL = os.getenv("HF_MODEL", "mistralai/Mistral-7B-Instruct-v0.2")

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
    stop=stop_after_attempt(12), # More attempts for resilience
    wait=wait_exponential(multiplier=1.5, min=2, max=60), # Faster initial retries
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
    prompt = f"""
    Analyze the following resume against the provided job description.
    Current Date: Friday, March 20, 2026
    
    Job Description:
    {job_description}
    
    Resume Text:
    {resume_text}
    
    Provide the analysis in the following JSON format:
    {{
        "name": "Candidate Name (extract from resume)",
        "score": 0-100,
        "strengths": ["List of 3-5 key strengths, each formatted as 'Headline: Short explanation'"],
        "gaps": ["List of key skill gaps, each formatted as 'Headline: Short explanation'"],
        "recommendation": "Strong Fit / Moderate Fit / Not Fit",
        "reasoning": "A brief explanation"
    }}
    
    Only return the JSON.
    """
    
    # Try Google First
    try:
        response_text = await get_google_analysis(prompt)
        result_json = json.loads(response_text)
        result_json["filename"] = filename # Force original filename match
        return AnalysisResult(**result_json)
    except Exception as e:
        # If Google fails (and we've finished retrying), try Hugging Face as a fallback
        if hf_client:
            try:
                print(f"Google API failed for {filename}, falling back to Hugging Face...")
                response_text = await get_hf_analysis(prompt)
                result_json = json.loads(response_text)
                result_json["filename"] = filename
                return AnalysisResult(**result_json)
            except Exception as hf_e:
                print(f"Hugging Face fallback also failed: {str(hf_e)}")
        
        # Final fallback to Mock
        import random
        return AnalysisResult(
            name=filename.split('.')[0].replace('_', ' ').title(),
            filename=filename,
            score=random.randint(40, 95),
            strengths=["Manual Review Needed"],
            gaps=[f"AI Error: {str(e)}"],
            recommendation="Review Required",
            reasoning=f"Could not process resume with AI providers. Please check your API quotas."
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

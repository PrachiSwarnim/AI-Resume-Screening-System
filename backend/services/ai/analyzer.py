"""
TalentIQ AI Analysis Service
Handles all LLM inference calls (Hugging Face + Google Gemini).
"""
import json
from datetime import datetime
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception
from google.genai import types
from config import google_client, hf_client, GOOGLE_MODEL, HF_MODEL
from models.schemas import AnalysisResult


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
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception(is_retryable_error),
    reraise=True
)
async def get_google_analysis(prompt: str) -> str:
    """Call Google Gemini API for resume analysis."""
    if not google_client:
        raise ValueError("GEMINI_API_KEY not set")

    response = google_client.models.generate_content(
        model=GOOGLE_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0,
            response_mime_type='application/json'
        )
    )
    return response.text


async def get_hf_analysis(prompt: str) -> str:
    """Call Hugging Face Inference API for resume analysis."""
    if not hf_client:
        raise ValueError("Hugging Face API Token not set")
    if not HF_MODEL:
        raise ValueError("HF_MODEL secret not configured!")

    messages = [
        {"role": "system", "content": "You are a technical recruiter. Return ONLY valid JSON."},
        {"role": "user", "content": prompt}
    ]

    active_model = HF_MODEL if HF_MODEL else "microsoft/Phi-3-mini-4k-instruct"

    response = hf_client.chat_completion(
        model=active_model,
        messages=messages,
        temperature=0.01,
        max_tokens=1000,
    )

    text = response.choices[0].message.content
    text = text.replace("```json", "").replace("```", "").strip()
    return text


async def analyze_resume(resume_text: str, job_description: str, filename: str) -> AnalysisResult:
    """
    Core analysis pipeline:
    1. Construct the scoring prompt
    2. Send to Hugging Face LLM
    3. Parse + sanitize JSON response
    4. Strip hallucinated education gaps
    """
    current_date = datetime.now().strftime("%A, %B %d, %Y")
    prompt = f"""
    ROLE: You are an elite Technical Recruiter and AI Architect.
    DATE: {current_date}
    
    TASK: Perform a high-precision semantic match between the Candidate Resume and the Job Description.
    
    STRICT SCANNING RULES & SCORING WEIGHTS:
    1. SCORING MATRIX (Calculate out of 100 — BE STRICT and PRECISE):
       - Technical Skills Match (40 Points): Compare EACH specific tool/framework in the JD against the resume. Deduct points for EACH missing skill. If JD asks for 5 tools and resume has 3, score is 24/40.
       - Relevant Experience (25 Points): Award points ONLY for roles directly related to the JD. Internships = 10pts max, Full-time roles = 25pts. No relevant experience = 0.
       - Project Complexity (20 Points): Award 20/20 ONLY if candidate has deployed production systems. Personal/academic projects = 12/20 max. No projects = 0.
       - Education (15 Points): Related degree = 15/15. Unrelated degree = 5/15.
    2. DIFFERENTIATION RULE: You MUST produce different scores for different candidates. A candidate missing key JD requirements should score 60-75. A partial match should score 75-85. Only an exceptional, near-perfect match deserves 90+.
    3. MANDATORY ITEMS: You MUST return exactly 3 distinct 'strengths' and between 1-3 'gaps'. Identify real missing technical skills from the JD.
    4. GAPS MUST ONLY BE ABOUT MISSING TECHNICAL SKILLS (e.g., "Kubernetes", "GraphQL", "CI/CD Pipelines").
       - NEVER mention education, graduation, degrees, B.Tech, university, or academic status in gaps.
       - NEVER mention graduation year, completion date, or "recent graduate" in gaps.
       - Gaps are ONLY for tools, frameworks, or technologies the job requires but the resume does NOT mention.
       - If no technical skills are missing, return an EMPTY gaps list: "gaps": []
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

    try:
        if not hf_client:
            raise ValueError("Hugging Face API Token not configured in environment.")

        print(f"Routing request exclusively to Hugging Face for {filename}...")
        response_text = await get_hf_analysis(prompt)

        # Aggressively sanitize JSON block
        start_idx = response_text.find("{")
        end_idx = response_text.rfind("}")
        if start_idx != -1 and end_idx != -1:
            response_text = response_text[start_idx:end_idx + 1]

        result_json = json.loads(response_text)
        result_json["filename"] = filename

        # POST-PROCESSING: Strip any education/graduation gaps
        banned_keywords = ["education", "graduation", "graduate", "degree", "b.tech", "university", "academic", "college", "completed in"]
        if "gaps" in result_json:
            result_json["gaps"] = [
                gap for gap in result_json["gaps"]
                if not any(kw in gap.lower() for kw in banned_keywords)
            ]

        return AnalysisResult(**result_json)

    except Exception as hf_e:
        print(f"Hugging Face processing failed: {str(hf_e)}")
        return AnalysisResult(
            name="Error Parsing Resume",
            filename=filename,
            score=0,
            strengths=[f"BACKEND ERROR: {str(hf_e)}"],
            gaps=["Your GitHub Secrets might be missing or the Hugging Face AI crashed."],
            recommendation="Not a Fit",
            reasoning=f"The backend AI engine crashed before generating the report. Error details: {str(hf_e)}"
        )

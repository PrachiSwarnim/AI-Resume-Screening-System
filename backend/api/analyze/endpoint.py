"""
TalentIQ — Resume Analysis Endpoint
Core screening pipeline: PDF → Vector Search → LLM → Hybrid Blend → Rank
"""
import asyncio
from typing import List
from fastapi import APIRouter, UploadFile, File, Form

from models.schemas import ScreeningResponse
from services.pdf import extract_text_from_pdf
from services.vector import compute_vector_similarity
from services.ai import analyze_resume
from services.storage import store_review

router = APIRouter()


@router.post("/analyze", response_model=ScreeningResponse)
async def analyze_resumes(
    job_description: str = Form(...),
    files: List[UploadFile] = File(...)
):
    """
    Main screening endpoint.
    Pipeline: PDF Extract → Vector Search → LLM Analysis → Hybrid Blend → Rank
    """
    async def process_file(file: UploadFile):
        if not file.filename.endswith('.pdf'):
            return None
        content = await file.read()
        resume_text = extract_text_from_pdf(content)

        # Stage 1: Vector Search — TF-IDF Cosine Similarity
        vector_score = compute_vector_similarity(resume_text, job_description)

        # Stage 2: LLM Deep Analysis
        analysis = await analyze_resume(resume_text, job_description, file.filename)

        # Stage 3: Hybrid Score Blending (70% LLM + 30% Vector)
        analysis.vector_score = vector_score
        blended = int(round(analysis.score * 0.7 + vector_score * 0.3))
        analysis.score = max(0, min(100, blended))

        # Persistent storage (fires in background)
        await store_review(analysis, job_description)
        return analysis

    tasks = [process_file(f) for f in files]
    results = await asyncio.gather(*tasks)

    results = [r for r in results if r is not None]
    results.sort(key=lambda x: x.score, reverse=True)
    return ScreeningResponse(results=results)

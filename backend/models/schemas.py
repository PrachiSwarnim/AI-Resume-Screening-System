"""
TalentIQ Pydantic Models (Schemas)
Data validation models for API requests and responses.
"""
from typing import List, Optional
from pydantic import BaseModel


class AnalysisResult(BaseModel):
    name: str           # Candidate Name
    filename: str       # Source File Name
    score: int
    vector_score: Optional[int] = None  # TF-IDF Cosine Similarity %
    strengths: List[str]
    gaps: List[str]
    recommendation: str
    reasoning: str


class ScreeningResponse(BaseModel):
    results: List[AnalysisResult]

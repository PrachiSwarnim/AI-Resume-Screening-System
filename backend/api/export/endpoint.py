"""
TalentIQ — Export Endpoint
Converts screening results to CSV for download.
"""
from typing import List
from fastapi import APIRouter, HTTPException
import pandas as pd

from models.schemas import AnalysisResult

router = APIRouter()


@router.post("/export")
async def export_results(results: List[AnalysisResult]):
    """Export screening results as CSV."""
    try:
        data = []
        for r in results:
            data.append({
                "Candidate Name": r.name.title(),
                "Match Score (%)": r.score,
                "Vector Score (%)": r.vector_score,
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

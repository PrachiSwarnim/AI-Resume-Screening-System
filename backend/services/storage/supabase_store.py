"""
TalentIQ Storage Service
Handles Supabase persistence for screening results.
"""
import json
import asyncio
from config import supabase


async def store_review(result, job_description: str):
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
            supabase.table("candidate_reviews").upsert(
                data,
                on_conflict="filename"
            ).execute()
        except Exception:
            pass

    asyncio.create_task(asyncio.to_thread(sync_store))

"""
TalentIQ — Health Check Endpoint
Simple status verification for monitoring and uptime checks.
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def home():
    """Health check endpoint."""
    return {"message": "TalentIQ API is running (Hybrid v3 — Modular Architecture)"}

"""
TalentIQ — Central API Router
Aggregates all individual route modules into a single mountable router.
"""
from fastapi import APIRouter
from api.analyze import router as analyze_router
from api.export import router as export_router
from api.health import router as health_router

router = APIRouter()

# Mount all route modules
router.include_router(health_router, tags=["Health"])
router.include_router(analyze_router, tags=["Analysis"])
router.include_router(export_router, tags=["Export"])

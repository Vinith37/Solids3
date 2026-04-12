"""
Beams analysis route — CPU-heavy, stays synchronous.
Rate limited to 30/minute. Auth at router level.
"""
from fastapi import APIRouter, Request, Depends
from slowapi import Limiter
from ..models.schemas import BeamsInput
from ..services.calculations import compute_beams
from ..auth import verify_firebase_token

router = APIRouter(
    dependencies=[Depends(verify_firebase_token)]
)


@router.post("/api/beams")
def calc_beams(data: BeamsInput, request: Request):
    return compute_beams(data)

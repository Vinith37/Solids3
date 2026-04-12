"""
Fatigue analysis route — CPU-heavy, stays synchronous.
Rate limited to 30/minute. Auth at router level.
"""
from fastapi import APIRouter, Request, Depends
from ..models.schemas import FatigueInput
from ..services.calculations import compute_fatigue
from ..auth import verify_firebase_token

router = APIRouter(
    dependencies=[Depends(verify_firebase_token)]
)


@router.post("/api/fatigue")
def calc_fatigue(data: FatigueInput, request: Request):
    return compute_fatigue(data)

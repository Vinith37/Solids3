"""
Mohr Circle analysis route — CPU-heavy, stays synchronous.
Auth at router level.
"""
from fastapi import APIRouter, Request, Depends
from ..models.schemas import MohrCircleInput
from ..services.calculations import compute_mohr_circle
from ..auth import verify_firebase_token

router = APIRouter(
    dependencies=[Depends(verify_firebase_token)]
)


@router.post("/api/mohr-circle")
def calc_mohr_circle(data: MohrCircleInput, request: Request):
    return compute_mohr_circle(data)

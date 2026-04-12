"""
Column buckling analysis route — CPU-heavy, stays synchronous.
Auth at router level.
"""
from fastapi import APIRouter, Request, Depends
from ..models.schemas import BucklingInput
from ..services.calculations import compute_buckling
from ..auth import verify_firebase_token

router = APIRouter(
    dependencies=[Depends(verify_firebase_token)]
)


@router.post("/api/buckling")
def calc_buckling(data: BucklingInput, request: Request):
    return compute_buckling(data)

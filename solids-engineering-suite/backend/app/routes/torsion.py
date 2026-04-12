"""
Torsion analysis route — CPU-heavy, stays synchronous.
Auth at router level.
"""
from fastapi import APIRouter, Request, Depends
from ..models.schemas import TorsionInput
from ..services.calculations import compute_torsion
from ..auth import verify_firebase_token

router = APIRouter(
    dependencies=[Depends(verify_firebase_token)]
)


@router.post("/api/torsion")
def calc_torsion(data: TorsionInput, request: Request):
    return compute_torsion(data)

"""
Thin cylinder analysis route — CPU-heavy, stays synchronous.
Auth at router level.
"""
from fastapi import APIRouter, Request, Depends
from ..models.schemas import ThinCylinderInput
from ..services.calculations import compute_thin_cylinder
from ..auth import verify_firebase_token

router = APIRouter(
    dependencies=[Depends(verify_firebase_token)]
)


@router.post("/api/thin-cylinder")
def calc_thin_cylinder(data: ThinCylinderInput, request: Request):
    return compute_thin_cylinder(data)

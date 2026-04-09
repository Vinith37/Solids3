from fastapi import APIRouter
from ..models.schemas import MohrCircleInput
from ..services.calculations import compute_mohr_circle

router = APIRouter()

@router.post("/api/mohr-circle")
def calc_mohr_circle(data: MohrCircleInput):
    return compute_mohr_circle(data)

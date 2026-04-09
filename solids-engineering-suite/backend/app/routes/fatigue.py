from fastapi import APIRouter
from ..models.schemas import FatigueInput
from ..services.calculations import compute_fatigue

router = APIRouter()

@router.post("/api/fatigue")
def calc_fatigue(data: FatigueInput):
    return compute_fatigue(data)

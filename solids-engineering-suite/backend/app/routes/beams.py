from fastapi import APIRouter
from ..models.schemas import BeamsInput
from ..services.calculations import compute_beams

router = APIRouter()

@router.post("/api/beams")
def calc_beams(data: BeamsInput):
    return compute_beams(data)

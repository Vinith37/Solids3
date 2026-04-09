from fastapi import APIRouter
from ..models.schemas import BucklingInput
from ..services.calculations import compute_buckling

router = APIRouter()

@router.post("/api/buckling")
def calc_buckling(data: BucklingInput):
    return compute_buckling(data)

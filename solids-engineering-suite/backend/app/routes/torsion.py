from fastapi import APIRouter
from ..models.schemas import TorsionInput
from ..services.calculations import compute_torsion

router = APIRouter()

@router.post("/api/torsion")
def calc_torsion(data: TorsionInput):
    return compute_torsion(data)

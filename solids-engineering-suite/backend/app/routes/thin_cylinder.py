from fastapi import APIRouter
from ..models.schemas import ThinCylinderInput
from ..services.calculations import compute_thin_cylinder

router = APIRouter()

@router.post("/api/thin-cylinder")
def calc_thin_cylinder(data: ThinCylinderInput):
    return compute_thin_cylinder(data)

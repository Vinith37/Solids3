from fastapi import APIRouter
from ..models.schemas import DynamicInput
from ..services.calculations import compute_dynamic_loading

router = APIRouter()

@router.post("/api/dynamic-loading")
def calc_dynamic(data: DynamicInput):
    return compute_dynamic_loading(data)

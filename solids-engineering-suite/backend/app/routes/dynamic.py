"""
Dynamic loading analysis route — CPU-heavy, stays synchronous.
Auth at router level.
"""
from fastapi import APIRouter, Request, Depends
from ..models.schemas import DynamicInput
from ..services.calculations import compute_dynamic_loading
from ..auth import verify_firebase_token

router = APIRouter(
    dependencies=[Depends(verify_firebase_token)]
)


@router.post("/api/dynamic-loading")
def calc_dynamic(data: DynamicInput, request: Request):
    return compute_dynamic_loading(data)

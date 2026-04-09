from fastapi import APIRouter
from ..models.schemas import FailureTheoriesInput
from ..services.calculations import compute_failure_theories

router = APIRouter()

@router.post("/api/failure-theories")
def calc_failure_theories(data: FailureTheoriesInput):
    return compute_failure_theories(data)

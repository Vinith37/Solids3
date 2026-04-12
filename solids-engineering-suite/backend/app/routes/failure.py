"""
Failure theories analysis route — CPU-heavy, stays synchronous.
Auth at router level.
"""
from fastapi import APIRouter, Request, Depends
from ..models.schemas import FailureTheoriesInput
from ..services.calculations import compute_failure_theories
from ..auth import verify_firebase_token

router = APIRouter(
    dependencies=[Depends(verify_firebase_token)]
)


@router.post("/api/failure-theories")
def calc_failure_theories(data: FailureTheoriesInput, request: Request):
    return compute_failure_theories(data)

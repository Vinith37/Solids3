"""
Routes for saved calculation CRUD operations.

Async handlers with Firestore I/O and timeout protection.
Auth enforced at router level via Depends(verify_firebase_token).
"""
import asyncio
from fastapi import APIRouter, Request, Depends
from ..models.schemas import CalculationState
from ..services import persistence
from ..auth import verify_firebase_token

router = APIRouter(
    dependencies=[Depends(verify_firebase_token)]
)

REQUEST_TIMEOUT = 5  # seconds


@router.get("/api/recent-calculations")
async def get_recent_calculations(request: Request):
    return await asyncio.wait_for(
        persistence.list_calculations(), timeout=REQUEST_TIMEOUT
    )


@router.post("/api/save-calculation")
async def save_calculation(calc: CalculationState, request: Request):
    return await asyncio.wait_for(
        persistence.save_calculation(calc), timeout=REQUEST_TIMEOUT
    )


@router.get("/api/load-calculation/{id}")
async def load_calculation(id: str, request: Request):
    return await asyncio.wait_for(
        persistence.load_calculation(id), timeout=REQUEST_TIMEOUT
    )


@router.delete("/api/delete-calculation/{id}")
async def delete_calculation(id: str, request: Request):
    return await asyncio.wait_for(
        persistence.delete_calculation(id), timeout=REQUEST_TIMEOUT
    )


@router.delete("/api/clear-calculations")
async def clear_calculations(request: Request):
    return await asyncio.wait_for(
        persistence.clear_calculations(), timeout=REQUEST_TIMEOUT
    )

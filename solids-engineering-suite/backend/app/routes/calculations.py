"""
Routes for saved calculation CRUD operations.
"""
from fastapi import APIRouter
from ..models.schemas import CalculationState
from ..services import persistence

router = APIRouter()


@router.get("/api/recent-calculations")
def get_recent_calculations():
    return persistence.list_calculations()


@router.post("/api/save-calculation")
def save_calculation(calc: CalculationState):
    return persistence.save_calculation(calc)


@router.get("/api/load-calculation/{id}")
def load_calculation(id: str):
    return persistence.load_calculation(id)


@router.delete("/api/delete-calculation/{id}")
def delete_calculation(id: str):
    return persistence.delete_calculation(id)


@router.delete("/api/clear-calculations")
def clear_calculations():
    return persistence.clear_calculations()

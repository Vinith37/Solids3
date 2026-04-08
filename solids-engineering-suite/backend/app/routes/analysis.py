"""
Routes for all engineering analysis endpoints.
"""
from fastapi import APIRouter
from ..models.schemas import (
    FatigueInput, FailureTheoriesInput, MohrCircleInput,
    TorsionInput, DynamicInput, BeamsInput,
    ThinCylinderInput, BucklingInput,
)
from ..services.calculations import (
    compute_fatigue, compute_failure_theories, compute_mohr_circle,
    compute_torsion, compute_dynamic_loading, compute_beams,
    compute_thin_cylinder, compute_buckling,
)

router = APIRouter()


@router.post("/api/fatigue")
def calc_fatigue(data: FatigueInput):
    return compute_fatigue(data)


@router.post("/api/failure-theories")
def calc_failure_theories(data: FailureTheoriesInput):
    return compute_failure_theories(data)


@router.post("/api/mohr-circle")
def calc_mohr_circle(data: MohrCircleInput):
    return compute_mohr_circle(data)


@router.post("/api/torsion")
def calc_torsion(data: TorsionInput):
    return compute_torsion(data)


@router.post("/api/dynamic-loading")
def calc_dynamic(data: DynamicInput):
    return compute_dynamic_loading(data)


@router.post("/api/beams")
def calc_beams(data: BeamsInput):
    return compute_beams(data)


@router.post("/api/thin-cylinder")
def calc_thin_cylinder(data: ThinCylinderInput):
    return compute_thin_cylinder(data)


@router.post("/api/buckling")
def calc_buckling(data: BucklingInput):
    return compute_buckling(data)

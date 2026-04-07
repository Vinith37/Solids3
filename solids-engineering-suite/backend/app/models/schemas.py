"""
Pydantic models (schemas) for all API request/response payloads.
"""
from pydantic import BaseModel
from typing import List, Optional, Any


# --- Calculations Persistence ---

class CalculationState(BaseModel):
    id: Optional[str] = None
    name: str
    type: str  # 'Fatigue', 'Beams', 'Failure Theories', etc.
    module: str  # the path/type identifier
    timestamp: Optional[str] = None
    state: Any  # The actual JSON state object


# --- Fatigue ---

class FatigueInput(BaseModel):
    su: float
    sy: float
    se: float
    sm: float
    sa: float


# --- Failure Theories ---

class FailureTheoriesInput(BaseModel):
    sigmaX: float
    sigmaY: float
    tauXY: float
    sy: float


# --- Mohr Circle ---

class MohrCircleInput(BaseModel):
    is3D: bool
    sigmaX: float
    sigmaY: float
    sigmaZ: float
    tauXY: float


# --- Torsion ---

class TorsionInput(BaseModel):
    section: str
    torque: float
    length: float
    modulus: float
    d1: float
    d2: float


# --- Dynamic Loading ---

class DynamicInput(BaseModel):
    mass: float
    height: float
    stiffness: float


# --- Beams ---

class BeamLoad(BaseModel):
    id: str
    type: str  # point, udl, uvl
    position: float
    length: float
    magnitude: float
    endMagnitude: float


class BeamsInput(BaseModel):
    length: float
    modulus: float
    inertia: float
    beamType: str  # simply_supported | cantilever
    supportA: float
    supportB: float
    loads: List[BeamLoad]


# --- Materials ---

class Material(BaseModel):
    name: str
    category: str
    density: float  # kg/m^3
    modulus: float  # GPa
    strength: float  # MPa
    poisson: float
    thermalExpansion: float  # 10^-6/K
    cost: float  # $/kg

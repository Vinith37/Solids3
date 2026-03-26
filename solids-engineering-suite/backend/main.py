from fastapi import FastAPI
from pydantic import BaseModel
import math
import json
import os
import uuid
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Literal, Optional, Any

USE_FIRESTORE = os.environ.get("USE_FIRESTORE", "false").lower() in ("1", "true", "yes")
FIRESTORE_COLLECTION_NAME = os.environ.get("FIRESTORE_COLLECTION", "savedCalculations")
FIRESTORE_CLIENT = None
FIRESTORE_COLLECTION = None
FIRESTORE_MODULE = None

if USE_FIRESTORE:
    try:
        from google.cloud import firestore
    except ImportError as exc:
        raise RuntimeError("google-cloud-firestore is required when USE_FIRESTORE is enabled") from exc
    FIRESTORE_MODULE = firestore
    FIRESTORE_CLIENT = firestore.Client()
    FIRESTORE_COLLECTION = FIRESTORE_CLIENT.collection(FIRESTORE_COLLECTION_NAME)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Persistence Layer ---
STORAGE_FILE = "saved_calculations.json"

class CalculationState(BaseModel):
    id: Optional[str] = None
    name: str
    type: str # 'Fatigue', 'Beams', 'Failure Theories', etc.
    module: str # the path/type identifier
    timestamp: Optional[str] = None
    state: Any # The actual JSON state object

saved_calculations: List[CalculationState] = []

def load_from_disk():
    global saved_calculations
    if os.path.exists(STORAGE_FILE):
        try:
            with open(STORAGE_FILE, "r") as f:
                data = json.load(f)
                saved_calculations = [CalculationState(**item) for item in data]
        except Exception as e:
            print(f"Error loading calculations: {e}")
            saved_calculations = []

def save_to_disk():
    try:
        with open(STORAGE_FILE, "w") as f:
            json.dump([item.model_dump() for item in saved_calculations], f)
    except Exception as e:
        print(f"Error saving calculations: {e}")

if not USE_FIRESTORE:
    load_from_disk()


def _local_recent_calculations():
    results = []
    for calc in reversed(saved_calculations):
        results.append({
            "id": calc.id,
            "name": calc.name,
            "type": calc.type,
            "module": calc.module,
            "timestamp": calc.timestamp
        })
    return results


def _build_firestore_summary(doc):
    data = doc.to_dict() or {}
    return {
        "id": doc.id,
        "name": data.get("name"),
        "type": data.get("type"),
        "module": data.get("module"),
        "timestamp": data.get("timestamp")
    }


def _firestore_recent_calculations():
    if not FIRESTORE_COLLECTION or not FIRESTORE_MODULE:
        return []
    results = []
    try:
        query = FIRESTORE_COLLECTION.order_by("timestamp", direction=FIRESTORE_MODULE.Query.DESCENDING)
        for doc in query.stream():
            results.append(_build_firestore_summary(doc))
    except Exception as e:
        print(f"Error reading calculations from Firestore: {e}")
    return results

@app.get("/api/recent-calculations")
def get_recent_calculations():
    return _firestore_recent_calculations() if USE_FIRESTORE else _local_recent_calculations()

@app.post("/api/save-calculation")
def save_calculation(calc: CalculationState):
    calc_id = calc.id or str(uuid.uuid4())
    calc.id = calc_id
    calc.timestamp = calc.timestamp or datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if USE_FIRESTORE and FIRESTORE_COLLECTION:
        data = calc.model_dump(exclude_none=True)
        try:
            FIRESTORE_COLLECTION.document(calc_id).set(data)
        except Exception as e:
            print(f"Error saving calculation to Firestore: {e}")
            return {"status": "error", "message": "Failed to save calculation to Firestore"}
        return {"status": "success", "id": calc_id}

    saved_calculations.append(calc)
    save_to_disk()
    return {"status": "success", "id": calc_id}

@app.get("/api/load-calculation/{id}")
def load_calculation(id: str):
    if USE_FIRESTORE and FIRESTORE_COLLECTION:
        try:
            doc = FIRESTORE_COLLECTION.document(id).get()
        except Exception as e:
            print(f"Error loading calculation from Firestore: {e}")
            return {"error": "Calculation not found"}
        if not doc.exists:
            return {"error": "Calculation not found"}
        data = doc.to_dict() or {}
        data["id"] = doc.id
        return data

    for calc in saved_calculations:
        if calc.id == id:
            return calc
    return {"error": "Calculation not found"}

@app.delete("/api/delete-calculation/{id}")
def delete_calculation(id: str):
    if USE_FIRESTORE and FIRESTORE_COLLECTION:
        try:
            FIRESTORE_COLLECTION.document(id).delete()
        except Exception as e:
            print(f"Error deleting calculation from Firestore: {e}")
        return {"status": "deleted"}

    global saved_calculations
    saved_calculations = [c for c in saved_calculations if c.id != id]
    save_to_disk()
    return {"status": "deleted"}

@app.delete("/api/clear-calculations")
def clear_calculations():
    if USE_FIRESTORE and FIRESTORE_COLLECTION and FIRESTORE_CLIENT:
        try:
            batch = FIRESTORE_CLIENT.batch()
            for doc in FIRESTORE_COLLECTION.stream():
                batch.delete(doc.reference)
            batch.commit()
        except Exception as e:
            print(f"Error clearing Firestore collection: {e}")
        return {"status": "cleared"}

    global saved_calculations
    saved_calculations = []
    save_to_disk()
    return {"status": "cleared"}

# --- Materials Database ---
class Material(BaseModel):
    name: str
    category: str
    density: float # kg/m^3
    modulus: float # GPa
    strength: float # MPa
    poisson: float
    thermalExpansion: float # 10^-6/K
    cost: float # $/kg

materials_db = [
    {"name": "Steel (AISI 1020)", "category": "Metals", "density": 7850, "modulus": 200, "strength": 350, "poisson": 0.29, "thermalExpansion": 11.7, "cost": 0.8},
    {"name": "Steel (AISI 4140)", "category": "Metals", "density": 7850, "modulus": 205, "strength": 655, "poisson": 0.29, "thermalExpansion": 12.3, "cost": 1.2},
    {"name": "Aluminum (6061-T6)", "category": "Metals", "density": 2700, "modulus": 70, "strength": 270, "poisson": 0.33, "thermalExpansion": 23.6, "cost": 2.5},
    {"name": "Aluminum (7075-T6)", "category": "Metals", "density": 2810, "modulus": 71, "strength": 503, "poisson": 0.33, "thermalExpansion": 23.2, "cost": 4.5},
    {"name": "Titanium (Ti-6Al-4V)", "category": "Metals", "density": 4430, "modulus": 114, "strength": 880, "poisson": 0.34, "thermalExpansion": 8.6, "cost": 30},
    {"name": "Copper (C11000)", "category": "Metals", "density": 8960, "modulus": 115, "strength": 220, "poisson": 0.34, "thermalExpansion": 16.9, "cost": 8},
    {"name": "CFRP (High Modulus)", "category": "Composites", "density": 1600, "modulus": 200, "strength": 1200, "poisson": 0.3, "thermalExpansion": -0.5, "cost": 80},
    {"name": "GFRP (E-glass)", "category": "Composites", "density": 2000, "modulus": 45, "strength": 1000, "poisson": 0.25, "thermalExpansion": 6, "cost": 15},
    {"name": "Polycarbonate", "category": "Polymers", "density": 1200, "modulus": 2.4, "strength": 70, "poisson": 0.37, "thermalExpansion": 65, "cost": 4},
    {"name": "ABS", "category": "Polymers", "density": 1050, "modulus": 2.3, "strength": 40, "poisson": 0.35, "thermalExpansion": 90, "cost": 2},
    {"name": "Silicon Carbide", "category": "Ceramics", "density": 3100, "modulus": 450, "strength": 600, "poisson": 0.14, "thermalExpansion": 4, "cost": 50},
    {"name": "Alumina", "category": "Ceramics", "density": 3900, "modulus": 380, "strength": 300, "poisson": 0.22, "thermalExpansion": 8.1, "cost": 20},
    {"name": "Oak Wood", "category": "Natural", "density": 750, "modulus": 12, "strength": 50, "poisson": 0.3, "thermalExpansion": 5, "cost": 1.5},
    {"name": "Balsa Wood", "category": "Natural", "density": 150, "modulus": 3, "strength": 10, "poisson": 0.3, "thermalExpansion": 5, "cost": 10},
]

@app.get("/api/materials")
def get_materials(search: Optional[str] = "", category: Optional[str] = "All"):
    results = materials_db
    if category != "All":
        results = [m for m in results if m["category"] == category]
    if search:
        results = [m for m in results if search.lower() in m["name"].lower() or search.lower() in m["category"].lower()]
    return results

@app.get("/api/material-categories")
def get_material_categories():
    cats = sorted(list(set(m["category"] for m in materials_db)))
    return ["All"] + cats

# --- Fatigue Analysis ---
class FatigueInput(BaseModel):
    su: float
    sy: float
    se: float
    sm: float
    sa: float

@app.post("/api/fatigue")
def calc_fatigue(data: FatigueInput):
    su, sy, se, sm, sa = data.su, data.sy, data.se, data.sm, data.sa
    if se == 0 or su == 0 or sy == 0:
        return {"nG": 0, "nS": 0, "nGerber": 0, "isSafe": False}
    denomG = (sa / se) + (sm / su)
    nG = 1.0 / denomG if denomG != 0 else float('inf')
    denomS = (sa / se) + (sm / sy)
    nS = 1.0 / denomS if denomS != 0 else float('inf')
    a = (sm / su) ** 2
    b = sa / se
    c = -1
    if a == 0:
        nGerber = 1.0 / b if b != 0 else float('inf')
    else:
        disc = b**2 - 4*a*c
        nGerber = (-b + math.sqrt(disc)) / (2*a) if disc >= 0 else 0
    return {"nG": round(nG, 2), "nS": round(nS, 2), "nGerber": round(nGerber, 2), "isSafe": nG >= 1.0}

# --- Failure Theories ---
class FailureTheoriesInput(BaseModel):
    sigmaX: float
    sigmaY: float
    tauXY: float
    sy: float

@app.post("/api/failure-theories")
def calc_failure_theories(data: FailureTheoriesInput):
    avg = (data.sigmaX + data.sigmaY) / 2
    R = math.sqrt(((data.sigmaX - data.sigmaY) / 2)**2 + data.tauXY**2)
    s1, s2 = avg + R, avg - R
    vm = math.sqrt(s1**2 - s1*s2 + s2**2)
    nVm = data.sy / vm if vm != 0 else float('inf')
    mS = max(abs(s1-s2)/2, abs(s1)/2, abs(s2)/2)
    nTr = (data.sy/2) / mS if mS != 0 else float('inf')
    maxS = max(abs(s1), abs(s2))
    nRa = data.sy / maxS if maxS != 0 else float('inf')
    return {"sigma1": round(s1, 2), "sigma2": round(s2, 2), "vonMisesStress": vm, "nVonMises": nVm, "nTresca": nTr, "nRankine": nRa, "isSafe": nVm >= 1}

# --- Mohr Circle ---
class MohrCircleInput(BaseModel):
    is3D: bool
    sigmaX: float
    sigmaY: float
    sigmaZ: float
    tauXY: float

@app.post("/api/mohr-circle")
def calc_mohr_circle(data: MohrCircleInput):
    avgXY = (data.sigmaX + data.sigmaY) / 2
    rXY = math.sqrt(((data.sigmaX - data.sigmaY) / 2)**2 + data.tauXY**2)
    s1_xy, s2_xy = avgXY + rXY, avgXY - rXY
    s3 = data.sigmaZ if data.is3D else 0
    p1, p2, p3 = sorted([s1_xy, s2_xy, s3], reverse=True)
    absMax = (p1 - p3) / 2
    thetaP = 0.5 * math.atan2(data.tauXY, (data.sigmaX - data.sigmaY)/2)
    return {"avg": avgXY, "radius": rXY, "sigma1": s1_xy, "sigma2": s2_xy, "p1": p1, "p2": p2, "p3": p3, "absMaxShear": absMax, "twoThetaPRad": thetaP*2, "thetaP": thetaP*180/math.pi}

# --- Torsion ---
class TorsionInput(BaseModel):
    section: str
    torque: float
    length: float
    modulus: float
    d1: float
    d2: float

@app.post("/api/torsion")
def calc_torsion(data: TorsionInput):
    G, T, L = data.modulus * 1e9, data.torque, data.length
    J, maxS = 0, 0
    if data.section == 'solid-circular':
        r = data.d1 / 2000
        J = (math.pi * r**4) / 2
        maxS = (T * r) / J if J != 0 else 0
    elif data.section == 'hollow-circular':
        ro, ri = data.d1 / 2000, data.d2 / 2000
        J = (math.pi * (ro**4 - ri**4)) / 2
        maxS = (T * ro) / J if J != 0 else 0
    elif data.section == 'rectangular':
        a, b = max(data.d1, data.d2)/1000, min(data.d1, data.d2)/1000
        J = 0.208 * a * (b**3)
        maxS = T / (0.208 * a * (b**2)) if (a*b) != 0 else 0
    phi = (T * L) / (G * J) if (G * J) != 0 else 0
    return {"maxShear": maxS / 1e6, "angleRad": phi, "angleDeg": phi * 180 / math.pi, "J": J * 1e8}

# --- Dynamic Loading ---
class DynamicInput(BaseModel):
    mass: float
    height: float
    stiffness: float

@app.post("/api/dynamic-loading")
def calc_dynamic(data: DynamicInput):
    g = 9.81
    W = data.mass * g
    ds = W / data.stiffness if data.stiffness != 0 else 0
    ni = 1 + math.sqrt(1 + (2 * data.height) / ds) if ds != 0 else 2
    df = W * ni
    fn = math.sqrt(data.stiffness / data.mass) / (2 * math.pi) if data.mass != 0 else 0
    return {"deltaSt": ds * 1000, "impactFactor": ni, "dynamicForce": df, "fn": fn}

# --- Beams ---
class BeamLoad(BaseModel):
    id: str
    type: str # point, udl, uvl
    position: float
    length: float
    magnitude: float
    endMagnitude: float

class BeamsInput(BaseModel):
    length: float
    modulus: float
    inertia: float
    beamType: str # simply_supported | cantilever
    supportA: float
    supportB: float
    loads: List[BeamLoad]

@app.post("/api/beams")
def calc_beams(data: BeamsInput):
    span = data.supportB - data.supportA
    if data.beamType == 'simply_supported' and span <= 0: return None
    sumP, sumPx = 0, 0
    for l in data.loads:
        P, d = 0, 0
        base = data.supportA if data.beamType == 'simply_supported' else 0
        if l.type == 'point': 
            P, d = l.magnitude, l.position - base
        elif l.type == 'udl': 
            P, d = l.magnitude * l.length, l.position + l.length/2 - base
        elif l.type == 'uvl':
            Pr, dr = l.magnitude * l.length, l.position + l.length/2 - base
            Pt, dt = 0.5 * (l.endMagnitude - l.magnitude) * l.length, l.position + (2/3)*l.length - base
            P, d = Pr + Pt, 0 if (Pr+Pt) == 0 else (Pr*dr + Pt*dt)/(Pr+Pt)
        sumP += P
        sumPx += P * d
    Rb = sumPx / span if data.beamType == 'simply_supported' else 0
    Ra, Ma = sumP - Rb, 0 if data.beamType == 'simply_supported' else sumPx
    pts = 101
    step = data.length / (pts - 1)
    V_a, M_a = [], []
    maxM, maxMX = 0, 0
    for i in range(pts):
        x = i * step
        V, M = 0, 0
        if data.beamType == 'simply_supported':
            if x > data.supportA: V, M = V+Ra, M+Ra*(x-data.supportA)
            if x > data.supportB: V, M = V+Rb, M+Rb*(x-data.supportB)
        else:
            if x >= 0: V, M = V+Ra, M+Ra*x-Ma
        for l in data.loads:
            if x > l.position:
                if l.type == 'point': V, M = V-l.magnitude, M-l.magnitude*(x-l.position)
                elif l.type == 'udl':
                    ld = min(x - l.position, l.length)
                    lp = l.magnitude * ld
                    V, M = V-lp, M-lp*(x-(l.position+ld/2))
                elif l.type == 'uvl':
                    ld = min(x - l.position, l.length)
                    curW = l.magnitude + (l.endMagnitude - l.magnitude) * (ld/l.length) if l.length > 0 else l.magnitude
                    Pr, Pt = l.magnitude * ld, 0.5 * (curW - l.magnitude) * ld
                    V, M = V-(Pr+Pt), M-Pr*(x-(l.position+ld/2))-Pt*(x-(l.position+(2/3)*ld))
        if data.beamType == 'simply_supported':
            if abs(x-data.supportA)<1e-4: V+=Ra
            if abs(x-data.supportB)<1e-4: V+=Rb
        else:
            if abs(x)<1e-4: V+=Ra
        V_a.append(V)
        M_a.append(M)
        if abs(M) > abs(maxM): maxM, maxMX = M, x
    EI = data.modulus * data.inertia * 0.01
    theta, y_u = [0], [0]
    for i in range(1, pts):
        theta.append(theta[i-1] + (M_a[i-1]+M_a[i])/2*step)
        y_u.append(y_u[i-1] + (theta[i-1]+theta[i])/2*step)
    C1, C2 = 0, 0
    if data.beamType == 'simply_supported':
        iA, iB = round(data.supportA/data.length*(pts-1)), round(data.supportB/data.length*(pts-1))
        if data.supportA != data.supportB: C1 = (y_u[iB]-y_u[iA])/(data.supportA-data.supportB)
        C2 = -y_u[iA] - C1*data.supportA
    res = []
    maxD, maxDX = 0, 0
    for i in range(pts):
        x = i * step
        defl = ((y_u[i]+C1*x+C2)/EI)*1000 if EI != 0 else 0
        if abs(defl) > abs(maxD): maxD, maxDX = defl, x
        res.append({"x":round(x,2), "V":round(V_a[i],2), "M":round(M_a[i],2), "D":round(defl,3)})
    return {"Ra":Ra, "Rb":Rb, "Ma":Ma, "span":span, "data":res, "C1":C1, "C2":C2, "EI":EI, "sumPx_A":sumPx, "sumP":sumP, "maxDeflection":maxD, "maxDefX":maxDX, "maxMoment":maxM, "maxMomentX":maxMX, "sortedLoads":sorted([l.model_dump() for l in data.loads], key=lambda x:x["position"])}

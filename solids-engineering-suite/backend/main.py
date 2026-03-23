from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Literal, Optional
import math
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Failure Theories (Fatigue) ---
class FatigueInput(BaseModel):
    su: float
    sy: float
    se: float
    sm: float
    sa: float

@app.post("/api/fatigue")
def calc_fatigue(data: FatigueInput):
    su = data.su
    sy = data.sy
    se = data.se
    sm = data.sm
    sa = data.sa
    
    # Avoid zero division
    if se == 0 or su == 0 or sy == 0:
        return {"nG": 0, "nS": 0, "nGerber": 0, "isSafe": False}
        
    denomG = (sa / se) + (sm / su)
    nG = 1.0 / denomG if denomG != 0 else float('inf')
    
    denomS = (sa / se) + (sm / sy)
    nS = 1.0 / denomS if denomS != 0 else float('inf')
    
    # Gerber Quadratic
    a = (sm / su) ** 2
    b = sa / se
    c = -1
    
    if a == 0:
        nGerber = 1.0 / b if b != 0 else float('inf')
    else:
        nGerber = (-b + math.sqrt(b**2 - 4*a*c)) / (2*a)
        
    return {
        "nG": round(nG, 2),
        "nS": round(nS, 2),
        "nGerber": round(nGerber, 2),
        "isSafe": nG >= 1.0
    }

# --- Failure Theories (Static) ---
class FailureTheoriesInput(BaseModel):
    sigmaX: float
    sigmaY: float
    tauXY: float
    sy: float

@app.post("/api/failure-theories")
def calc_failure_theories(data: FailureTheoriesInput):
    avg = (data.sigmaX + data.sigmaY) / 2
    R = math.sqrt(math.pow((data.sigmaX - data.sigmaY) / 2, 2) + math.pow(data.tauXY, 2))
    
    sigma1 = avg + R
    sigma2 = avg - R
    
    vonMisesStress = math.sqrt(math.pow(sigma1, 2) - sigma1 * sigma2 + math.pow(sigma2, 2))
    nVonMises = data.sy / vonMisesStress if vonMisesStress != 0 else float('inf')
    
    maxShear = max(
        abs(sigma1 - sigma2) / 2,
        abs(sigma1) / 2,
        abs(sigma2) / 2
    )
    nTresca = (data.sy / 2) / maxShear if maxShear != 0 else float('inf')
    
    max_sigma = max(abs(sigma1), abs(sigma2))
    nRankine = data.sy / max_sigma if max_sigma != 0 else float('inf')
    
    return {
        "sigma1": round(sigma1, 2),
        "sigma2": round(sigma2, 2),
        "vonMisesStress": vonMisesStress,
        "nVonMises": nVonMises,
        "nTresca": nTresca,
        "nRankine": nRankine,
        "isSafe": nVonMises >= 1
    }

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
    radiusXY = math.sqrt(math.pow((data.sigmaX - data.sigmaY) / 2, 2) + math.pow(data.tauXY, 2))
    s1_xy = avgXY + radiusXY
    s2_xy = avgXY - radiusXY
    
    s3 = data.sigmaZ if data.is3D else 0
    
    arr = sorted([s1_xy, s2_xy, s3], reverse=True)
    p1, p2, p3 = arr[0], arr[1], arr[2]
    
    absMaxShear = (p1 - p3) / 2
    twoThetaPRad = math.atan2(data.tauXY, (data.sigmaX - data.sigmaY) / 2)
    thetaP = (twoThetaPRad / 2) * (180 / math.pi)
    
    return {
        "avg": avgXY,
        "radius": radiusXY,
        "sigma1": s1_xy,
        "sigma2": s2_xy,
        "p1": p1,
        "p2": p2,
        "p3": p3,
        "absMaxShear": absMaxShear,
        "twoThetaPRad": twoThetaPRad,
        "thetaP": thetaP
    }

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
    G = data.modulus * 1e9
    T = data.torque
    L = data.length
    
    J = 0
    maxShear = 0
    
    if data.section == 'solid-circular':
        r = (data.d1 / 1000) / 2
        J = (math.pi * math.pow(r, 4)) / 2
        maxShear = (T * r) / J if J != 0 else 0
    elif data.section == 'hollow-circular':
        rOuter = (data.d1 / 1000) / 2
        rInner = (data.d2 / 1000) / 2
        J = (math.pi * (math.pow(rOuter, 4) - math.pow(rInner, 4))) / 2
        maxShear = (T * rOuter) / J if J != 0 else 0
    elif data.section == 'rectangular':
        d1_m, d2_m = data.d1 / 1000, data.d2 / 1000
        a = max(d1_m, d2_m)
        b = min(d1_m, d2_m)
        alpha = 0.208
        J = alpha * a * (b**3)
        maxShear = T / (0.208 * a * (b**2)) if (a*b) != 0 else 0

    angleOfTwist = (T * L) / (G * J) if (G * J) != 0 else 0
    angleDeg = (angleOfTwist * 180) / math.pi
    
    return {
        "maxShear": maxShear / 1e6,
        "angleRad": angleOfTwist,
        "angleDeg": angleDeg,
        "J": J * 1e8
    }

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
    if data.beamType == 'simply_supported' and span <= 0:
        return None
        
    sumPx_A = 0
    sumP = 0
    for l in data.loads:
        P = 0
        dist = 0
        baseDist = data.supportA if data.beamType == 'simply_supported' else 0
        
        if l.type == 'point':
            P = l.magnitude
            dist = l.position - baseDist
        elif l.type == 'udl':
            P = l.magnitude * l.length
            dist = l.position + l.length / 2 - baseDist
        elif l.type == 'uvl':
            P_rect = l.magnitude * l.length
            dist_rect = l.position + l.length / 2 - baseDist
            P_tri = 0.5 * (l.endMagnitude - l.magnitude) * l.length
            dist_tri = l.position + (2/3) * l.length - baseDist
            P = P_rect + P_tri
            dist = 0 if P == 0 else (P_rect * dist_rect + P_tri * dist_tri) / P
            
        sumP += P
        sumPx_A += P * dist
        
    Rb = sumPx_A / span if data.beamType == 'simply_supported' else 0
    Ra = sumP - Rb if data.beamType == 'simply_supported' else sumP
    Ma = 0 if data.beamType == 'simply_supported' else sumPx_A
    
    points = 101
    step = data.length / (points - 1) if points > 1 else 0
    
    M_arr = []
    V_arr = []
    maxMoment = 0
    maxMomentX = 0
    
    for i in range(points):
        x = i * step
        V = 0
        M = 0
        
        if data.beamType == 'simply_supported':
            if x > data.supportA:
                V += Ra
                M += Ra * (x - data.supportA)
            if x > data.supportB:
                V += Rb
                M += Rb * (x - data.supportB)
        else:
            if x >= 0:
                V += Ra
                M += Ra * x - Ma
                
        for l in data.loads:
            if x > l.position:
                if l.type == 'point':
                    V -= l.magnitude
                    M -= l.magnitude * (x - l.position)
                elif l.type == 'udl':
                    loaded = min(x - l.position, l.length)
                    load_P = l.magnitude * loaded
                    V -= load_P
                    M -= load_P * (x - (l.position + loaded / 2))
                elif l.type == 'uvl':
                    loaded = min(x - l.position, l.length)
                    if l.length > 0:
                        currentW = l.magnitude + (l.endMagnitude - l.magnitude) * (loaded / l.length)
                    else:
                        currentW = l.magnitude
                    P_rect = l.magnitude * loaded
                    P_tri = 0.5 * (currentW - l.magnitude) * loaded
                    V -= (P_rect + P_tri)
                    M -= P_rect * (x - (l.position + loaded / 2)) + P_tri * (x - (l.position + (2/3) * loaded))
        
        if data.beamType == 'simply_supported':
            if abs(x - data.supportA) < 1e-4:
                V += Ra
            if abs(x - data.supportB) < 1e-4:
                V += Rb
        else:
            if abs(x) < 1e-4:
                V += Ra
                
        V_arr.append(V)
        M_arr.append(M)
        if abs(M) > abs(maxMoment):
            maxMoment = M
            maxMomentX = x
            
    EI = data.modulus * data.inertia * 0.01
    theta = [0]
    for i in range(1, points):
        theta.append(theta[i-1] + (M_arr[i-1] + M_arr[i]) / 2 * step)
        
    y_unadj = [0]
    for i in range(1, points):
        y_unadj.append(y_unadj[i-1] + (theta[i-1] + theta[i]) / 2 * step)
        
    C1 = 0
    C2 = 0
    if data.beamType == 'simply_supported':
        iA = round((data.supportA / data.length) * (points - 1)) if data.length > 0 else 0
        iB = round((data.supportB / data.length) * (points - 1)) if data.length > 0 else 0
        
        span_idx = data.supportA - data.supportB
        if span_idx != 0:
            C1 = (y_unadj[iB] - y_unadj[iA]) / span_idx
        C2 = -y_unadj[iA] - C1 * data.supportA
        
    res_data = []
    maxDeflection = 0
    maxDefX = 0
    
    for i in range(points):
        x = i * step
        deflection_mm = ((y_unadj[i] + C1 * x + C2) / EI) * 1000 if EI != 0 else 0
        if abs(deflection_mm) > abs(maxDeflection):
            maxDeflection = deflection_mm
            maxDefX = x
        res_data.append({
            "x": round(x, 2),
            "V": round(V_arr[i], 2),
            "M": round(M_arr[i], 2),
            "D": round(deflection_mm, 3)
        })
        
    sortedLoads = sorted([l.model_dump() for l in data.loads], key=lambda x: x["position"])

    return {
        "Ra": Ra,
        "Rb": Rb,
        "Ma": Ma,
        "span": span,
        "data": res_data,
        "C1": C1,
        "C2": C2,
        "EI": EI,
        "sumPx_A": sumPx_A,
        "sumP": sumP,
        "maxDeflection": maxDeflection,
        "maxDefX": maxDefX,
        "maxMoment": maxMoment,
        "maxMomentX": maxMomentX,
        "sortedLoads": sortedLoads
    }

"""
Engineering calculation service — pure math functions for all analysis endpoints.
Each function takes typed input and returns a dict result. No side effects.
"""
import math
from ..models.schemas import FatigueInput, FailureTheoriesInput, MohrCircleInput, TorsionInput, DynamicInput, BeamsInput


def compute_fatigue(data: FatigueInput) -> dict:
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
        disc = b**2 - 4 * a * c
        nGerber = (-b + math.sqrt(disc)) / (2 * a) if disc >= 0 else 0

    return {
        "nG": round(nG, 2),
        "nS": round(nS, 2),
        "nGerber": round(nGerber, 2),
        "isSafe": nG >= 1.0,
    }


def compute_failure_theories(data: FailureTheoriesInput) -> dict:
    avg = (data.sigmaX + data.sigmaY) / 2
    R = math.sqrt(((data.sigmaX - data.sigmaY) / 2) ** 2 + data.tauXY ** 2)
    s1, s2 = avg + R, avg - R
    vm = math.sqrt(s1**2 - s1 * s2 + s2**2)
    nVm = data.sy / vm if vm != 0 else float('inf')
    mS = max(abs(s1 - s2) / 2, abs(s1) / 2, abs(s2) / 2)
    nTr = (data.sy / 2) / mS if mS != 0 else float('inf')
    maxS = max(abs(s1), abs(s2))
    nRa = data.sy / maxS if maxS != 0 else float('inf')
    return {
        "sigma1": round(s1, 2),
        "sigma2": round(s2, 2),
        "vonMisesStress": vm,
        "nVonMises": nVm,
        "nTresca": nTr,
        "nRankine": nRa,
        "isSafe": nVm >= 1,
    }


def compute_mohr_circle(data: MohrCircleInput) -> dict:
    avgXY = (data.sigmaX + data.sigmaY) / 2
    rXY = math.sqrt(((data.sigmaX - data.sigmaY) / 2) ** 2 + data.tauXY ** 2)
    s1_xy, s2_xy = avgXY + rXY, avgXY - rXY
    s3 = data.sigmaZ if data.is3D else 0
    p1, p2, p3 = sorted([s1_xy, s2_xy, s3], reverse=True)
    absMax = (p1 - p3) / 2
    thetaP = 0.5 * math.atan2(data.tauXY, (data.sigmaX - data.sigmaY) / 2)
    return {
        "avg": avgXY,
        "radius": rXY,
        "sigma1": s1_xy,
        "sigma2": s2_xy,
        "p1": p1,
        "p2": p2,
        "p3": p3,
        "absMaxShear": absMax,
        "twoThetaPRad": thetaP * 2,
        "thetaP": thetaP * 180 / math.pi,
    }


def compute_torsion(data: TorsionInput) -> dict:
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
        a, b = max(data.d1, data.d2) / 1000, min(data.d1, data.d2) / 1000
        J = 0.208 * a * (b**3)
        maxS = T / (0.208 * a * (b**2)) if (a * b) != 0 else 0

    phi = (T * L) / (G * J) if (G * J) != 0 else 0
    return {
        "maxShear": maxS / 1e6,
        "angleRad": phi,
        "angleDeg": phi * 180 / math.pi,
        "J": J * 1e8,
    }


def compute_dynamic_loading(data: DynamicInput) -> dict:
    g = 9.81
    W = data.mass * g
    ds = W / data.stiffness if data.stiffness != 0 else 0
    ni = 1 + math.sqrt(1 + (2 * data.height) / ds) if ds != 0 else 2
    df = W * ni
    fn = math.sqrt(data.stiffness / data.mass) / (2 * math.pi) if data.mass != 0 else 0
    return {
        "deltaSt": ds * 1000,
        "impactFactor": ni,
        "dynamicForce": df,
        "fn": fn,
    }


def compute_beams(data: BeamsInput) -> dict:
    span = data.supportB - data.supportA
    if data.beamType == 'simply_supported' and span <= 0:
        return None

    sumP, sumPx = 0, 0
    for l in data.loads:
        P, d = 0, 0
        base = data.supportA if data.beamType == 'simply_supported' else 0
        if l.type == 'point':
            P, d = l.magnitude, l.position - base
        elif l.type == 'udl':
            P, d = l.magnitude * l.length, l.position + l.length / 2 - base
        elif l.type == 'uvl':
            Pr = l.magnitude * l.length
            dr = l.position + l.length / 2 - base
            Pt = 0.5 * (l.endMagnitude - l.magnitude) * l.length
            dt = l.position + (2 / 3) * l.length - base
            P = Pr + Pt
            d = 0 if (Pr + Pt) == 0 else (Pr * dr + Pt * dt) / (Pr + Pt)
        sumP += P
        sumPx += P * d

    Rb = sumPx / span if data.beamType == 'simply_supported' else 0
    Ra = sumP - Rb
    Ma = 0 if data.beamType == 'simply_supported' else sumPx

    pts = 101
    step = data.length / (pts - 1)
    V_a, M_a = [], []
    maxM, maxMX = 0, 0

    for i in range(pts):
        x = i * step
        V, M = 0, 0
        if data.beamType == 'simply_supported':
            if x > data.supportA:
                V, M = V + Ra, M + Ra * (x - data.supportA)
            if x > data.supportB:
                V, M = V + Rb, M + Rb * (x - data.supportB)
        else:
            if x >= 0:
                V, M = V + Ra, M + Ra * x - Ma

        for l in data.loads:
            if x > l.position:
                if l.type == 'point':
                    V, M = V - l.magnitude, M - l.magnitude * (x - l.position)
                elif l.type == 'udl':
                    ld = min(x - l.position, l.length)
                    lp = l.magnitude * ld
                    V, M = V - lp, M - lp * (x - (l.position + ld / 2))
                elif l.type == 'uvl':
                    ld = min(x - l.position, l.length)
                    curW = (
                        l.magnitude + (l.endMagnitude - l.magnitude) * (ld / l.length)
                        if l.length > 0
                        else l.magnitude
                    )
                    Pr = l.magnitude * ld
                    Pt = 0.5 * (curW - l.magnitude) * ld
                    V = V - (Pr + Pt)
                    M = M - Pr * (x - (l.position + ld / 2)) - Pt * (x - (l.position + (2 / 3) * ld))

        if data.beamType == 'simply_supported':
            if abs(x - data.supportA) < 1e-4:
                V += Ra
            if abs(x - data.supportB) < 1e-4:
                V += Rb
        else:
            if abs(x) < 1e-4:
                V += Ra

        V_a.append(V)
        M_a.append(M)
        if abs(M) > abs(maxM):
            maxM, maxMX = M, x

    EI = data.modulus * data.inertia * 0.01
    theta, y_u = [0], [0]
    for i in range(1, pts):
        theta.append(theta[i - 1] + (M_a[i - 1] + M_a[i]) / 2 * step)
        y_u.append(y_u[i - 1] + (theta[i - 1] + theta[i]) / 2 * step)

    C1, C2 = 0, 0
    if data.beamType == 'simply_supported':
        iA = round(data.supportA / data.length * (pts - 1))
        iB = round(data.supportB / data.length * (pts - 1))
        if data.supportA != data.supportB:
            C1 = (y_u[iB] - y_u[iA]) / (data.supportA - data.supportB)
        C2 = -y_u[iA] - C1 * data.supportA

    res = []
    maxD, maxDX = 0, 0
    for i in range(pts):
        x = i * step
        defl = ((y_u[i] + C1 * x + C2) / EI) * 1000 if EI != 0 else 0
        if abs(defl) > abs(maxD):
            maxD, maxDX = defl, x
        res.append({"x": round(x, 2), "V": round(V_a[i], 2), "M": round(M_a[i], 2), "D": round(defl, 3)})

    return {
        "Ra": Ra,
        "Rb": Rb,
        "Ma": Ma,
        "span": span,
        "data": res,
        "C1": C1,
        "C2": C2,
        "EI": EI,
        "sumPx_A": sumPx,
        "sumP": sumP,
        "maxDeflection": maxD,
        "maxDefX": maxDX,
        "maxMoment": maxM,
        "maxMomentX": maxMX,
        "sortedLoads": sorted(
            [l.model_dump() for l in data.loads], key=lambda x: x["position"]
        ),
    }

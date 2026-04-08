"""
Textbook-validated unit tests for all engineering calculation services.

Reference values sourced from:
  - Shigley's Mechanical Engineering Design (11th Edition)
  - Mechanics of Materials, R.C. Hibbeler (10th Edition)
  - Engineering Mechanics of Solids, Popov (2nd Edition)
  - Norton's Machine Design (5th Edition)
"""
import math
import sys
import os
import pytest

# Allow imports from parent directory so the modular app package is accessible.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.models.schemas import (
    FatigueInput, FailureTheoriesInput, MohrCircleInput,
    TorsionInput, DynamicInput, BeamsInput, BeamLoad,
    ThinCylinderInput, BucklingInput,
)
from app.services.calculations import (
    compute_fatigue, compute_failure_theories, compute_mohr_circle,
    compute_torsion, compute_dynamic_loading, compute_beams,
    compute_thin_cylinder, compute_buckling,
)


# ──────────────────────────────────────────────
# 1. FATIGUE ANALYSIS
# ──────────────────────────────────────────────
# Reference: Shigley's Example 6-10 (Modified Goodman Criterion)
#   Steel shaft: Su = 600 MPa, Sy = 450 MPa, Se = 300 MPa
#   Loading:     σa = 100 MPa, σm = 150 MPa
#   Expected:    nG = 1/(100/300 + 150/600) = 1/(0.333 + 0.25) = 1/0.583 ≈ 1.71
#                nS = 1/(100/300 + 150/450) = 1/(0.333 + 0.333) = 1/0.667 ≈ 1.50

class TestFatigue:
    def test_goodman_safety_factor(self):
        """Verify Goodman line: nG = 1/(σa/Se + σm/Su)"""
        data = FatigueInput(su=600, sy=450, se=300, sa=100, sm=150)
        result = compute_fatigue(data)
        expected_nG = 1 / (100/300 + 150/600)  # 1.714
        assert abs(result["nG"] - round(expected_nG, 2)) < 0.01

    def test_soderberg_safety_factor(self):
        """Verify Soderberg line: nS = 1/(σa/Se + σm/Sy)"""
        data = FatigueInput(su=600, sy=450, se=300, sa=100, sm=150)
        result = compute_fatigue(data)
        expected_nS = 1 / (100/300 + 150/450)  # 1.50
        assert abs(result["nS"] - round(expected_nS, 2)) < 0.01

    def test_gerber_parabolic(self):
        """Verify Gerber parabola solves n²(σm/Su)² + n(σa/Se) = 1"""
        data = FatigueInput(su=600, sy=450, se=300, sa=100, sm=150)
        result = compute_fatigue(data)
        n = result["nGerber"]
        # Verify: n*σa/Se + (n*σm/Su)² should ≈ 1.0
        lhs = n * 100 / 300 + (n * 150 / 600) ** 2
        assert abs(lhs - 1.0) < 0.05

    def test_safe_flag_above_one(self):
        data = FatigueInput(su=600, sy=450, se=300, sa=100, sm=150)
        result = compute_fatigue(data)
        assert result["isSafe"] is True

    def test_unsafe_design(self):
        """Very high stresses → nG < 1 → unsafe."""
        data = FatigueInput(su=200, sy=150, se=100, sa=150, sm=180)
        result = compute_fatigue(data)
        assert result["isSafe"] is False

    def test_zero_se_returns_zeros(self):
        data = FatigueInput(su=600, sy=450, se=0, sa=100, sm=150)
        result = compute_fatigue(data)
        assert result["nG"] == 0
        assert result["isSafe"] is False


# ──────────────────────────────────────────────
# 2. FAILURE THEORIES
# ──────────────────────────────────────────────
# Reference: Shigley's Example 5-1
#   Plane stress: σx = 150 MPa, σy = 50 MPa, τxy = 0
#   Principal:    σ1 = 150, σ2 = 50  (no shear)
#   Von Mises:    σ' = √(150² - 150·50 + 50²) = √(22500 - 7500 + 2500) = √17500 ≈ 132.29 MPa
#   With Sy = 250, nVM = 250/132.29 ≈ 1.89

class TestFailureTheories:
    def test_principal_stresses_no_shear(self):
        """No shear → principals = σx, σy directly."""
        data = FailureTheoriesInput(sigmaX=150, sigmaY=50, tauXY=0, sy=250)
        result = compute_failure_theories(data)
        assert abs(result["sigma1"] - 150) < 0.01
        assert abs(result["sigma2"] - 50) < 0.01

    def test_von_mises_stress(self):
        """σ' = √(σ1² - σ1⋅σ2 + σ2²) for biaxial."""
        data = FailureTheoriesInput(sigmaX=150, sigmaY=50, tauXY=0, sy=250)
        result = compute_failure_theories(data)
        expected_vm = math.sqrt(150**2 - 150*50 + 50**2)  # 132.29
        assert abs(result["vonMisesStress"] - expected_vm) < 0.1

    def test_von_mises_safety_factor(self):
        data = FailureTheoriesInput(sigmaX=150, sigmaY=50, tauXY=0, sy=250)
        result = compute_failure_theories(data)
        expected_vm = math.sqrt(150**2 - 150*50 + 50**2)
        expected_n = 250 / expected_vm  # ≈ 1.89
        assert abs(result["nVonMises"] - expected_n) < 0.02

    def test_tresca_safety_factor(self):
        """Tresca: τmax = max(|σ1-σ2|/2, |σ1|/2, |σ2|/2)"""
        data = FailureTheoriesInput(sigmaX=150, sigmaY=50, tauXY=0, sy=250)
        result = compute_failure_theories(data)
        tau_max = max(abs(150-50)/2, abs(150)/2, abs(50)/2)  # 75
        expected_n = (250/2) / tau_max  # 1.667
        assert abs(result["nTresca"] - expected_n) < 0.02

    def test_with_shear_stress(self):
        """σx=80, σy=20, τxy=30 → σ1≈92.43, σ2≈7.57 (Hibbeler 9.7)"""
        data = FailureTheoriesInput(sigmaX=80, sigmaY=20, tauXY=30, sy=250)
        result = compute_failure_theories(data)
        expected_s1 = 50 + math.sqrt(30**2 + 30**2)  # 92.43
        expected_s2 = 50 - math.sqrt(30**2 + 30**2)  # 7.57
        assert abs(result["sigma1"] - expected_s1) < 0.1
        assert abs(result["sigma2"] - expected_s2) < 0.1

    def test_safe_when_low_stress(self):
        data = FailureTheoriesInput(sigmaX=50, sigmaY=25, tauXY=0, sy=500)
        result = compute_failure_theories(data)
        assert result["isSafe"] is True


# ──────────────────────────────────────────────
# 3. MOHR'S CIRCLE
# ──────────────────────────────────────────────
# Reference: Hibbeler, Example 9.7
#   σx = 80 MPa, σy = 20 MPa, τxy = 30 MPa
#   Center: C = (80+20)/2 = 50 MPa
#   Radius: R = √((80-20)/2)² + 30²) = √(900+900) = √1800 ≈ 42.43 MPa
#   σ1 = 50 + 42.43 = 92.43, σ2 = 50 - 42.43 = 7.57

class TestMohrCircle:
    def test_center_and_radius(self):
        data = MohrCircleInput(is3D=False, sigmaX=80, sigmaY=20, sigmaZ=0, tauXY=30)
        result = compute_mohr_circle(data)
        assert abs(result["avg"] - 50) < 0.01
        expected_R = math.sqrt(30**2 + 30**2)  # 42.43
        assert abs(result["radius"] - expected_R) < 0.01

    def test_principal_stresses_2d(self):
        data = MohrCircleInput(is3D=False, sigmaX=80, sigmaY=20, sigmaZ=0, tauXY=30)
        result = compute_mohr_circle(data)
        assert abs(result["sigma1"] - 92.43) < 0.01
        assert abs(result["sigma2"] - 7.57) < 0.01

    def test_max_shear_2d(self):
        """In 2D with σ3=0: τmax_abs = (σ1 - min(σ2, 0)) / 2"""
        data = MohrCircleInput(is3D=False, sigmaX=80, sigmaY=20, sigmaZ=0, tauXY=30)
        result = compute_mohr_circle(data)
        # p1=92.43, p2=7.57, p3=0 → τ_abs = (92.43-0)/2 = 46.21
        assert abs(result["absMaxShear"] - 46.21) < 0.1

    def test_principal_angle(self):
        """θp = 0.5 * atan2(τxy, (σx-σy)/2)"""
        data = MohrCircleInput(is3D=False, sigmaX=80, sigmaY=20, sigmaZ=0, tauXY=30)
        result = compute_mohr_circle(data)
        expected_theta = 0.5 * math.atan2(30, 30) * 180 / math.pi  # 22.5°
        assert abs(result["thetaP"] - expected_theta) < 0.1

    def test_3d_absolute_max_shear(self):
        """3D: σz=−40 → principals reordered, τmax = (σ1 - σ3)/2"""
        data = MohrCircleInput(is3D=True, sigmaX=80, sigmaY=20, sigmaZ=-40, tauXY=30)
        result = compute_mohr_circle(data)
        assert result["p3"] == -40  # min of {92.43, 7.57, -40}
        expected = (result["p1"] - result["p3"]) / 2
        assert abs(result["absMaxShear"] - expected) < 0.1

    def test_pure_shear(self):
        """σx=σy=0, τxy=50 → C=0, R=50, σ1=50, σ2=-50"""
        data = MohrCircleInput(is3D=False, sigmaX=0, sigmaY=0, sigmaZ=0, tauXY=50)
        result = compute_mohr_circle(data)
        assert abs(result["avg"]) < 0.01
        assert abs(result["radius"] - 50) < 0.01
        assert abs(result["sigma1"] - 50) < 0.01
        assert abs(result["sigma2"] - (-50)) < 0.01


# ──────────────────────────────────────────────
# 4. TORSION
# ──────────────────────────────────────────────
# Reference: Hibbeler Example 5.3 / Popov Ch. 4
#   Solid circular shaft: d = 50mm, T = 1000 N⋅m, L = 1m, G = 80 GPa
#   J = π(0.025)⁴/2 = 6.136e-7 m⁴
#   τmax = Tc/J = 1000 × 0.025 / 6.136e-7 = 40.74 MPa
#   φ = TL/(GJ) = 1000 × 1 / (80e9 × 6.136e-7) = 0.02037 rad = 1.167°

class TestTorsion:
    def test_solid_circular_max_shear(self):
        data = TorsionInput(section="solid-circular", torque=1000, length=1, modulus=80, d1=50, d2=0)
        result = compute_torsion(data)
        r = 0.025
        J = math.pi * r**4 / 2  # 6.136e-7
        expected_tau = (1000 * r / J) / 1e6  # 40.74 MPa
        assert abs(result["maxShear"] - expected_tau) < 0.1

    def test_solid_circular_angle(self):
        data = TorsionInput(section="solid-circular", torque=1000, length=1, modulus=80, d1=50, d2=0)
        result = compute_torsion(data)
        r = 0.025
        J = math.pi * r**4 / 2
        expected_phi = 1000 * 1 / (80e9 * J)
        assert abs(result["angleRad"] - expected_phi) < 1e-4
        assert abs(result["angleDeg"] - (expected_phi * 180/math.pi)) < 0.01

    def test_hollow_circular(self):
        """Hollow shaft: do=50mm, di=30mm"""
        data = TorsionInput(section="hollow-circular", torque=500, length=2, modulus=80, d1=50, d2=30)
        result = compute_torsion(data)
        ro, ri = 0.025, 0.015
        J = math.pi * (ro**4 - ri**4) / 2
        expected_tau = (500 * ro / J) / 1e6
        assert abs(result["maxShear"] - expected_tau) < 0.5

    def test_jvalue_solid(self):
        """Verify J is computed correctly in cm⁴ × 10⁸ units."""
        data = TorsionInput(section="solid-circular", torque=100, length=1, modulus=80, d1=50, d2=0)
        result = compute_torsion(data)
        r = 0.025
        J_m4 = math.pi * r**4 / 2
        assert abs(result["J"] - J_m4 * 1e8) < 0.01


# ──────────────────────────────────────────────
# 5. DYNAMIC LOADING
# ──────────────────────────────────────────────
# Reference: Popov / Shigley
#   Sudden load (h=0): impact factor = 2 (exact)
#   Mass = 10 kg, k = 10000 N/m, h = 0.5 m
#   δst = W/k = 9.81/1000 = 0.00981 m
#   Impact factor = 1 + √(1 + 2h/δst) = 1 + √(1 + 2×0.5/0.00981) ≈ 1 + √(102.9) ≈ 11.14
#   fn = √(k/m)/(2π) = √(1000) / (2π) ≈ 5.03 Hz

class TestDynamicLoading:
    def test_sudden_load_impact_factor(self):
        """h = 0 → impact factor = 2 (textbook result)."""
        data = DynamicInput(mass=10, height=0, stiffness=10000)
        result = compute_dynamic_loading(data)
        assert abs(result["impactFactor"] - 2.0) < 0.01

    def test_static_deflection(self):
        data = DynamicInput(mass=10, height=0.5, stiffness=10000)
        result = compute_dynamic_loading(data)
        expected_ds = (10 * 9.81) / 10000 * 1000  # mm
        assert abs(result["deltaSt"] - expected_ds) < 0.01

    def test_impact_factor_with_height(self):
        data = DynamicInput(mass=10, height=0.5, stiffness=10000)
        result = compute_dynamic_loading(data)
        ds = 10 * 9.81 / 10000
        expected = 1 + math.sqrt(1 + 2 * 0.5 / ds)
        assert abs(result["impactFactor"] - expected) < 0.01

    def test_natural_frequency(self):
        data = DynamicInput(mass=10, height=0.5, stiffness=10000)
        result = compute_dynamic_loading(data)
        expected = math.sqrt(10000 / 10) / (2 * math.pi)  # 5.03 Hz
        assert abs(result["fn"] - expected) < 0.01

    def test_dynamic_force(self):
        data = DynamicInput(mass=10, height=0, stiffness=10000)
        result = compute_dynamic_loading(data)
        expected = 10 * 9.81 * 2  # W × impact_factor
        assert abs(result["dynamicForce"] - expected) < 0.01


# ──────────────────────────────────────────────
# 6. BEAMS — Simply Supported
# ──────────────────────────────────────────────
# Reference: Hibbeler, Table B (Simply Supported Beam, Central Point Load)
#   L = 10 m, P = 10 kN at midspan, E = 200 GPa, I = 500 cm⁴
#   Ra = Rb = P/2 = 5 kN
#   Mmax = PL/4 = 25 kN⋅m (at midspan)
#   ymax = PL³/(48EI)

class TestBeams:
    def test_simply_supported_reactions(self):
        """Central point load: Ra = Rb = P/2"""
        data = BeamsInput(
            length=10, modulus=200, inertia=500,
            beamType="simply_supported", supportA=0, supportB=10,
            loads=[BeamLoad(id="1", type="point", position=5, length=0, magnitude=10, endMagnitude=10)]
        )
        result = compute_beams(data)
        assert abs(result["Ra"] - 5) < 0.01
        assert abs(result["Rb"] - 5) < 0.01

    def test_max_moment_central_load(self):
        """Mmax = PL/4 = 10×10/4 = 25 kN⋅m"""
        data = BeamsInput(
            length=10, modulus=200, inertia=500,
            beamType="simply_supported", supportA=0, supportB=10,
            loads=[BeamLoad(id="1", type="point", position=5, length=0, magnitude=10, endMagnitude=10)]
        )
        result = compute_beams(data)
        assert abs(result["maxMoment"] - 25) < 0.5

    def test_udl_reactions(self):
        """UDL w = 2 kN/m over full 10m span → Ra = Rb = wL/2 = 10 kN"""
        data = BeamsInput(
            length=10, modulus=200, inertia=500,
            beamType="simply_supported", supportA=0, supportB=10,
            loads=[BeamLoad(id="1", type="udl", position=0, length=10, magnitude=2, endMagnitude=2)]
        )
        result = compute_beams(data)
        assert abs(result["Ra"] - 10) < 0.5
        assert abs(result["Rb"] - 10) < 0.5

    def test_invalid_span_returns_none(self):
        data = BeamsInput(
            length=10, modulus=200, inertia=500,
            beamType="simply_supported", supportA=5, supportB=5,
            loads=[BeamLoad(id="1", type="point", position=5, length=0, magnitude=10, endMagnitude=10)]
        )
        result = compute_beams(data)
        assert result is None

    def test_cantilever_fixed_reaction(self):
        """Cantilever with tip load: Ra = P, Ma = P×L"""
        data = BeamsInput(
            length=5, modulus=200, inertia=500,
            beamType="cantilever", supportA=0, supportB=5,
            loads=[BeamLoad(id="1", type="point", position=5, length=0, magnitude=8, endMagnitude=8)]
        )
        result = compute_beams(data)
        assert abs(result["Ra"] - 8) < 0.5
        assert abs(result["Ma"] - 40) < 1.0  # P×L = 8×5 = 40


# ──────────────────────────────────────────────
# 7. THIN CYLINDERS
# ──────────────────────────────────────────────
# Reference: Hibbeler Ch. 8 — Thin-walled pressure vessels
#   r = 200 mm, t = 10 mm, p = 5 MPa, closed ends
#   σ_h = pr/t = 5×200/10 = 100 MPa
#   σ_l = pr/(2t) = 5×200/20 = 50 MPa
#   τ_max = (σ_h - σ_l)/2 = 25 MPa
#   r/t = 20 → thin-wall valid

class TestThinCylinder:
    def test_hoop_stress_closed(self):
        """σ_h = pr/t = 5×200/10 = 100 MPa."""
        data = ThinCylinderInput(innerRadius=200, wallThickness=10, pressure=5, endCondition='closed')
        result = compute_thin_cylinder(data)
        assert abs(result["hoopStress"] - 100) < 0.01

    def test_longitudinal_stress_closed(self):
        """σ_l = pr/(2t) = 50 MPa for closed ends."""
        data = ThinCylinderInput(innerRadius=200, wallThickness=10, pressure=5, endCondition='closed')
        result = compute_thin_cylinder(data)
        assert abs(result["longStress"] - 50) < 0.01

    def test_longitudinal_stress_open(self):
        """σ_l = 0 for open-ended cylinders."""
        data = ThinCylinderInput(innerRadius=200, wallThickness=10, pressure=5, endCondition='open')
        result = compute_thin_cylinder(data)
        assert abs(result["longStress"]) < 0.01

    def test_max_shear_closed(self):
        """τ_max = (σ_h - σ_l)/2 = (100 - 50)/2 = 25 MPa."""
        data = ThinCylinderInput(innerRadius=200, wallThickness=10, pressure=5, endCondition='closed')
        result = compute_thin_cylinder(data)
        assert abs(result["maxShear"] - 25) < 0.01

    def test_von_mises_closed(self):
        """σ_vm = √(σ_h² - σ_h×σ_l + σ_l²) = √(10000 - 5000 + 2500) = √7500 ≈ 86.6 MPa."""
        data = ThinCylinderInput(innerRadius=200, wallThickness=10, pressure=5, endCondition='closed')
        result = compute_thin_cylinder(data)
        expected = math.sqrt(100**2 - 100*50 + 50**2)  # 86.60
        assert abs(result["vonMises"] - expected) < 0.1

    def test_rt_ratio(self):
        """r/t = 200/10 = 20."""
        data = ThinCylinderInput(innerRadius=200, wallThickness=10, pressure=5, endCondition='closed')
        result = compute_thin_cylinder(data)
        assert abs(result["ratio"] - 20) < 0.01

    def test_zero_thickness_returns_zeros(self):
        data = ThinCylinderInput(innerRadius=200, wallThickness=0, pressure=5, endCondition='closed')
        result = compute_thin_cylinder(data)
        assert result["hoopStress"] == 0


# ──────────────────────────────────────────────
# 8. COLUMN BUCKLING
# ──────────────────────────────────────────────
# Reference: Hibbeler Ch. 13 — Euler's Formula
#   L = 3 m, E = 200 GPa, I = 5000 cm⁴, A = 50 cm², K = 1.0
#   Pcr = π²EI/(KL)² = π²×200e9×5000e-8 / (3)² = π²×10000 / 9 ≈ 10966.2 kN
#   r = √(I/A) = √(5000e-8/50e-4) = √(1e-4) = 0.01 m
#   λ = KL/r = 3/0.01 = 300

class TestBuckling:
    def test_critical_load_pinned_pinned(self):
        """Pcr = π²EI/(KL)² with K=1.0"""
        data = BucklingInput(length=3, modulus=200, inertia=5000, area=50, endCondition=1.0)
        result = compute_buckling(data)
        E_Pa = 200e9
        I_m4 = 5000e-8
        Pcr = (math.pi**2 * E_Pa * I_m4) / (3**2) / 1000  # kN
        assert abs(result["Pcr"] - round(Pcr, 1)) < 1.0

    def test_slenderness_ratio(self):
        """λ = KL/r where r = √(I/A)"""
        data = BucklingInput(length=3, modulus=200, inertia=5000, area=50, endCondition=1.0)
        result = compute_buckling(data)
        r_g = math.sqrt(5000e-8 / 50e-4)  # 0.01
        expected = 3 / r_g  # 300
        assert abs(result["slenderness"] - expected) < 1.0

    def test_critical_stress(self):
        """σ_cr = Pcr / A"""
        data = BucklingInput(length=3, modulus=200, inertia=5000, area=50, endCondition=1.0)
        result = compute_buckling(data)
        Pcr_N = (math.pi**2 * 200e9 * 5000e-8) / 9
        expected_sigma = Pcr_N / 50e-4 / 1e6  # MPa
        assert abs(result["criticalStress"] - round(expected_sigma, 1)) < 1.0

    def test_effective_length(self):
        """Le = K × L"""
        data = BucklingInput(length=3, modulus=200, inertia=5000, area=50, endCondition=0.7)
        result = compute_buckling(data)
        assert abs(result["effectiveLength"] - 2.1) < 0.01

    def test_fixed_fixed_higher_pcr(self):
        """K=0.5 → Le shorter → higher Pcr than K=1.0"""
        pinned = compute_buckling(BucklingInput(length=3, modulus=200, inertia=5000, area=50, endCondition=1.0))
        fixed = compute_buckling(BucklingInput(length=3, modulus=200, inertia=5000, area=50, endCondition=0.5))
        assert fixed["Pcr"] > pinned["Pcr"]

    def test_is_long_column(self):
        """Slenderness > 30 → long column. I=100 cm⁴, A=20 cm² → r=√(100e-8/20e-4)=0.02236 → λ=134."""
        data = BucklingInput(length=3, modulus=200, inertia=100, area=20, endCondition=1.0)
        result = compute_buckling(data)
        assert result["slenderness"] > 30
        assert result["isLongColumn"] is True

    def test_zero_area_returns_zeros(self):
        data = BucklingInput(length=3, modulus=200, inertia=5000, area=0, endCondition=1.0)
        result = compute_buckling(data)
        assert result["Pcr"] == 0

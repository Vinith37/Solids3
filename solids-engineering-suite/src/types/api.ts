// ============================================================
// API Type Definitions — SOLIDS Engineering Suite
// All request/response interfaces for the FastAPI backend.
// ============================================================

// --- Saved Calculations ---

export interface CalculationSummary {
  id: string;
  name: string;
  type: string;
  module: string;
  timestamp: string;
}

export interface CalculationSavePayload {
  id?: string;
  name: string;
  type: string;
  module: string;
  state: Record<string, unknown>;
}

export interface CalculationDetail extends CalculationSavePayload {
  id: string;
  timestamp: string;
}

export interface SaveResponse {
  status: 'success' | 'error';
  id?: string;
  message?: string;
}

export interface DeleteResponse {
  status: 'deleted' | 'cleared';
}

// --- Fatigue ---

export interface FatigueInput {
  su: number;
  sy: number;
  se: number;
  sa: number;
  sm: number;
}

export interface FatigueResult {
  nG: number;
  nS: number;
  nGerber: number;
  isSafe: boolean;
}

// --- Failure Theories ---

export interface FailureTheoriesInput {
  sigmaX: number;
  sigmaY: number;
  tauXY: number;
  sy: number;
}

export interface FailureTheoriesResult {
  sigma1: number;
  sigma2: number;
  vonMisesStress: number;
  nVonMises: number;
  nTresca: number;
  nRankine: number;
  isSafe: boolean;
}

// --- Mohr Circle ---

export interface MohrCircleInput {
  is3D: boolean;
  sigmaX: number;
  sigmaY: number;
  sigmaZ: number;
  tauXY: number;
}

export interface MohrCircleResult {
  avg: number;
  radius: number;
  sigma1: number;
  sigma2: number;
  p1: number;
  p2: number;
  p3: number;
  absMaxShear: number;
  twoThetaPRad: number;
  thetaP: number;
}

// --- Torsion ---

export interface TorsionInput {
  section: string;
  torque: number;
  length: number;
  modulus: number;
  d1: number;
  d2: number;
}

export interface TorsionResult {
  maxShear: number;
  angleRad: number;
  angleDeg: number;
  J: number;
}

// --- Dynamic Loading ---

export interface DynamicInput {
  mass: number;
  height: number;
  stiffness: number;
}

export interface DynamicResult {
  deltaSt: number;
  impactFactor: number;
  dynamicForce: number;
  fn: number;
}

// --- Beams ---

export interface BeamLoadInput {
  id: string;
  type: 'point' | 'udl' | 'uvl';
  position: number;
  length: number;
  magnitude: number;
  endMagnitude: number;
}

export interface BeamsInput {
  length: number;
  modulus: number;
  inertia: number;
  beamType: 'simply_supported' | 'cantilever';
  supportA: number;
  supportB: number;
  loads: BeamLoadInput[];
}

export interface BeamDataPoint {
  x: number;
  V: number;
  M: number;
  D: number;
}

export interface BeamsResult {
  Ra: number;
  Rb: number;
  Ma: number;
  span: number;
  data: BeamDataPoint[];
  C1: number;
  C2: number;
  EI: number;
  sumPx_A: number;
  sumP: number;
  maxDeflection: number;
  maxDefX: number;
  maxMoment: number;
  maxMomentX: number;
  sortedLoads: BeamLoadInput[];
}

// --- Materials ---

export interface Material {
  name: string;
  category: string;
  density: number;
  modulus: number;
  strength: number;
  poisson: number;
  thermalExpansion: number;
  cost: number;
}

export interface AshbyMaterial {
  name: string;
  category: string;
  density_low: number;
  density_high: number;
  modulus_low: number;
  modulus_high: number;
  strength_low: number;
  strength_high: number;
}

// --- Thin Cylinders ---

export interface ThinCylinderInput {
  innerRadius: number;    // mm
  wallThickness: number;  // mm
  pressure: number;       // MPa
  endCondition: string;   // 'open' | 'closed'
}

export interface ThinCylinderResult {
  hoopStress: number;
  longStress: number;
  radialStress: number;
  vonMises: number;
  maxShear: number;
  ratio: number;
}

// --- Column Buckling ---

export interface BucklingInput {
  length: number;         // m
  modulus: number;        // GPa
  inertia: number;       // cm^4
  area: number;          // cm^2
  endCondition: number;  // K factor
}

export interface BucklingResult {
  Pcr: number;
  criticalStress: number;
  slenderness: number;
  effectiveLength: number;
  isLongColumn: boolean;
}

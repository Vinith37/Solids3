// ============================================================
// Unit Conversion System — SOLIDS Engineering Suite
// Display-side only: backend always uses base units.
// Each quantity defines its base unit and available alternatives.
// ============================================================

export interface UnitOption {
  key: string;
  label: string;
  /** Multiply a value in THIS unit by toBase to get base-unit value */
  toBase: number;
  /** Multiply a base-unit value by fromBase to get THIS unit value (= 1/toBase) */
  fromBase: number;
}

export type UnitType =
  | 'stress'
  | 'force'
  | 'length'
  | 'smallLength'
  | 'torque'
  | 'modulus'
  | 'pressure'
  | 'stiffness'
  | 'mass'
  | 'inertia'
  | 'area'
  | 'deflection';

function u(key: string, label: string, toBase: number): UnitOption {
  return { key, label, toBase, fromBase: 1 / toBase };
}

// ---------------------------------------------------------------------------
// Unit Definitions
// ---------------------------------------------------------------------------

const stressUnits: UnitOption[] = [
  u('Pa',  'Pa',  1e-6),
  u('kPa', 'kPa', 1e-3),
  u('MPa', 'MPa', 1),
  u('GPa', 'GPa', 1e3),
  u('psi', 'psi', 0.00689476),
  u('ksi', 'ksi', 6.89476),
];

const forceUnits: UnitOption[] = [
  u('N',   'N',   0.001),
  u('kN',  'kN',  1),
  u('MN',  'MN',  1000),
  u('lbf', 'lbf', 0.00444822),
];

const lengthUnits: UnitOption[] = [
  u('mm', 'mm', 0.001),
  u('cm', 'cm', 0.01),
  u('m',  'm',  1),
  u('in', 'in', 0.0254),
  u('ft', 'ft', 0.3048),
];

const smallLengthUnits: UnitOption[] = [
  u('mm', 'mm', 1),
  u('cm', 'cm', 10),
  u('m',  'm',  1000),
  u('in', 'in', 25.4),
];

const torqueUnits: UnitOption[] = [
  u('N·mm',  'N·mm',  0.001),
  u('N·m',   'N·m',   1),
  u('kN·m',  'kN·m',  1000),
  u('lb·ft', 'lb·ft', 1.35582),
];

const modulusUnits: UnitOption[] = [
  u('MPa', 'MPa', 0.001),
  u('GPa', 'GPa', 1),
  u('psi', 'psi', 6.89476e-6),
  u('Msi', 'Msi', 6.89476),
];

const pressureUnits: UnitOption[] = [
  u('Pa',  'Pa',  1e-6),
  u('kPa', 'kPa', 1e-3),
  u('MPa', 'MPa', 1),
  u('bar', 'bar', 0.1),
  u('psi', 'psi', 0.00689476),
];

const stiffnessUnits: UnitOption[] = [
  u('N/m',   'N/m',   1),
  u('kN/m',  'kN/m',  1000),
  u('N/mm',  'N/mm',  1000),
  u('lb/in', 'lb/in', 175.127),
];

const massUnits: UnitOption[] = [
  u('g',  'g',  0.001),
  u('kg', 'kg', 1),
  u('lb', 'lb', 0.453592),
];

const inertiaUnits: UnitOption[] = [
  u('mm⁴', 'mm⁴', 1e-4),
  u('cm⁴', 'cm⁴', 1),
  u('m⁴',  'm⁴',  1e8),
  u('in⁴', 'in⁴', 41.6231),
];

const areaUnits: UnitOption[] = [
  u('mm²', 'mm²', 0.01),
  u('cm²', 'cm²', 1),
  u('m²',  'm²',  1e4),
  u('in²', 'in²', 6.4516),
];

const deflectionUnits: UnitOption[] = [
  u('mm', 'mm', 1),
  u('cm', 'cm', 10),
  u('m',  'm',  1000),
  u('in', 'in', 25.4),
];

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const unitRegistry: Record<UnitType, UnitOption[]> = {
  stress: stressUnits,
  force: forceUnits,
  length: lengthUnits,
  smallLength: smallLengthUnits,
  torque: torqueUnits,
  modulus: modulusUnits,
  pressure: pressureUnits,
  stiffness: stiffnessUnits,
  mass: massUnits,
  inertia: inertiaUnits,
  area: areaUnits,
  deflection: deflectionUnits,
};

/** Default (SI base) unit key for each quantity */
const defaultUnitKeys: Record<UnitType, string> = {
  stress: 'MPa',
  force: 'kN',
  length: 'm',
  smallLength: 'mm',
  torque: 'N·m',
  modulus: 'GPa',
  pressure: 'MPa',
  stiffness: 'N/m',
  mass: 'kg',
  inertia: 'cm⁴',
  area: 'cm²',
  deflection: 'mm',
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Get the list of available units for a given quantity */
export function getUnitsFor(type: UnitType): UnitOption[] {
  return unitRegistry[type];
}

/** Get the default SI unit key for a given quantity */
export function getDefaultUnitKey(type: UnitType): string {
  return defaultUnitKeys[type];
}

/** Find a UnitOption by its key within a quantity type */
export function findUnit(type: UnitType, key: string): UnitOption {
  const found = unitRegistry[type].find((u) => u.key === key);
  if (!found) {
    // Fallback to the base unit
    return unitRegistry[type].find((u) => u.key === defaultUnitKeys[type])!;
  }
  return found;
}

/** Convert a display value (in the selected unit) to the base unit value */
export function toBaseUnit(type: UnitType, unitKey: string, displayValue: number): number {
  return displayValue * findUnit(type, unitKey).toBase;
}

/** Convert a base unit value to the display value (in the selected unit) */
export function fromBaseUnit(type: UnitType, unitKey: string, baseValue: number): number {
  return baseValue * findUnit(type, unitKey).fromBase;
}

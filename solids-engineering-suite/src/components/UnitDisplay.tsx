// ============================================================
// UnitDisplay — Read-only value with unit selector
// Used for output/result cards where the user can change
// the display unit without editing the underlying value.
// ============================================================

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  type UnitType,
  getUnitsFor,
  getDefaultUnitKey,
  fromBaseUnit,
} from '../utils/units';

interface UnitDisplayProps {
  /** Value in base units (from backend) */
  value: number;
  /** Which physical quantity */
  unitType: UnitType;
  /** Override the default starting unit key */
  defaultUnit?: string;
  /** Number of decimal places */
  precision?: number;
  /** CSS class for the value text */
  valueClassName?: string;
  /** CSS class for the unit text */
  unitClassName?: string;
  /** If true, show just the unit label without a dropdown */
  staticUnit?: boolean;
}

export default function UnitDisplay({
  value,
  unitType,
  defaultUnit,
  precision = 2,
  valueClassName = 'text-2xl font-bold text-on-surface',
  unitClassName = '',
  staticUnit = false,
}: UnitDisplayProps) {
  const units = getUnitsFor(unitType);
  const [selectedKey, setSelectedKey] = useState(defaultUnit || getDefaultUnitKey(unitType));

  const displayVal = fromBaseUnit(unitType, selectedKey, value);

  // Format with appropriate precision
  const formatted = Math.abs(displayVal) >= 1e6
    ? displayVal.toExponential(precision)
    : displayVal.toFixed(precision);

  if (staticUnit) {
    const unitLabel = units.find((u) => u.key === selectedKey)?.label || selectedKey;
    return (
      <span className="inline-flex items-baseline gap-1.5">
        <span className={valueClassName}>{formatted}</span>
        <span className={`text-on-surface-variant text-xs font-semibold ${unitClassName}`}>{unitLabel}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className={valueClassName}>{formatted}</span>
      <span className={`relative inline-flex items-center ${unitClassName}`}>
        <select
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
          className="appearance-none bg-transparent text-on-surface-variant text-xs font-semibold pr-4 pl-0.5 outline-none cursor-pointer hover:text-on-surface transition-colors"
        >
          {units.map((u) => (
            <option key={u.key} value={u.key}>
              {u.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-on-surface-variant pointer-events-none" />
      </span>
    </span>
  );
}

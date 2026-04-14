// ============================================================
// UnitInput — Input field with integrated unit dropdown
// Handles conversion between display units and base units
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  type UnitType,
  getUnitsFor,
  getDefaultUnitKey,
  findUnit,
  toBaseUnit,
  fromBaseUnit,
} from '../utils/units';

interface UnitInputProps {
  /** Field label — string or JSX (for KaTeX labels) */
  label: React.ReactNode;
  /** Value in base units (what gets sent to backend) */
  value: number;
  /** Called with new value IN BASE UNITS */
  onChange: (baseValue: number) => void;
  /** Which physical quantity this field represents */
  unitType: UnitType;
  /** Override the default starting unit key */
  defaultUnit?: string;
  /** Additional className for the wrapper */
  className?: string;
}

export default function UnitInput({
  label,
  value,
  onChange,
  unitType,
  defaultUnit,
  className = '',
}: UnitInputProps) {
  const units = getUnitsFor(unitType);
  const [selectedKey, setSelectedKey] = useState(defaultUnit || getDefaultUnitKey(unitType));
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isUserEditing = useRef(false);

  // Keep display value in sync when the base value or unit changes externally
  useEffect(() => {
    if (!isUserEditing.current) {
      const converted = fromBaseUnit(unitType, selectedKey, value);
      // Avoid scientific notation for very small/large numbers
      setDisplayValue(smartFormat(converted));
    }
  }, [value, selectedKey, unitType]);

  function smartFormat(n: number): string {
    if (n === 0) return '0';
    const abs = Math.abs(n);
    if (abs >= 1e6 || (abs < 0.001 && abs > 0)) {
      return n.toPrecision(6);
    }
    // Remove trailing zeros after decimal
    return parseFloat(n.toFixed(6)).toString();
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setDisplayValue(raw);
    isUserEditing.current = true;

    if (raw === '' || raw === '-' || raw === '.') {
      onChange(0);
      return;
    }

    const num = parseFloat(raw);
    if (!isNaN(num)) {
      const baseVal = toBaseUnit(unitType, selectedKey, num);
      onChange(baseVal);
    }
  }

  function handleBlur() {
    isUserEditing.current = false;
    // Re-format on blur
    const converted = fromBaseUnit(unitType, selectedKey, value);
    setDisplayValue(smartFormat(converted));
  }

  function handleUnitChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newKey = e.target.value;
    setSelectedKey(newKey);
    // Re-display the same base value in the new unit
    isUserEditing.current = false;
    const converted = fromBaseUnit(unitType, newKey, value);
    setDisplayValue(smartFormat(converted));
  }

  return (
    <div className={className}>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.05em] text-on-surface-variant mb-2.5">
        {label}
      </label>
      <div className="flex items-stretch rounded-2xl overflow-hidden border border-outline/5 focus-within:ring-2 ring-primary/20 transition-all bg-surface-container-highest">
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={() => { isUserEditing.current = true; }}
          className="flex-1 min-w-0 pl-4 pr-1 py-3.5 bg-transparent outline-none font-mono text-on-surface text-sm"
        />
        <div className="relative flex items-center border-l border-outline/10">
          <select
            value={selectedKey}
            onChange={handleUnitChange}
            className="appearance-none bg-transparent text-on-surface-variant text-xs font-semibold pl-3 pr-7 py-3.5 outline-none cursor-pointer hover:text-on-surface transition-colors"
          >
            {units.map((u) => (
              <option key={u.key} value={u.key}>
                {u.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

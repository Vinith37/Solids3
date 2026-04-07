import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calculator, Info, Save, Share2, Zap, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { torsionService } from '../services/api';
import { useCalculation } from '../hooks/useCalculation';
import { useAnalysis } from '../hooks/useAnalysis';
import type { TorsionInput, TorsionResult } from '../types/api';

type SectionType = 'solid-circular' | 'hollow-circular' | 'rectangular';

export default function Torsion() {
  const navigate = useNavigate();
  const [section, setSection] = useState<SectionType>('solid-circular');
  const [torque, setTorque] = useState<number>(500); // Nm
  const [length, setLength] = useState<number>(2); // m
  const [modulus, setModulus] = useState<number>(80); // GPa (G)
  
  // Dimensions
  const [d1, setD1] = useState<number>(50); // mm (Outer diameter or width)
  const [d2, setD2] = useState<number>(30); // mm (Inner diameter or height)

  // --- Hooks: replaces 3 boilerplate useEffects ---
  const analysisInput: TorsionInput = { section, torque, length, modulus, d1, d2 };

  const { result: results } = useAnalysis<TorsionInput, TorsionResult>(
    torsionService.analyze,
    analysisInput,
  );

  const getState = useCallback(
    () => ({ section, torque, length, modulus, d1, d2 }),
    [section, torque, length, modulus, d1, d2],
  );

  const { saveState } = useCalculation({
    type: 'Torsion',
    module: '/torsion',
    getState,
    onLoad: (state) => {
      if (state.section !== undefined) setSection(state.section as SectionType);
      if (state.torque !== undefined) setTorque(state.torque as number);
      if (state.length !== undefined) setLength(state.length as number);
      if (state.modulus !== undefined) setModulus(state.modulus as number);
      if (state.d1 !== undefined) setD1(state.d1 as number);
      if (state.d2 !== undefined) setD2(state.d2 as number);
    },
  });

  // Fallback defaults while backend hasn't responded yet
  const r: TorsionResult = results ?? { maxShear: 0, angleRad: 0, angleDeg: 0, J: 0 };

  return (
    <MainLayout>
      <div className="space-y-12 pb-20">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors label-sm mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <h1 className="display-lg text-on-surface mb-4">Torsion Analysis</h1>
            <p className="body-md text-on-surface-variant">Calculate shear stress and twist for various shaft cross-sections with precise analytical approximations.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={saveState}
              className="w-full sm:w-auto px-6 py-3 bg-surface-container-high text-on-surface font-bold rounded-full hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save State
            </button>
            <button className="w-full sm:w-auto px-6 py-3 primary-gradient text-on-primary rounded-full font-bold hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg">
              <Share2 className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Inputs Panel */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-8">
            <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
              <h3 className="label-sm text-primary mb-6 md:mb-8 flex items-center gap-2">
                <Box className="w-5 h-5" />
                Section Geometry
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block label-sm text-on-surface-variant mb-3">Cross-Section Type</label>
                  <select 
                    value={section}
                    onChange={(e) => setSection(e.target.value as SectionType)}
                    className="w-full px-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-sans text-on-surface focus:ring-2 ring-primary/20 transition-all appearance-none"
                  >
                    <option value="solid-circular">Solid Circular</option>
                    <option value="hollow-circular">Hollow Circular</option>
                    <option value="rectangular">Rectangular</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block label-sm text-on-surface-variant mb-3">
                      {section === 'rectangular' ? 'Width (mm)' : 'Outer Dia (mm)'}
                    </label>
                    <input 
                      type="number" 
                      value={d1} 
                      onChange={(e) => setD1(Number(e.target.value))}
                      className="w-full px-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-mono text-on-surface focus:ring-2 ring-primary/20 transition-all" 
                    />
                  </div>
                  {section !== 'solid-circular' && (
                    <div>
                      <label className="block label-sm text-on-surface-variant mb-3">
                        {section === 'rectangular' ? 'Height (mm)' : 'Inner Dia (mm)'}
                      </label>
                      <input 
                        type="number" 
                        value={d2} 
                        onChange={(e) => setD2(Number(e.target.value))}
                        className="w-full px-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-mono text-on-surface focus:ring-2 ring-primary/20 transition-all" 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
              <h3 className="label-sm text-primary mb-6 md:mb-8 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Loading & Material
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block label-sm text-on-surface-variant mb-3">Applied Torque (Nm)</label>
                  <input 
                    type="number" 
                    value={torque} 
                    onChange={(e) => setTorque(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-mono text-on-surface focus:ring-2 ring-primary/20 transition-all" 
                  />
                </div>
                <div>
                  <label className="block label-sm text-on-surface-variant mb-3">Shaft Length (m)</label>
                  <input 
                    type="number" 
                    value={length} 
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-mono text-on-surface focus:ring-2 ring-primary/20 transition-all" 
                  />
                </div>
                <div>
                  <label className="block label-sm text-on-surface-variant mb-3">Shear Modulus G (GPa)</label>
                  <input 
                    type="number" 
                    value={modulus} 
                    onChange={(e) => setModulus(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-mono text-on-surface focus:ring-2 ring-primary/20 transition-all" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-surface-container-low p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] min-h-[400px] flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-engineering-dots opacity-5 pointer-events-none" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12 relative z-10">
                <div className="space-y-8 md:space-y-10">
                  <div>
                    <p className="label-sm text-on-surface-variant mb-3">Max Shear Stress</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl md:text-6xl font-black text-on-surface">{r.maxShear.toFixed(2)}</span>
                      <span className="text-xl md:text-2xl font-bold text-on-surface-variant">MPa</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="label-sm text-on-surface-variant mb-3">Angle of Twist</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl md:text-6xl font-black text-primary">{r.angleDeg.toFixed(3)}</span>
                      <span className="text-xl md:text-2xl font-bold text-on-surface-variant">deg</span>
                    </div>
                    <p className="label-sm text-on-surface-variant mt-2">({r.angleRad.toFixed(5)} rad)</p>
                  </div>

                  <div className="pt-8 border-t border-outline/10">
                    <p className="label-sm text-on-surface-variant mb-2">Polar Moment of Inertia (J)</p>
                    <p className="text-xl md:headline-md text-on-surface">{r.J.toFixed(4)} cm⁴</p>
                  </div>
                </div>

                <div className="flex items-center justify-center py-8 md:py-0">
                  <div className="relative w-40 h-40 md:w-64 md:h-64 bg-surface-container-lowest rounded-full ambient-shadow p-6 md:p-8">
                    {/* Visual representation of the shaft twist */}
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-outline)" strokeWidth="6" opacity={0.1} />
                      <motion.circle 
                        cx="50" cy="50" r="40" 
                        fill="none" stroke="var(--color-primary)" strokeWidth="8"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 * (1 - Math.min(r.angleDeg / 10, 1))}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                        initial={{ strokeDashoffset: 251.2 }}
                        animate={{ strokeDashoffset: 251.2 * (1 - Math.min(r.angleDeg / 10, 1)) }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                      <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 text-primary/10" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-[10px] md:label-sm font-bold text-primary uppercase tracking-tighter">Stress Profile</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 md:pt-10 border-t border-outline/10 relative z-10">
                <div className="flex gap-4">
                  <div className="p-2 bg-primary/10 rounded-xl h-fit">
                    <Info className="w-5 h-5 text-primary shrink-0" />
                  </div>
                  <p className="body-sm md:body-md text-on-surface-variant leading-relaxed">
                    For non-circular sections, the maximum shear stress occurs at the midpoint of the long side. The formulas used here are standard approximations for engineering design.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

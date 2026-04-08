import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Info, 
  Save, 
  Share2,
  Columns,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { bucklingService } from '../services/api';
import { useCalculation } from '../hooks/useCalculation';
import { useAnalysis } from '../hooks/useAnalysis';
import type { BucklingInput, BucklingResult } from '../types/api';

const END_CONDITIONS = [
  { label: 'Fixed-Free (K=2.0)', value: 2.0, desc: 'Cantilever column' },
  { label: 'Pinned-Pinned (K=1.0)', value: 1.0, desc: 'Both ends pinned' },
  { label: 'Fixed-Pinned (K=0.7)', value: 0.7, desc: 'One fixed, one pinned' },
  { label: 'Fixed-Fixed (K=0.5)', value: 0.5, desc: 'Both ends fixed' },
];

export default function Buckling() {
  const navigate = useNavigate();
  const [length, setLength] = useState<number>(3);       // m
  const [modulus, setModulus] = useState<number>(200);    // GPa
  const [inertia, setInertia] = useState<number>(5000);  // cm^4
  const [area, setArea] = useState<number>(50);           // cm^2
  const [endCondition, setEndCondition] = useState<number>(1.0);

  // --- Hooks ---
  const analysisInput: BucklingInput = { length, modulus, inertia, area, endCondition };

  const { result: rawResults } = useAnalysis<BucklingInput, BucklingResult>(
    bucklingService.analyze,
    analysisInput,
  );

  const getState = useCallback(
    () => ({ length, modulus, inertia, area, endCondition }),
    [length, modulus, inertia, area, endCondition],
  );

  const { saveState } = useCalculation({
    type: 'Buckling',
    module: '/buckling',
    getState,
    onLoad: (state) => {
      if (state.length !== undefined) setLength(state.length as number);
      if (state.modulus !== undefined) setModulus(state.modulus as number);
      if (state.inertia !== undefined) setInertia(state.inertia as number);
      if (state.area !== undefined) setArea(state.area as number);
      if (state.endCondition !== undefined) setEndCondition(state.endCondition as number);
    },
  });

  const results: BucklingResult = rawResults ?? { Pcr: 0, criticalStress: 0, slenderness: 0, effectiveLength: 0, isLongColumn: false };

  return (
    <MainLayout>
      <div className="space-y-12 pb-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors label-sm mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <h1 className="display-lg text-on-surface mb-4">Column Buckling</h1>
            <p className="body-md text-on-surface-variant">Euler stability analysis for long columns under axial compression with variable end-fixity conditions.</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-1 space-y-6 lg:space-y-8">
            <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] ambient-shadow">
              <h3 className="label-sm text-primary mb-6 md:mb-8 flex items-center gap-2">
                <Columns className="w-5 h-5" />
                Column Properties
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="label-sm text-on-surface-variant block mb-3">Column Length (m)</label>
                  <input 
                    type="number" 
                    value={length} 
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full px-5 py-3 bg-surface-container-highest rounded-2xl outline-none text-on-surface font-mono focus:ring-2 ring-primary/20 transition-all" 
                  />
                </div>
                <div>
                  <label className="label-sm text-on-surface-variant block mb-3">Elastic Modulus E (GPa)</label>
                  <input 
                    type="number" 
                    value={modulus}
                    onChange={(e) => setModulus(Number(e.target.value))}
                    className="w-full px-5 py-3 bg-surface-container-highest rounded-2xl outline-none text-on-surface font-mono focus:ring-2 ring-primary/20 transition-all" 
                  />
                </div>
                <div>
                  <label className="label-sm text-on-surface-variant block mb-3">Moment of Inertia I (cm⁴)</label>
                  <input 
                    type="number" 
                    value={inertia} 
                    onChange={(e) => setInertia(Number(e.target.value))}
                    className="w-full px-5 py-3 bg-surface-container-highest rounded-2xl outline-none text-on-surface font-mono focus:ring-2 ring-primary/20 transition-all" 
                  />
                </div>
                <div>
                  <label className="label-sm text-on-surface-variant block mb-3">Cross-Section Area A (cm²)</label>
                  <input 
                    type="number" 
                    value={area} 
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full px-5 py-3 bg-surface-container-highest rounded-2xl outline-none text-on-surface font-mono focus:ring-2 ring-primary/20 transition-all" 
                  />
                </div>
                <div>
                  <label className="label-sm text-on-surface-variant block mb-3">End Condition (K)</label>
                  <select 
                    value={endCondition}
                    onChange={(e) => setEndCondition(Number(e.target.value))}
                    className="w-full px-5 py-3 bg-surface-container-highest rounded-2xl outline-none text-on-surface focus:ring-2 ring-primary/20 transition-all appearance-none"
                  >
                    {END_CONDITIONS.map(ec => (
                      <option key={ec.value} value={ec.value}>{ec.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] ambient-shadow">
              <div className="flex gap-4">
                <div className={`p-2 rounded-xl h-fit ${results.isLongColumn ? 'bg-primary/10' : 'bg-amber-500/10'}`}>
                  {results.isLongColumn 
                    ? <CheckCircle className="w-5 h-5 text-primary shrink-0" /> 
                    : <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  }
                </div>
                <p className={`body-sm leading-relaxed ${results.isLongColumn ? 'text-on-surface-variant' : 'text-amber-600'}`}>
                  {results.isLongColumn 
                    ? <>The Euler formula is valid for <strong>Long Columns</strong> (λ = {results.slenderness} &gt; 30). Buckling governs the design.</>
                    : <>The column is <strong>intermediate/short</strong> (λ = {results.slenderness} ≤ 30). Consider Johnson's or empirical formulas.</>
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface-container-low p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] ambient-shadow min-h-[400px] md:min-h-[500px] flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-engineering-pattern opacity-10 pointer-events-none" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative z-10">
                <div className="space-y-8 md:space-y-12">
                  {/* Primary result */}
                  <div>
                    <div className="flex items-baseline gap-4 mb-2">
                      <span className="text-4xl md:text-6xl font-black text-primary">{results.Pcr.toFixed(1)}</span>
                      <div>
                        <span className="text-xl md:text-2xl font-bold text-on-surface">Critical Load P<sub>cr</sub></span>
                        <p className="label-sm text-on-surface-variant uppercase tracking-wider mt-1">Euler stability limit in kN</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Secondary metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div 
                      className="bg-surface-container-highest/40 rounded-2xl p-5 md:p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <p className="label-sm text-on-surface-variant mb-2">Slenderness λ</p>
                      <p className="text-xl md:text-2xl font-black text-on-surface">{results.slenderness}</p>
                      <p className="text-[10px] text-on-surface-variant mt-1">dimensionless</p>
                    </motion.div>

                    <motion.div 
                      className="bg-surface-container-highest/40 rounded-2xl p-5 md:p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="label-sm text-on-surface-variant mb-2">Critical Stress</p>
                      <p className="text-xl md:text-2xl font-black text-on-surface">{results.criticalStress.toFixed(1)}</p>
                      <p className="text-[10px] text-on-surface-variant mt-1">MPa</p>
                    </motion.div>
                  </div>

                  <div className="pt-6 md:pt-8 border-t border-outline/10">
                    <p className="label-sm text-on-surface-variant mb-2">Effective Length (KL)</p>
                    <p className="text-xl md:headline-md text-on-surface">{results.effectiveLength.toFixed(3)} m</p>
                  </div>
                </div>

                {/* Column visualization */}
                <div className="flex items-center justify-center py-8 md:py-0">
                  <div className="relative">
                    <svg viewBox="0 0 120 300" className="w-28 h-64 md:w-36 md:h-80">
                      {/* Column body */}
                      <rect x="45" y="30" width="30" height="240" rx="3" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/30" />
                      
                      {/* Buckled shape (dashed) */}
                      <path 
                        d={`M 60 30 Q ${endCondition >= 1.0 ? '90' : '75'} 150 60 270`}
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeDasharray="6 4" 
                        className="text-rose-400"
                      />

                      {/* Top load arrow */}
                      <line x1="60" y1="5" x2="60" y2="25" stroke="currentColor" strokeWidth="2.5" className="text-on-surface" />
                      <polygon points="53,22 67,22 60,30" fill="currentColor" className="text-on-surface" />
                      <text x="60" y="5" textAnchor="middle" className="fill-on-surface-variant text-[10px] font-bold">P</text>

                      {/* Bottom support */}
                      {endCondition <= 0.7 ? (
                        /* Fixed bottom */
                        <>
                          <rect x="30" y="270" width="60" height="8" fill="currentColor" className="text-on-surface-variant/40" />
                          <line x1="30" y1="278" x2="90" y2="278" stroke="currentColor" strokeWidth="2" className="text-on-surface-variant/60" />
                          {[35, 45, 55, 65, 75, 85].map(x => (
                            <line key={x} x1={x} y1="278" x2={x-5} y2="288" stroke="currentColor" strokeWidth="1" className="text-on-surface-variant/40" />
                          ))}
                        </>
                      ) : (
                        /* Pinned bottom */
                        <polygon points="50,270 70,270 60,285" fill="none" stroke="currentColor" strokeWidth="2" className="text-on-surface-variant/60" />
                      )}

                      {/* Top support */}
                      {endCondition === 0.5 ? (
                        /* Fixed top */
                        <>
                          <rect x="30" y="22" width="60" height="8" fill="currentColor" className="text-on-surface-variant/40" />
                        </>
                      ) : endCondition === 0.7 ? (
                        /* Pinned top */
                        <polygon points="50,30 70,30 60,18" fill="none" stroke="currentColor" strokeWidth="2" className="text-on-surface-variant/60" />
                      ) : null}

                      {/* K label */}
                      <text x="100" y="155" className="fill-on-surface-variant text-[9px] font-mono">K={endCondition}</text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

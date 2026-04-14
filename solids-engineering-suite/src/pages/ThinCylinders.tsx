import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Info, 
  Save, 
  Share2,
  Circle,
  Target,
  AlertTriangle,
  Hash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { thinCylinderService } from '../services/api';
import { useCalculation } from '../hooks/useCalculation';
import { useAnalysis } from '../hooks/useAnalysis';
import type { ThinCylinderInput, ThinCylinderResult } from '../types/api';
import UnitInput from '../components/UnitInput';
import UnitDisplay from '../components/UnitDisplay';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

export default function ThinCylinders() {
  const navigate = useNavigate();
  const [innerRadius, setInnerRadius] = useState<number>(200);   // mm
  const [wallThickness, setWallThickness] = useState<number>(10); // mm
  const [pressure, setPressure] = useState<number>(5);            // MPa
  const [endCondition, setEndCondition] = useState<string>('closed');

  // --- Hooks ---
  const analysisInput: ThinCylinderInput = { innerRadius, wallThickness, pressure, endCondition };

  const { result: rawResults } = useAnalysis<ThinCylinderInput, ThinCylinderResult>(
    thinCylinderService.analyze,
    analysisInput,
  );

  const getState = useCallback(
    () => ({ innerRadius, wallThickness, pressure, endCondition }),
    [innerRadius, wallThickness, pressure, endCondition],
  );

  const { saveState } = useCalculation({
    type: 'Thin Cylinders',
    module: '/thin-cylinders',
    getState,
    onLoad: (state) => {
      if (state.innerRadius !== undefined) setInnerRadius(state.innerRadius as number);
      if (state.wallThickness !== undefined) setWallThickness(state.wallThickness as number);
      if (state.pressure !== undefined) setPressure(state.pressure as number);
      if (state.endCondition !== undefined) setEndCondition(state.endCondition as string);
    },
  });

  const results: ThinCylinderResult = rawResults ?? { hoopStress: 0, longStress: 0, radialStress: 0, vonMises: 0, maxShear: 0, ratio: 0 };
  const isThinWall = results.ratio >= 10;

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
            <h1 className="display-lg text-on-surface mb-4">Thin Cylinders</h1>
            <p className="body-md text-on-surface-variant">Analyze hoop, longitudinal, and radial stresses in thin-walled pressure vessels under internal pressure.</p>
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
                <Circle className="w-5 h-5" />
                Vessel Properties
              </h3>
              
              <div className="space-y-5">
                <UnitInput
                  label="Inner Radius"
                  value={innerRadius}
                  onChange={setInnerRadius}
                  unitType="smallLength"
                />
                <UnitInput
                  label="Wall Thickness"
                  value={wallThickness}
                  onChange={setWallThickness}
                  unitType="smallLength"
                />
                <UnitInput
                  label="Internal Pressure"
                  value={pressure}
                  onChange={setPressure}
                  unitType="pressure"
                />
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.05em] text-on-surface-variant mb-2.5">End Condition</label>
                  <select 
                    value={endCondition}
                    onChange={(e) => setEndCondition(e.target.value)}
                    className="w-full px-5 py-3.5 bg-surface-container-highest rounded-2xl outline-none text-on-surface text-sm focus:ring-2 ring-primary/20 transition-all appearance-none border border-outline/5"
                  >
                    <option value="closed">Closed Ends (Capped)</option>
                    <option value="open">Open Ends</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] ambient-shadow">
              <div className="flex gap-4">
                <div className={`p-2 rounded-xl h-fit ${isThinWall ? 'bg-primary/10' : 'bg-amber-500/10'}`}>
                  {isThinWall ? <Info className="w-5 h-5 text-primary shrink-0" /> : <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />}
                </div>
                <div>
                  <p className={`body-sm leading-relaxed ${isThinWall ? 'text-on-surface-variant' : 'text-amber-600'}`}>
                    {isThinWall 
                      ? <>The thin-wall assumption is <strong>valid</strong> (r/t = {results.ratio} ≥ 10). Hoop stress is the dominant stress component.</>
                      : <>The thin-wall assumption may be <strong>invalid</strong> (r/t = {results.ratio} &lt; 10). Consider using thick-wall (Lamé) equations.</>
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface-container-low p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] ambient-shadow min-h-[400px] md:min-h-[500px] flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-engineering-pattern opacity-10 pointer-events-none" />
              
              <div className="relative z-10 flex-1">
                {/* Primary result */}
                <div className="mb-8 md:mb-12">
                  <div className="flex items-baseline gap-4 mb-2">
                    <UnitDisplay value={results.hoopStress} unitType="stress" precision={1} valueClassName="text-4xl md:text-6xl font-black text-primary" />
                  </div>
                  <div>
                    <span className="text-xl md:text-2xl font-bold text-on-surface">Hoop Stress σ<sub>h</sub></span>
                    <p className="label-sm text-on-surface-variant uppercase tracking-wider mt-1">Circumferential stress</p>
                  </div>
                </div>

                {/* Secondary results */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  <motion.div 
                    className="bg-surface-container-highest/40 rounded-2xl p-5 md:p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <p className="label-sm text-on-surface-variant mb-2">Longitudinal σ<sub>l</sub></p>
                    <UnitDisplay value={results.longStress} unitType="stress" precision={1} valueClassName="text-xl md:text-2xl font-black text-on-surface" />
                  </motion.div>

                  <motion.div 
                    className="bg-surface-container-highest/40 rounded-2xl p-5 md:p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="label-sm text-on-surface-variant mb-2">Von Mises σ<sub>v</sub></p>
                    <UnitDisplay value={results.vonMises} unitType="stress" precision={1} valueClassName="text-xl md:text-2xl font-black text-on-surface" />
                  </motion.div>

                  <motion.div 
                    className="bg-surface-container-highest/40 rounded-2xl p-5 md:p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="label-sm text-on-surface-variant mb-2">Max Shear τ<sub>max</sub></p>
                    <UnitDisplay value={results.maxShear} unitType="stress" precision={1} valueClassName="text-xl md:text-2xl font-black text-on-surface" />
                  </motion.div>

                  <motion.div 
                    className="bg-surface-container-highest/40 rounded-2xl p-5 md:p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="label-sm text-on-surface-variant mb-2">Radial σ<sub>r</sub></p>
                    <UnitDisplay value={results.radialStress} unitType="stress" precision={1} valueClassName="text-xl md:text-2xl font-black text-on-surface" />
                  </motion.div>

                  <motion.div 
                    className="bg-surface-container-highest/40 rounded-2xl p-5 md:p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="label-sm text-on-surface-variant mb-2">r/t Ratio</p>
                    <p className="text-xl md:text-2xl font-black text-on-surface">{results.ratio.toFixed(1)}</p>
                    <p className="text-[10px] text-on-surface-variant mt-1">dimensionless</p>
                  </motion.div>
                </div>

                {/* Cross-section visualization */}
                <div className="flex items-center justify-center mt-8 md:mt-12">
                  <div className="relative">
                    <svg viewBox="0 0 200 200" className="w-40 h-40 md:w-52 md:h-52">
                      {/* Outer circle */}
                      <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2" className="text-on-surface-variant/30" />
                      {/* Wall */}
                      <circle cx="100" cy="100" r={80} fill="none" stroke="currentColor" strokeWidth={Math.max(3, Math.min(25, 80 / results.ratio))} className="text-primary/30" />
                      {/* Inner circle */}
                      <circle cx="100" cy="100" r={Math.max(20, 80 - Math.max(3, Math.min(25, 80 / results.ratio)))} fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" className="text-on-surface-variant/50" />
                      {/* Arrows for hoop stress */}
                      <g className="text-primary">
                        <line x1="100" y1="15" x2="100" y2="5" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowUp)" />
                        <line x1="100" y1="185" x2="100" y2="195" stroke="currentColor" strokeWidth="2" />
                        <line x1="15" y1="100" x2="5" y2="100" stroke="currentColor" strokeWidth="2" />
                        <line x1="185" y1="100" x2="195" y2="100" stroke="currentColor" strokeWidth="2" />
                      </g>
                      {/* Center label */}
                      <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" className="fill-on-surface-variant text-[10px] font-bold">p = {pressure} MPa</text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Calculation Section */}
        <div className="bg-surface-container-low p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] mt-4 lg:mt-8 ambient-shadow relative overflow-hidden">
          <h3 className="text-xl md:headline-sm text-on-surface mb-6 md:mb-8 flex items-center gap-3 relative z-10"><Hash className="w-6 h-6 text-primary" />Detailed Calculation Steps</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative z-10">
            <div className="space-y-6">
              <div className="bg-surface-container-highest/50 p-6 rounded-2xl border border-outline/5 h-full">
                <h4 className="label-lg text-primary mb-4">1. Thin-Wall Verification</h4>
                <div className="overflow-x-auto text-on-surface pb-2 text-sm">
                  <p className="body-sm text-on-surface-variant mb-2">Check applicability of thin-wall assumption (<InlineMath math="r/t \ge 10" />):</p>
                  <BlockMath math={`\\text{Ratio} = \\frac{r}{t} = \\frac{${innerRadius}}{${wallThickness}} = ${results.ratio.toFixed(1)}`} />
                  <p className={`body-sm font-bold mt-2 text-center ${results.ratio >= 10 ? "text-primary" : "text-amber-500"}`}>
                    {results.ratio >= 10 ? "Assumption is Valid" : "Warning: Thick cylinder analysis is recommended"}
                  </p>
                </div>
                <hr className="border-outline/10 my-6" />
                <h4 className="label-lg text-primary mb-4">2. Principal Stresses</h4>
                <div className="overflow-x-auto text-on-surface pb-2 text-sm">
                  <p className="body-sm text-on-surface-variant mb-2">Hoop (Circumferential) Stress:</p>
                  <BlockMath math={`\\sigma_h = \\frac{p \\cdot r}{t} = \\frac{${pressure} \\cdot ${innerRadius}}{${wallThickness}} = ${results.hoopStress.toFixed(1)} \\text{ MPa}`} />
                  <p className="body-sm text-on-surface-variant mt-4 mb-2">Longitudinal (Axial) Stress:</p>
                  {endCondition === 'closed' ? (
                    <BlockMath math={`\\sigma_l = \\frac{p \\cdot r}{2t} = \\frac{${pressure} \\cdot ${innerRadius}}{2(${wallThickness})} = ${results.longStress.toFixed(1)} \\text{ MPa}`} />
                  ) : (
                    <BlockMath math={`\\sigma_l = 0 \\text{ MPa (Open Ends)}`} />
                  )}
                  <p className="body-sm text-on-surface-variant mt-4 mb-2">Radial Stress (Inner surface approximation):</p>
                  <BlockMath math={`\\sigma_r \\approx -\\frac{p}{2} = -\\frac{${pressure}}{2} = ${results.radialStress.toFixed(1)} \\text{ MPa}`} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-surface-container-highest/50 p-6 rounded-2xl border border-outline/5 h-full">
                <h4 className="label-lg text-primary mb-4">3. Comparative Failure Criteria</h4>
                <p className="body-sm text-on-surface-variant mb-4 font-bold uppercase tracking-widest text-[10px]">Maximum Shear Stress (Tresca)</p>
                <div className="overflow-x-auto text-on-surface pb-2 text-sm">
                  <BlockMath math={`\\tau_{max} = \\frac{\\sigma_h - \\sigma_l}{2}`} />
                  <BlockMath math={`\\tau_{max} = \\frac{${results.hoopStress.toFixed(1)} - ${results.longStress.toFixed(1)}}{2} = ${results.maxShear.toFixed(1)} \\text{ MPa}`} />
                </div>
                <hr className="border-outline/10 my-4" />
                <p className="body-sm text-on-surface-variant mb-4 font-bold uppercase tracking-widest text-[10px]">Von Mises (Distortion Energy)</p>
                <div className="overflow-x-auto text-on-surface pb-2 text-sm">
                  <BlockMath math={`\\sigma_{vm} = \\sqrt{\\sigma_h^2 - \\sigma_h\\sigma_l + \\sigma_l^2}`} />
                  <BlockMath math={`\\sigma_{vm} = \\sqrt{(${results.hoopStress.toFixed(1)})^2 - (${results.hoopStress.toFixed(1)})(${results.longStress.toFixed(1)}) + (${results.longStress.toFixed(1)})^2}`} />
                  <BlockMath math={`\\sigma_{vm} = ${results.vonMises.toFixed(1)} \\text{ MPa}`} />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

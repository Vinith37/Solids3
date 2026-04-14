import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Calculator, 
  Info, 
  Save, 
  Share2,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { fatigueService } from '../services/api';
import { useCalculation } from '../hooks/useCalculation';
import { useAnalysis } from '../hooks/useAnalysis';
import type { FatigueInput, FatigueResult } from '../types/api';
import UnitInput from '../components/UnitInput';
import UnitDisplay from '../components/UnitDisplay';
import { getDefaultUnitKey, fromBaseUnit, findUnit } from '../utils/units';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

export default function Fatigue() {
  const navigate = useNavigate();
  const [su, setSu] = useState<number>(600); // MPa
  const [sy, setSy] = useState<number>(450); // MPa
  const [se, setSe] = useState<number>(300); // MPa
  const [sigmaA, setSigmaA] = useState<number>(100); // MPa (Alternating)
  const [sigmaM, setSigmaM] = useState<number>(150); // MPa (Mean)
  const [stressUnit, setStressUnit] = useState(getDefaultUnitKey('stress'));

  // --- Hooks ---
  const analysisInput: FatigueInput = { su, sy, se, sa: sigmaA, sm: sigmaM };

  const { result: results } = useAnalysis<FatigueInput, FatigueResult>(
    fatigueService.analyze,
    analysisInput,
  );

  const getState = useCallback(
    () => ({ su, sy, se, sa: sigmaA, sm: sigmaM }),
    [su, sy, se, sigmaA, sigmaM],
  );

  const { saveState } = useCalculation({
    type: 'Fatigue',
    module: '/fatigue',
    getState,
    onLoad: (state) => {
      if (state.su !== undefined) setSu(state.su as number);
      if (state.sy !== undefined) setSy(state.sy as number);
      if (state.se !== undefined) setSe(state.se as number);
      if (state.sa !== undefined) setSigmaA(state.sa as number);
      if (state.sm !== undefined) setSigmaM(state.sm as number);
    },
  });

  const r: FatigueResult = results ?? { nG: 1.71, nS: 1.50, nGerber: 2.53, isSafe: true };

  // SVG Plotting constants
  const svgSize = 600;
  
  const maxX = Math.max(su, sy) * 1.2;
  const maxY = Math.max(se, sigmaA) * 1.2;

  const paddingLeft = 60;
  const paddingBottom = 60;
  const paddingTop = 20;
  const paddingRight = 40;
  
  const chartWidth = svgSize - paddingLeft - paddingRight;
  const chartHeight = svgSize - paddingBottom - paddingTop;
  
  const originX = paddingLeft;
  const originY = svgSize - paddingBottom;
  
  const scale = Math.min(chartWidth / maxX, chartHeight / maxY); 

  // Paths
  const generateGoodmanPath = () => {
    return `M ${originX} ${originY - se * scale} L ${originX + su * scale} ${originY}`;
  };

  const generateSoderbergPath = () => {
    return `M ${originX} ${originY - se * scale} L ${originX + sy * scale} ${originY}`;
  };

  const generateGerberPath = () => {
    const points = [];
    for (let x = 0; x <= su; x += su / 50) {
      const y = se * (1 - Math.pow(x / su, 2));
      points.push(`${originX + x * scale},${originY - y * scale}`);
    }
    return `M ${points.join(' L ')}`;
  };

  // Unit label for the axis
  const unitLabel = findUnit('stress', stressUnit).label;

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
            <h1 className="display-lg text-on-surface mb-4">Fatigue Analysis</h1>
            <p className="body-md text-on-surface-variant">Predict fatigue life under fluctuating loads using standard criteria and visualization of safety envelopes natively verified by our Python computational engine.</p>
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
                <ShieldCheck className="w-5 h-5" />
                Material Properties
              </h3>
              
              <div className="space-y-5">
                <UnitInput
                  label={<>Ultimate Strength S<sub className="lowercase">u</sub></>}
                  value={su}
                  onChange={setSu}
                  unitType="stress"
                  defaultUnit={stressUnit}
                />
                <UnitInput
                  label={<>Yield Strength S<sub className="lowercase">y</sub></>}
                  value={sy}
                  onChange={setSy}
                  unitType="stress"
                  defaultUnit={stressUnit}
                />
                <UnitInput
                  label={<>Endurance Limit S<sub className="lowercase">e</sub></>}
                  value={se}
                  onChange={setSe}
                  unitType="stress"
                  defaultUnit={stressUnit}
                />
              </div>
            </div>

            <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
              <h3 className="label-sm text-primary mb-6 md:mb-8 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Stress State
              </h3>
              
              <div className="space-y-5">
                <UnitInput
                  label={<>Mean Stress <InlineMath math="\sigma_m" /></>}
                  value={sigmaM}
                  onChange={setSigmaM}
                  unitType="stress"
                  defaultUnit={stressUnit}
                />
                <UnitInput
                  label={<>Alternating Stress <InlineMath math="\sigma_a" /></>}
                  value={sigmaA}
                  onChange={setSigmaA}
                  unitType="stress"
                  defaultUnit={stressUnit}
                />
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-surface-container-low p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col relative overflow-hidden ambient-shadow">
              
              <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-8 mb-12 relative z-10 p-4">
                <div className="flex items-center gap-6 md:gap-8">
                  <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center shrink-0 ${r.isSafe ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    <span className="text-3xl md:text-5xl font-black">{r.nG.toFixed(2)}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-on-surface">Goodman Safety Factor</h3>
                    <p className={`label-sm md:label-sm mt-2 font-bold ${r.isSafe ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {r.isSafe ? 'SAFE DESIGN' : 'FATIGUE FAILURE PREDICTED'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-8 md:gap-12 w-full xl:w-auto justify-between xl:justify-end border-t xl:border-t-0 border-outline/10 pt-6 xl:pt-0">
                  <div className="text-left md:text-right">
                    <p className="label-sm text-on-surface-variant mb-2 font-bold">SODERBERG</p>
                    <p className="text-2xl md:text-4xl font-light text-on-surface">{r.nS.toFixed(2)}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="label-sm text-on-surface-variant mb-2 font-bold">GERBER</p>
                    <p className="text-2xl md:text-4xl font-light text-on-surface">{r.nGerber.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Yield Envelope Plot */}
              <div className="w-full flex justify-center relative bg-surface-container-lowest rounded-[2rem] p-4 md:p-10 pt-16">
                
                <div className="absolute top-6 right-6 bg-surface-container-high p-6 rounded-2xl flex flex-col gap-4 z-20 shadow-sm border border-outline/5">
                  <div className="flex items-center gap-4">
                    <span className="w-6 h-0.5 bg-primary"></span>
                    <span className="label-sm text-on-surface">Goodman</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-6 h-0.5 bg-rose-500 stroke-dash"></span>
                    <span className="label-sm text-on-surface">Soderberg</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-6 h-0.5 bg-on-surface-variant dotted-line"></span>
                    <span className="label-sm text-on-surface">Gerber</span>
                  </div>
                </div>

                <style>{`
                  .stroke-dash { stroke-dasharray: 6 4; border-bottom: 2px dashed var(--color-rose-500); background: transparent; }
                  .dotted-line { stroke-dasharray: 2 4; border-bottom: 2px dotted var(--color-on-surface-variant); background: transparent; }
                `}</style>
                
                <div className="relative w-full max-w-[800px] aspect-[4/3] md:aspect-[3/2] overflow-visible mt-4">
                  <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="w-full h-full overflow-visible">
                    {/* Axes */}
                    <line x1={originX} y1={originY} x2={svgSize - 10} y2={originY} stroke="var(--color-on-surface)" strokeWidth="2.5" opacity="0.6" />
                    <line x1={originX} y1={originY} x2={originX} y2="10" stroke="var(--color-on-surface)" strokeWidth="2.5" opacity="0.6" />
                    
                    {/* Axis Labels */}
                    <text x={svgSize - 10} y={originY + 25} fill="var(--color-on-surface)" fontSize="14" className="font-mono font-bold">σ_m ({unitLabel})</text>
                    <text x={originX - 45} y="20" fill="var(--color-on-surface)" fontSize="14" className="font-mono font-bold">σ_a</text>
                    <text x={originX - 45} y="38" fill="var(--color-on-surface-variant)" fontSize="12" className="font-mono">({unitLabel})</text>

                    {/* Goodman */}
                    <path d={generateGoodmanPath()} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
                    {/* Soderberg */}
                    <path d={generateSoderbergPath()} fill="none" stroke="var(--color-rose-500)" strokeWidth="2" strokeDasharray="8 6" />
                    {/* Gerber */}
                    <path d={generateGerberPath()} fill="none" stroke="var(--color-on-surface-variant)" strokeWidth="1.5" strokeDasharray="3 5" />

                    {/* Stress State */}
                    <circle cx={originX + sigmaM * scale} cy={originY - sigmaA * scale} r="8" fill="var(--color-primary)" opacity="0.8" />
                    <text x={originX + sigmaM * scale + 15} y={originY - sigmaA * scale + 5} fill="var(--color-on-surface)" fontSize="14" fontWeight="600" className="font-mono bg-surface-container-lowest">({sigmaM}, {sigmaA})</text>
                  </svg>
                </div>
              </div>

              <div className="bg-primary/5 p-6 md:p-8 rounded-[1.5rem] mt-8 flex flex-col md:flex-row gap-4 border border-primary/10 w-full items-start md:items-center">
                <Info className="w-6 h-6 text-primary shrink-0" />
                <p className="body-md text-on-surface-variant leading-relaxed">
                  The Goodman criteria is the most common for ductile materials. Soderberg is the most conservative as it uses Yield Strength instead of Ultimate Strength.
                </p>
              </div>
            </div>

            {/* Calculations Panel */}
            <div className="bg-surface-container-low p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] mt-6 lg:mt-12 ambient-shadow">
              <h3 className="text-xl md:headline-sm text-on-surface mb-6 md:mb-10 flex items-center gap-3">
                <Calculator className="w-6 h-6 text-primary" />
                Mathematical Derivations
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-6">
                  <div className="bg-surface-container-highest/50 p-6 rounded-2xl border border-outline/5 h-full">
                    <h4 className="label-lg text-primary mb-4">1. Goodman Theory</h4>
                    <p className="body-sm text-on-surface-variant mb-2">Linear interpolation connecting alternating endurance explicitly targeting ultimate structural strength limits linearly mapping absolute dynamic threshold margins:</p>
                    <div className="overflow-x-auto text-on-surface pb-2 text-sm mt-4">
                      <BlockMath math={`\\frac{\\sigma_a}{S_e} + \\frac{\\sigma_m}{S_u} = \\frac{1}{n_G}`} />
                      <BlockMath math={`n_G = \\frac{1}{\\frac{${sigmaA}}{${se}} + \\frac{${sigmaM}}{${su}}} = ${r.nG.toFixed(2)}`} />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-surface-container-highest/50 p-6 rounded-2xl border border-outline/5 h-full">
                    <h4 className="label-lg text-rose-500 mb-4">2. Soderberg Theory</h4>
                    <p className="body-sm text-on-surface-variant mb-2">A deeply conservative formulation dynamically pivoting static anchor lines onto explicit elastic limits ensuring deformation avoidance over fatigue tolerance:</p>
                    <div className="overflow-x-auto text-on-surface pb-2 text-sm mt-4">
                      <BlockMath math={`\\frac{\\sigma_a}{S_e} + \\frac{\\sigma_m}{S_y} = \\frac{1}{n_S}`} />
                      <BlockMath math={`n_S = \\frac{1}{\\frac{${sigmaA}}{${se}} + \\frac{${sigmaM}}{${sy}}} = ${r.nS.toFixed(2)}`} />
                    </div>
                  </div>
                </div>
                <div className="space-y-6 lg:col-span-2">
                  <div className="bg-surface-container-highest/50 p-6 rounded-2xl border border-outline/5">
                    <h4 className="label-lg text-on-surface mb-4">3. Gerber Parabolic Theory</h4>
                    <p className="body-sm text-on-surface-variant mb-2">Utilizing advanced empirical correlation fitting quadratic bounds tracking structural endurance curves precisely fitting traditional experimental data plots optimally across high-cycle margins:</p>
                    <div className="overflow-x-auto text-on-surface pb-2 text-sm mt-4">
                      <BlockMath math={`\\frac{n \\cdot \\sigma_a}{S_e} + \\left(\\frac{n \\cdot \\sigma_m}{S_u}\\right)^2 = 1`} />
                      <BlockMath math={`\\text{Solving bounds quadratically: } n_{Gerber} = ${r.nGerber.toFixed(2)}`} />
                    </div>
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

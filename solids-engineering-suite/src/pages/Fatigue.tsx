import React, { useState, useMemo } from 'react';
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

export default function Fatigue() {
  const navigate = useNavigate();
  const [su, setSu] = useState<number>(600); // MPa
  const [sy, setSy] = useState<number>(450); // MPa
  const [se, setSe] = useState<number>(300); // MPa (Corrected Endurance Limit)
  const [sigmaA, setSigmaA] = useState<number>(100); // MPa (Alternating)
  const [sigmaM, setSigmaM] = useState<number>(150); // MPa (Mean)

  const results = useMemo(() => {
    // Goodman: sigmaA/Se + sigmaM/Su = 1/n
    const nGoodman = 1 / (sigmaA / se + sigmaM / su);
    
    // Soderberg: sigmaA/Se + sigmaM/Sy = 1/n
    const nSoderberg = 1 / (sigmaA / se + sigmaM / sy);
    
    // Gerber: sigmaA/Se + (sigmaM/Su)^2 = 1/n
    const nGerber = 1 / (sigmaA / se + Math.pow(sigmaM / su, 2));

    return {
      nGoodman,
      nSoderberg,
      nGerber,
      isSafe: nGoodman >= 1
    };
  }, [su, sy, se, sigmaA, sigmaM]);

  // SVG Plotting constants
  const svgSize = 400;
  const padding = 40;
  const chartSize = svgSize - padding * 2;
  const maxVal = Math.max(su, sy, se) * 1.1;
  const scale = chartSize / maxVal;

  const originX = padding;
  const originY = svgSize - padding;

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
            <h1 className="display-lg text-on-surface mb-4">Fatigue & S-N Curve</h1>
            <p className="body-md text-on-surface-variant">Predict fatigue life under fluctuating loads using standard criteria and visualization of safety envelopes.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="w-full sm:w-auto px-6 py-3 bg-surface-container-high text-on-surface font-bold rounded-full hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2">
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
              
              <div className="space-y-6">
                <div>
                  <label className="block label-sm text-on-surface-variant mb-3">Ultimate Strength Sᵤ (MPa)</label>
                  <input 
                    type="number" 
                    value={su} 
                    onChange={(e) => setSu(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-mono text-on-surface focus:ring-2 ring-primary/20 transition-all" 
                  />
                </div>
                <div>
                  <label className="block label-sm text-on-surface-variant mb-3">Yield Strength Sᵧ (MPa)</label>
                  <input 
                    type="number" 
                    value={sy} 
                    onChange={(e) => setSy(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-mono text-on-surface focus:ring-2 ring-primary/20 transition-all" 
                  />
                </div>
                <div>
                  <label className="block label-sm text-on-surface-variant mb-3">Endurance Limit Sₑ (MPa)</label>
                  <input 
                    type="number" 
                    value={se} 
                    onChange={(e) => setSe(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-mono text-on-surface focus:ring-2 ring-primary/20 transition-all" 
                  />
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
              <h3 className="label-sm text-primary mb-6 md:mb-8 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Stress State
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block label-sm text-on-surface-variant mb-3">Mean Stress σₘ (MPa)</label>
                  <input 
                    type="number" 
                    value={sigmaM} 
                    onChange={(e) => setSigmaM(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-mono text-on-surface focus:ring-2 ring-primary/20 transition-all" 
                  />
                </div>
                <div>
                  <label className="block label-sm text-on-surface-variant mb-3">Alternating Stress σₐ (MPa)</label>
                  <input 
                    type="number" 
                    value={sigmaA} 
                    onChange={(e) => setSigmaA(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-mono text-on-surface focus:ring-2 ring-primary/20 transition-all" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-surface-container-low p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] min-h-[500px] flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-engineering-dots opacity-5 pointer-events-none" />
              
              <div className="w-full flex flex-col md:flex-row justify-between items-start gap-8 mb-12 relative z-10">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center ambient-shadow shrink-0 ${results.isSafe ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                    <span className="text-2xl md:text-3xl font-black">{results.nGoodman.toFixed(2)}</span>
                  </div>
                  <div>
                    <h3 className="text-xl md:headline-md text-on-surface">Goodman Safety Factor</h3>
                    <p className={`label-sm font-bold mt-1 ${results.isSafe ? 'text-primary' : 'text-error'}`}>
                      {results.isSafe ? 'SAFE DESIGN' : 'FATIGUE FAILURE PREDICTED'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-8 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <p className="label-sm text-on-surface-variant mb-1">Soderberg</p>
                    <p className="text-xl md:headline-md text-on-surface">{results.nSoderberg.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="label-sm text-on-surface-variant mb-1">Gerber</p>
                    <p className="text-xl md:headline-md text-on-surface">{results.nGerber.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Fatigue Diagram */}
              <div className="relative w-full aspect-[16/9] bg-surface-container-lowest rounded-[1.5rem] md:rounded-[2rem] overflow-hidden ambient-shadow">
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-engineering-grid" />
                <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="w-full h-full">
                  {/* Axes */}
                  <line x1={originX} y1={originY} x2={svgSize - 20} y2={originY} stroke="var(--color-outline)" strokeWidth="1" opacity={0.3} />
                  <line x1={originX} y1={originY} x2={originX} y2={20} stroke="var(--color-outline)" strokeWidth="1" opacity={0.3} />
                  
                  {/* Axis Labels */}
                  <text x={svgSize - 30} y={originY + 20} fill="var(--color-on-surface-variant)" fontSize="12" fontWeight="700" className="label-sm">σₘ</text>
                  <text x={originX - 30} y="30" fill="var(--color-on-surface-variant)" fontSize="12" fontWeight="700" className="label-sm">σₐ</text>

                  {/* Soderberg Line (Se to Sy) */}
                  <line 
                    x1={originX} y1={originY - se * scale} 
                    x2={originX + sy * scale} y2={originY} 
                    stroke="var(--color-error)" strokeWidth="1.5" strokeDasharray="4 2" 
                  />
                  
                  {/* Goodman Line (Se to Su) */}
                  <line 
                    x1={originX} y1={originY - se * scale} 
                    x2={originX + su * scale} y2={originY} 
                    stroke="var(--color-primary)" strokeWidth="2" 
                  />

                  {/* Gerber Curve (Se to Su) */}
                  <path 
                    d={`M ${originX},${originY - se * scale} Q ${originX + su * scale * 0.5},${originY - se * scale} ${originX + su * scale},${originY}`} 
                    fill="none" stroke="var(--color-secondary)" strokeWidth="1.5" strokeDasharray="2 2" 
                  />

                  {/* Current Stress Point */}
                  <circle 
                    cx={originX + sigmaM * scale} 
                    cy={originY - sigmaA * scale} 
                    r="6" 
                    fill={results.isSafe ? "var(--color-primary)" : "var(--color-error)"} 
                    className="animate-pulse"
                  />
                  <text 
                    x={originX + sigmaM * scale + 12} 
                    y={originY - sigmaA * scale - 12} 
                    fill="var(--color-on-surface)" 
                    fontSize="11" 
                    fontWeight="700"
                    className="label-sm"
                  >
                    ({sigmaM}, {sigmaA})
                  </text>
                </svg>

                {/* Legend */}
                <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-surface-container-high/80 backdrop-blur-md p-3 md:p-4 rounded-xl md:rounded-2xl border border-outline/10 space-y-2 md:space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-0.5 bg-primary"></span>
                    <span className="text-[10px] md:label-sm text-on-surface">Goodman</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-0.5 bg-error border-t border-dashed"></span>
                    <span className="text-[10px] md:label-sm text-on-surface">Soderberg</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-0.5 bg-secondary border-t border-dotted"></span>
                    <span className="text-[10px] md:label-sm text-on-surface">Gerber</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 md:pt-10 border-t border-outline/10 relative z-10">
                <div className="flex gap-4">
                  <div className="p-2 bg-primary/10 rounded-xl h-fit">
                    <Info className="w-5 h-5 text-primary shrink-0" />
                  </div>
                  <p className="body-sm md:body-md text-on-surface-variant leading-relaxed">
                    The Goodman criteria is the most common for ductile materials. Soderberg is the most conservative as it uses Yield Strength instead of Ultimate Strength.
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

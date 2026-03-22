import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft,
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  Save, 
  FileDown, 
  Plus,
  Activity
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';

export default function MohrCircle() {
  const navigate = useNavigate();
  const [sigmaX, setSigmaX] = useState<number>(80);
  const [sigmaY, setSigmaY] = useState<number>(20);
  const [tauXY, setTauXY] = useState<number>(30);

  const calculations = useMemo(() => {
    const avg = (sigmaX + sigmaY) / 2;
    const radius = Math.sqrt(Math.pow((sigmaX - sigmaY) / 2, 2) + Math.pow(tauXY, 2));
    const sigma1 = avg + radius;
    const sigma2 = avg - radius;
    const maxShear = radius;

    return {
      avg,
      radius,
      sigma1,
      sigma2,
      maxShear
    };
  }, [sigmaX, sigmaY, tauXY]);

  // SVG Scaling logic
  const svgSize = 400;
  const center = svgSize / 2;
  const maxVal = Math.max(Math.abs(calculations.sigma1), Math.abs(calculations.sigma2), Math.abs(calculations.maxShear)) * 1.5;
  const scale = (svgSize / 2 - 40) / maxVal;

  const circleX = center + calculations.avg * scale;
  const circleY = center;
  const circleR = calculations.radius * scale;

  const pointX1 = center + sigmaX * scale;
  const pointY1 = center - tauXY * scale;
  const pointX2 = center + sigmaY * scale;
  const pointY2 = center + tauXY * scale;

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
            <h1 className="display-lg text-on-surface mb-4">Mohr's Circle</h1>
            <p className="body-md text-on-surface-variant">Analyze state of stress at a point through the graphical representation of principal stresses and maximum shear stress transformation.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="w-full sm:w-auto px-6 py-3 bg-surface-container-high text-on-surface font-bold rounded-full hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              Save State
            </button>
            <button className="w-full sm:w-auto px-6 py-3 primary-gradient text-on-primary rounded-full font-bold hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg">
              <FileDown className="w-4 h-4" />
              Export Plot
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Inputs & Derivation */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-8">
            {/* Input Card */}
            <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
              <h3 className="label-sm text-primary mb-6 md:mb-8">Initial Stress State</h3>
              <div className="space-y-6">
                {[
                  { label: 'Normal Stress σₓ (MPa)', value: sigmaX, setter: setSigmaX },
                  { label: 'Normal Stress σᵧ (MPa)', value: sigmaY, setter: setSigmaY },
                  { label: 'Shear Stress τₓᵧ (MPa)', value: tauXY, setter: setTauXY },
                ].map((input) => (
                  <div key={input.label}>
                    <label className="block label-sm text-on-surface-variant mb-3">{input.label}</label>
                    <div className="relative group">
                      <input 
                        type="number" 
                        value={input.value} 
                        onChange={(e) => input.setter(Number(e.target.value))}
                        className="w-full px-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-mono text-on-surface focus:ring-2 ring-primary/20 transition-all" 
                      />
                      <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Derivation Card */}
            <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none bg-engineering-grid" />
              <h3 className="label-sm text-on-surface-variant mb-6 md:mb-8 relative z-10">Analytical Derivation</h3>
              <div className="space-y-6 relative z-10">
                <div className="bg-surface-container-high p-4 md:p-6 rounded-2xl">
                  <p className="label-sm text-on-surface-variant mb-3">1. Average Stress (Center)</p>
                  <p className="text-lg md:text-xl font-serif text-on-surface leading-loose">
                    σ<sub className="text-xs">avg</sub> = <span className="border-b border-outline/20">σₓ + σᵧ</span> / 2 = {calculations.avg.toFixed(1)} MPa
                  </p>
                </div>
                <div className="bg-surface-container-high p-4 md:p-6 rounded-2xl">
                  <p className="label-sm text-on-surface-variant mb-3">2. Circle Radius (R)</p>
                  <p className="text-base md:text-lg font-serif text-on-surface italic">
                    R = √[((σₓ-σᵧ)/2)² + τₓᵧ²] = {calculations.radius.toFixed(1)} MPa
                  </p>
                </div>
                <div className="bg-surface-container-high p-4 md:p-6 rounded-2xl">
                  <p className="label-sm text-on-surface-variant mb-3">3. Principal Stresses</p>
                  <p className="text-lg md:text-xl font-serif text-primary mb-3">
                    σ<sub className="text-xs">1,2</sub> = σ<sub className="text-xs">avg</sub> ± R
                  </p>
                  <div className="flex flex-wrap gap-4 md:gap-6">
                    <span className="text-on-surface font-bold text-lg md:text-xl">{calculations.sigma1.toFixed(1)} <span className="label-sm opacity-50">MPa</span></span>
                    <span className="text-on-surface font-bold text-lg md:text-xl">{calculations.sigma2.toFixed(1)} <span className="label-sm opacity-50">MPa</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Plot */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="bg-surface-container-low rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 h-full flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 md:mb-10">
                <div className="flex items-center gap-4">
                  <span className="inline-block w-3 h-3 rounded-full bg-primary ambient-shadow"></span>
                  <h3 className="text-xl md:headline-md text-on-surface">Stress Plot</h3>
                </div>
                <div className="flex gap-3">
                  <button className="p-3 bg-surface-container-high rounded-xl text-on-surface-variant hover:text-primary transition-colors"><ZoomIn className="w-5 h-5" /></button>
                  <button className="p-3 bg-surface-container-high rounded-xl text-on-surface-variant hover:text-primary transition-colors"><ZoomOut className="w-5 h-5" /></button>
                  <button className="p-3 bg-surface-container-high rounded-xl text-on-surface-variant hover:text-primary transition-colors"><RefreshCw className="w-5 h-5" /></button>
                </div>
              </div>

              {/* SVG Plot */}
              <div className="flex-1 relative bg-surface-container-lowest rounded-[1.5rem] md:rounded-[2rem] overflow-hidden min-h-[400px] md:min-h-[500px] ambient-shadow">
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-engineering-grid" />
                
                <div className="absolute inset-0 flex items-center justify-center p-4 md:p-12">
                  <svg className="w-full h-full max-w-[550px]" viewBox={`0 0 ${svgSize} ${svgSize}`}>
                    {/* Grid Lines */}
                    <line x1="0" y1={center} x2={svgSize} y2={center} stroke="var(--color-outline)" strokeWidth="1" opacity="0.2" />
                    <line x1={center} y1="0" x2={center} y2={svgSize} stroke="var(--color-outline)" strokeWidth="1" opacity="0.2" />
                    
                    {/* Axis Labels */}
                    <text x={svgSize - 30} y={center - 15} fill="var(--color-on-surface-variant)" fontSize="14" fontWeight="600" className="label-sm">σ</text>
                    <text x={center + 15} y="30" fill="var(--color-on-surface-variant)" fontSize="14" fontWeight="600" className="label-sm">τ</text>

                    {/* Mohr Circle */}
                    <circle 
                      cx={circleX} 
                      cy={circleY} 
                      r={circleR} 
                      fill="rgba(60, 221, 199, 0.05)" 
                      stroke="var(--color-primary)" 
                      strokeWidth="3" 
                      strokeDasharray="8 4"
                    />
                    
                    {/* Diameter Line */}
                    <line 
                      x1={pointX1} 
                      y1={pointY1} 
                      x2={pointX2} 
                      y2={pointY2} 
                      stroke="var(--color-on-surface-variant)" 
                      strokeWidth="2" 
                      opacity="0.3"
                    />

                    {/* Stress Points */}
                    <circle cx={pointX1} cy={pointY1} r="6" fill="var(--color-primary)" />
                    <circle cx={pointX2} cy={pointY2} r="6" fill="var(--color-primary)" />
                    
                    {/* Center Point */}
                    <circle cx={circleX} cy={circleY} r="4" fill="var(--color-primary)" />

                    {/* Principal Stress Points */}
                    <circle cx={center + calculations.sigma1 * scale} cy={center} r="6" fill="var(--color-primary)" className="opacity-80" />
                    <circle cx={center + calculations.sigma2 * scale} cy={center} r="6" fill="var(--color-primary)" className="opacity-80" />

                    {/* Max Shear Point */}
                    <circle cx={circleX} cy={center - circleR} r="6" fill="var(--color-error)" />
                    <line x1={circleX} y1={center} x2={circleX} y2={center - circleR} stroke="var(--color-error)" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />

                    {/* Point Labels */}
                    <text x={pointX1 + 12} y={pointY1 - 12} fill="var(--color-on-surface)" fontSize="12" fontWeight="700" className="font-mono">({sigmaX}, {tauXY})</text>
                    <text x={pointX2 - 50} y={pointY2 + 25} fill="var(--color-on-surface)" fontSize="12" fontWeight="700" className="font-mono">({sigmaY}, {-tauXY})</text>
                  </svg>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 glass-surface p-3 md:p-5 rounded-xl md:rounded-2xl space-y-2 md:space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span className="text-[10px] md:label-sm text-on-surface">State of Stress (σ, τ)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-primary opacity-50"></span>
                    <span className="text-[10px] md:label-sm text-on-surface-variant">Principal Stresses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-error"></span>
                    <span className="text-[10px] md:label-sm text-on-surface">Max Shear Stress</span>
                  </div>
                </div>
              </div>

              {/* Bottom Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-10">
                <div className="bg-surface-container-high p-4 md:p-6 rounded-2xl">
                  <p className="label-sm text-on-surface-variant mb-2">Center (C)</p>
                  <p className="text-xl md:text-2xl font-bold text-on-surface">{calculations.avg.toFixed(1)} <span className="label-sm opacity-40">MPa</span></p>
                </div>
                <div className="bg-surface-container-high p-4 md:p-6 rounded-2xl">
                  <p className="label-sm text-on-surface-variant mb-2">Radius (R)</p>
                  <p className="text-xl md:text-2xl font-bold text-on-surface">{calculations.radius.toFixed(1)} <span className="label-sm opacity-40">MPa</span></p>
                </div>
                <div className="bg-primary/10 p-4 md:p-6 rounded-2xl">
                  <p className="label-sm text-primary mb-2">Max Shear (τₘₐₓ)</p>
                  <p className="text-xl md:text-2xl font-bold text-primary">{calculations.maxShear.toFixed(1)} <span className="label-sm opacity-40">MPa</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] hover:bg-surface-container-high transition-colors cursor-pointer group">
            <Save className="w-8 h-8 md:w-10 md:h-10 text-primary mb-4 md:mb-6" />
            <h4 className="text-base md:text-lg font-bold text-on-surface mb-2">Save Snapshot</h4>
            <p className="body-md text-on-surface-variant leading-relaxed">Persist current stress configuration to the project history.</p>
          </div>
          <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] hover:bg-surface-container-high transition-colors cursor-pointer">
            <FileDown className="w-8 h-8 md:w-10 md:h-10 text-on-surface-variant mb-4 md:mb-6" />
            <h4 className="text-base md:text-lg font-bold text-on-surface mb-2">Export Vector</h4>
            <p className="body-md text-on-surface-variant leading-relaxed">Download current plot as high-fidelity SVG or PDF.</p>
          </div>
          <div className="sm:col-span-2 bg-surface-container-high p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] relative overflow-hidden flex items-center">
            <div className="relative z-10">
              <h4 className="text-lg md:text-xl font-bold text-on-surface mb-2">Recent Failure Criteria</h4>
              <p className="body-md text-on-surface-variant mb-6">Von Mises: <span className="text-error font-mono font-bold">FAIL (124% load)</span></p>
              <button className="label-sm text-primary flex items-center gap-2 group">
                VIEW DETAILED REPORT 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-end pr-8 md:pr-12 opacity-5">
              <Activity className="w-24 h-24 md:w-32 md:h-32 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 md:w-16 md:h-16 primary-gradient text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
        <Plus className="w-6 h-6 md:w-8 md:h-8" />
      </button>
    </MainLayout>
  );
}

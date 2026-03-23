import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calculator, Info, Save, Share2, Target, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

export default function FailureTheories() {
  const navigate = useNavigate();
  const [sigmaX, setSigmaX] = useState<number>(150);
  const [sigmaY, setSigmaY] = useState<number>(50);
  const [tauXY, setTauXY] = useState<number>(0);
  const [sy, setSy] = useState<number>(250);

  const [sigma1, setSigma1] = useState(150);
  const [sigma2, setSigma2] = useState(50);
  const [results, setResults] = useState({
    vonMisesStress: 0,
    nVonMises: 0,
    nTresca: 0,
    nRankine: 0,
    isSafe: true
  });

  useEffect(() => {
    async function executePythonBackend() {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/failure-theories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sigmaX, sigmaY, tauXY, sy })
        });
        if (response.ok) {
          const data = await response.json();
          setSigma1(data.sigma1);
          setSigma2(data.sigma2);
          setResults({
            vonMisesStress: data.vonMisesStress,
            nVonMises: data.nVonMises,
            nTresca: data.nTresca,
            nRankine: data.nRankine,
            isSafe: data.isSafe
          });
        }
      } catch (err) {
        console.error("Python Backend Math Verification Failed:", err);
      }
    }
    executePythonBackend();
  }, [sigmaX, sigmaY, tauXY, sy]);

  // SVG Plotting constants
  const svgSize = 400;
  const center = svgSize / 2;
  const scale = (svgSize / 2 - 40) / sy; // Scale relative to Yield Strength

  // Generate Von Mises Ellipse path
  const generateVonMisesPath = () => {
    const points = [];
    for (let theta = 0; theta <= 360; theta += 5) {
      const rad = (theta * Math.PI) / 180;
      const a = sy * Math.sqrt(2);
      const b = sy * Math.sqrt(2/3);
      
      const x = a * Math.cos(rad);
      const y = b * Math.sin(rad);
      
      const cos45 = Math.cos(Math.PI / 4);
      const sin45 = Math.sin(Math.PI / 4);
      const rx = x * cos45 - y * sin45;
      const ry = x * sin45 + y * cos45;
      
      points.push(`${center + rx * scale},${center - ry * scale}`);
    }
    return `M ${points.join(' L ')} Z`;
  };

  // Generate Tresca (MSS) Hexagon path
  const generateTrescaPath = () => {
    const p1 = `${center + sy * scale},${center - sy * scale}`;
    const p2 = `${center + 0 * scale},${center - sy * scale}`;
    const p3 = `${center - sy * scale},${center - 0 * scale}`;
    const p4 = `${center - sy * scale},${center + sy * scale}`;
    const p5 = `${center - 0 * scale},${center + sy * scale}`;
    const p6 = `${center + sy * scale},${center - 0 * scale}`;
    return `M ${p1} L ${p2} L ${p3} L ${p4} L ${p5} L ${p6} Z`;
  };

  // Generate Rankine (MNS) Square path
  const generateRankinePath = () => {
    return `M ${center + sy * scale},${center - sy * scale} 
            L ${center - sy * scale},${center - sy * scale} 
            L ${center - sy * scale},${center + sy * scale} 
            L ${center + sy * scale},${center + sy * scale} Z`;
  };

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
            <h1 className="display-lg text-on-surface mb-4">Failure Theories</h1>
            <p className="body-md text-on-surface-variant">Analyze 2D stress states against standard failure criteria (Von Mises, Tresca, Rankine) securely processed through python integration.</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Inputs Panel */}
          <div className="lg:col-span-1 space-y-6 lg:space-y-8">
            <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
              <h3 className="text-xl md:headline-sm text-on-surface mb-6 md:mb-8 flex items-center gap-3">
                <Calculator className="w-6 h-6 text-primary" />
                Parameters
              </h3>
              
              <div className="space-y-6">
                {[
                  { id: 'sx', label: <span className="flex items-center gap-1.5">NORMAL STRESS <span className="normal-case tracking-normal text-base mt-[-2px]"><InlineMath math="\sigma_x" /></span> (MPA)</span>, value: sigmaX, setter: setSigmaX },
                  { id: 'sy', label: <span className="flex items-center gap-1.5">NORMAL STRESS <span className="normal-case tracking-normal text-base mt-[-2px]"><InlineMath math="\sigma_y" /></span> (MPA)</span>, value: sigmaY, setter: setSigmaY },
                  { id: 'txy', label: <span className="flex items-center gap-1.5">SHEAR STRESS <span className="normal-case tracking-normal text-base mt-[-2px]"><InlineMath math="\tau_{xy}" /></span> (MPA)</span>, value: tauXY, setter: setTauXY },
                  { id: 'syield', label: <span className="flex items-center gap-1.5">YIELD STRENGTH S<sub className="lowercase ml-[1px]">y</sub> (MPA)</span>, value: sy, setter: setSy },
                ].map((input) => (
                  <div key={input.id}>
                    <label className="block label-xs tracking-widest uppercase font-bold text-on-surface-variant mb-3">{input.label}</label>
                    <div className="relative group">
                      <input 
                        type="number" 
                        value={input.value} 
                        onChange={(e) => input.setter(Number(e.target.value))}
                        className="w-full px-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-mono text-on-surface focus:ring-2 ring-primary/20 transition-all border border-outline/5" 
                      />
                      <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-primary/10">
              <div className="flex gap-4">
                <Info className="w-6 h-6 text-primary shrink-0" />
                <p className="body-sm md:body-md text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface">Von Mises (Distortion Energy)</strong> is generally more accurate for ductile materials than the Maximum Shear Stress theory.
                </p>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface-container-low p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] min-h-[500px] md:min-h-[600px] flex flex-col items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-engineering-dots opacity-20 pointer-events-none" />
              
              <div className="w-full flex flex-col md:flex-row justify-between items-start gap-8 mb-12 relative z-10">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center ambient-shadow shrink-0 ${results.isSafe ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    <span className="text-2xl md:text-3xl font-black">{results.nVonMises.toFixed(2)}</span>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-on-surface">Safety Factor (n)</h3>
                    <p className={`label-sm mt-1 ${results.isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {results.isSafe ? 'SAFE DESIGN' : 'FAILURE PREDICTED'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 md:gap-8 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-left md:text-right">
                    <p className="label-sm text-on-surface-variant mb-1">Tresca (MSS)</p>
                    <p className="text-xl md:text-2xl font-bold text-on-surface">{results.nTresca.toFixed(2)}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="label-sm text-on-surface-variant mb-1">Rankine (MNS)</p>
                    <p className="text-xl md:text-2xl font-bold text-on-surface">{results.nRankine.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Yield Envelope Plot */}
              <div className="w-full max-w-[450px] flex flex-col items-center gap-6">
                <div className="relative w-full aspect-square bg-surface-container-lowest rounded-[1.5rem] md:rounded-[2rem] overflow-hidden ambient-shadow">
                  <div className="absolute inset-0 opacity-10 pointer-events-none bg-engineering-grid" />
                  <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="w-full h-full">
                    {/* Axes */}
                    <line x1="0" y1={center} x2={svgSize} y2={center} stroke="var(--color-outline)" strokeWidth="1" opacity="0.2" />
                    <line x1={center} y1="0" x2={center} y2={svgSize} stroke="var(--color-outline)" strokeWidth="1" opacity="0.2" />
                    {/* Axis Labels are moved below the envelopes to render on top! */}

                    {/* Rankine Envelope */}
                    <path d={generateRankinePath()} fill="none" stroke="var(--color-orange-500, #f59e0b)" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />

                    {/* Von Mises Envelope */}
                    <path d={generateVonMisesPath()} fill="rgba(60, 221, 199, 0.05)" stroke="var(--color-primary)" strokeWidth="3" />
                    
                    {/* Tresca Envelope */}
                    <path d={generateTrescaPath()} fill="none" stroke="var(--color-on-surface-variant)" strokeWidth="2" strokeDasharray="8 4" opacity="0.5" />

                    {/* Current Stress Point */}
                    <circle 
                      cx={center + sigma1 * scale} 
                      cy={center - sigma2 * scale} 
                      r="6" 
                      fill={results.isSafe ? "var(--color-primary)" : "var(--color-error)"} 
                      className="animate-pulse"
                    />
                    <text 
                      x={center + sigma1 * scale + (sigma1 > sy * 0.5 ? -14 : 14)} 
                      y={center - sigma2 * scale + (sigma2 > sy * 0.5 ? 20 : -14)} 
                      textAnchor={sigma1 > sy * 0.5 ? "end" : "start"}
                      fill="var(--color-on-surface)" 
                      fontSize="12" 
                      fontWeight="700"
                      className="font-mono bg-surface/50"
                      paintOrder="stroke"
                      stroke="var(--color-surface)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      ({sigma1}, {sigma2})
                    </text>

                    {/* Axis Labels (Rendered last for maximum Z-Index) */}
                    <text x={svgSize - 30} y={center - 15} fill="var(--color-on-surface-variant)" fontSize="16" fontWeight="700" className="label-sm normal-case lowercase font-mono" paintOrder="stroke" stroke="var(--color-surface-container-lowest)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">σ₁</text>
                    <text x={center + 15} y="30" fill="var(--color-on-surface-variant)" fontSize="16" fontWeight="700" className="label-sm normal-case lowercase font-mono" paintOrder="stroke" stroke="var(--color-surface-container-lowest)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">σ₂</text>
                  </svg>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 bg-surface-container-low border border-outline/10 p-3 md:p-4 rounded-xl md:rounded-2xl w-full">
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="w-4 h-1 bg-primary rounded-full"></span>
                    <span className="text-xs md:label-sm text-on-surface">Von Mises</span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="w-4 h-1 border-t-2 border-dashed border-on-surface-variant opacity-50"></span>
                    <span className="text-xs md:label-sm text-on-surface">Tresca</span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="w-4 h-1 border-t-2 border-dotted border-orange-500 opacity-50"></span>
                    <span className="text-xs md:label-sm text-on-surface">Rankine</span>
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

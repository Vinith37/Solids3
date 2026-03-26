import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, RefreshCw, ZoomIn, ZoomOut, Save, FileDown, Plus, Activity, Hash } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { apiUrl } from '../lib/api';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

export default function MohrCircle() {
  const navigate = useNavigate();
  const location = useLocation();
  const [is3D, setIs3D] = useState(false);
  const [sigmaX, setSigmaX] = useState<number>(80);
  const [sigmaY, setSigmaY] = useState<number>(20);
  const [sigmaZ, setSigmaZ] = useState<number>(0);
  const [tauXY, setTauXY] = useState<number>(30);

  const [calculations, setCalculations] = useState({
      avg: 50,
      radius: 42.43,
      sigma1: 92.43,
      sigma2: 7.57,
      p1: 92.43, p2: 7.57, p3: 0,
      absMaxShear: 46.21,
      twoThetaPRad: 0,
      thetaP: 0
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('loadId');
    if (id) {
      fetch(apiUrl(`/api/load-calculation/${id}`))
        .then(res => res.json())
        .then(data => {
          if (data.state) {
            setIs3D(data.state.is3D);
            setSigmaX(data.state.sigmaX);
            setSigmaY(data.state.sigmaY);
            setSigmaZ(data.state.sigmaZ);
            setTauXY(data.state.tauXY);
          }
        });
    }
  }, [location.search]);

  useEffect(() => {
    async function executePythonBackend() {
      try {
        const response = await fetch(apiUrl('/api/mohr-circle'), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is3D, sigmaX, sigmaY, sigmaZ, tauXY })
        });
        if (response.ok) {
          const data = await response.json();
          setCalculations(data);
        }
      } catch (err) {
        console.error("Python Backend Math Verification Failed:", err);
      }
    }
    executePythonBackend();
  }, [sigmaX, sigmaY, tauXY, sigmaZ, is3D]);

  const saveState = async () => {
    const name = prompt("Name this calculation:", `Mohr's Circle ${new Date().toLocaleTimeString()}`);
    if (!name) return;

    try {
      await fetch(apiUrl('/api/save-calculation'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          type: "Mohr's Circle",
          module: "/mohr-circle",
          state: { is3D, sigmaX, sigmaY, sigmaZ, tauXY }
        })
      });
      alert("Archived successfully!");
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  // Dynamic SVG Bound Mapping Logic
  const svgSize = 400;
  
  // Calculate bounding box bounds to fit geometry accurately on screen
  const startX = Math.min(0, calculations.p3); // ensure τ axis is shown
  const endX = Math.max(0, calculations.p1);   // ensure 0 axis is shown
  const dataMidX = (startX + endX) / 2;
  
  // The max required span determines our global scale
  const maxSpan = Math.max(endX - startX, calculations.absMaxShear * 2) * 1.2 || 100;
  const scale = (svgSize - 80) / maxSpan; // 80px total spatial padding around the envelope
  const mapX = (x: number) => (svgSize / 2) + (x - dataMidX) * scale;
  const mapY = (y: number) => (svgSize / 2) - y * scale;

  const originX = mapX(0);
  const originY = mapY(0);

  const circleX = mapX(calculations.avg);
  const circleY = mapY(0);
  const circleR = calculations.radius * scale;

  const c1R = ((calculations.p1 - calculations.p3) / 2) * scale;
  const c1X = mapX((calculations.p1 + calculations.p3) / 2);
  const c2R = ((calculations.p1 - calculations.p2) / 2) * scale;
  const c2X = mapX((calculations.p1 + calculations.p2) / 2);
  const c3R = ((calculations.p2 - calculations.p3) / 2) * scale;
  const c3X = mapX((calculations.p2 + calculations.p3) / 2);

  const pointX1 = mapX(sigmaX);
  const pointY1 = mapY(tauXY);
  const pointX2 = mapX(sigmaY);
  const pointY2 = mapY(-tauXY);

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
            <h1 className="display-lg text-on-surface mb-4">Mohr's Circle</h1>
            <p className="body-md text-on-surface-variant">Analyze state of stress at a point through the graphical representation of principal stresses and maximum shear stress transformation.</p>
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
              <FileDown className="w-4 h-4" />
              Export Plot
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4 space-y-6 lg:space-y-8">
            <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h3 className="label-sm text-primary">Initial Stress State</h3>
              </div>
              
              <div className="flex items-center justify-between bg-surface-container-highest p-1 rounded-full mb-6 relative">
                <div className={`absolute inset-y-1 w-[calc(50%-4px)] bg-primary rounded-full transition-transform duration-300 ${is3D ? 'translate-x-[calc(100%+0px)]' : 'translate-x-0'}`}></div>
                <button onClick={() => setIs3D(false)} className={`flex-1 py-3 text-center label-sm relative z-10 transition-colors ${!is3D ? 'text-on-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>2D Plane</button>
                <button onClick={() => setIs3D(true)} className={`flex-1 py-3 text-center label-sm relative z-10 transition-colors ${is3D ? 'text-on-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>3D State</button>
              </div>

              <div className="space-y-6">
                {[
                  { id: 'sx', label: <>Normal Stress <span className="normal-case lowercase font-mono tracking-tighter">σₓ</span> (MPa)</>, value: sigmaX, setter: setSigmaX, show: true },
                  { id: 'sy', label: <>Normal Stress <span className="normal-case lowercase font-mono tracking-tighter">σy</span> (MPa)</>, value: sigmaY, setter: setSigmaY, show: true },
                  { id: 'sz', label: <>Normal Stress <span className="normal-case lowercase font-mono tracking-tighter">σz</span> (MPa)</>, value: sigmaZ, setter: setSigmaZ, show: is3D },
                  { id: 'txy', label: <>Shear Stress <span className="normal-case lowercase font-mono tracking-tighter">τxy</span> (MPa)</>, value: tauXY, setter: setTauXY, show: true },
                ].filter(i=>i.show).map((input) => (
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
          </div>
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

              <div className="flex-1 relative bg-surface-container-lowest rounded-[1.5rem] md:rounded-[2rem] overflow-hidden min-h-[400px] md:min-h-[500px] ambient-shadow">
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-engineering-grid" />
                <div className="absolute inset-0 flex items-center justify-center p-4 md:p-12">
                  <svg className="w-full h-full max-w-[550px]" viewBox={`0 0 ${svgSize} ${svgSize}`}>
                    <line x1="0" y1={originY} x2={svgSize} y2={originY} stroke="black" strokeWidth="2.5" />
                    <line x1={originX} y1="0" x2={originX} y2={svgSize} stroke="black" strokeWidth="2.5" />
                    <text x={svgSize - 30} y={originY - 15} fill="var(--color-on-surface-variant)" fontSize="16" fontWeight="700" className="label-sm normal-case lowercase font-mono">σ</text>
                    <text x={originX + 15} y="30" fill="var(--color-on-surface-variant)" fontSize="16" fontWeight="700" className="label-sm normal-case lowercase font-mono">τ</text>

                    {is3D && (
                      <>
                        <circle cx={c1X} cy={originY} r={c1R} fill="var(--color-primary)" opacity="0.05" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="6 4" />
                        <circle cx={c2X} cy={originY} r={c2R} fill="none" stroke="var(--color-on-surface-variant)" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                        <circle cx={c3X} cy={originY} r={c3R} fill="none" stroke="var(--color-on-surface-variant)" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                      </>
                    )}

                    <circle cx={circleX} cy={circleY} r={circleR} fill="rgba(60, 221, 199, 0.08)" stroke="var(--color-primary)" strokeWidth={is3D ? "2" : "3"} strokeDasharray={is3D ? "4 2" : "8 4"} />
                    <line x1={pointX1} y1={pointY1} x2={pointX2} y2={pointY2} stroke="var(--color-on-surface-variant)" strokeWidth="2" opacity="0.3" />
                    <circle cx={pointX1} cy={pointY1} r="6" fill="var(--color-primary)" />
                    <circle cx={pointX2} cy={pointY2} r="6" fill="var(--color-primary)" />
                    <circle cx={circleX} cy={circleY} r="4" fill="var(--color-primary)" />
                    <circle cx={mapX(calculations.p1)} cy={originY} r="6" fill="var(--color-primary)" className="opacity-80" />
                    <circle cx={mapX(calculations.p2)} cy={originY} r="6" fill="var(--color-primary)" className="opacity-80" />
                    <circle cx={mapX(calculations.p3)} cy={originY} r="6" fill="var(--color-primary)" className="opacity-80" />
                    <circle cx={c1X} cy={originY - c1R} r="6" fill="var(--color-error)" />
                    <line x1={c1X} y1={originY} x2={c1X} y2={originY - c1R} stroke="var(--color-error)" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />

                    {Math.abs(tauXY) > 0.1 && (
                      <g>
                        <path d={`M ${circleX + 30} ${circleY} A 30 30 0 0 ${tauXY > 0 ? 0 : 1} ${circleX + 30 * Math.cos(-calculations.twoThetaPRad)} ${circleY + 30 * Math.sin(-calculations.twoThetaPRad)}`} fill="none" stroke="var(--color-primary)" strokeWidth="2" opacity="0.6" strokeDasharray="2 2" />
                        <text x={circleX + 45 * Math.cos(-calculations.twoThetaPRad / 2)} y={circleY + 45 * Math.sin(-calculations.twoThetaPRad / 2) + 4} textAnchor="middle" fill="var(--color-primary)" fontSize="12" fontWeight="700" className="font-mono" paintOrder="stroke" stroke="var(--color-surface-container-lowest)" strokeWidth="4">2θp</text>
                      </g>
                    )}
                    <text x={pointX1 + 12} y={pointY1 - 12} fill="var(--color-on-surface)" fontSize="12" fontWeight="700" className="font-mono">({sigmaX}, {tauXY})</text>
                    <text x={pointX2 + (sigmaY > calculations.p1 * 0.5 && !is3D ? -14 : 14)} y={pointY2 + 25} textAnchor={sigmaY > calculations.p1 * 0.5 && !is3D ? "end" : "start"} fill="var(--color-on-surface)" fontSize="12" fontWeight="700" className="font-mono">({sigmaY}, {-tauXY})</text>
                  </svg>
                </div>
                <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 glass-surface p-3 md:p-5 rounded-xl md:rounded-2xl space-y-2 md:space-y-3">
                  <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-primary"></span><span className="text-[10px] md:label-sm text-on-surface">State of Stress (σ, τ)</span></div>
                  <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-primary opacity-50"></span><span className="text-[10px] md:label-sm text-on-surface-variant">Principal Stresses</span></div>
                  <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-error"></span><span className="text-[10px] md:label-sm text-on-surface">Max Shear Stress</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-10">
                <div className="bg-surface-container-high p-4 md:p-6 rounded-2xl"><p className="label-sm text-on-surface-variant mb-2">Center (C)</p><p className="text-xl md:text-2xl font-bold text-on-surface">{calculations.avg.toFixed(1)} <span className="label-sm opacity-40">MPa</span></p></div>
                <div className="bg-surface-container-high p-4 md:p-6 rounded-2xl"><p className="label-sm text-on-surface-variant mb-2">Radius (R)</p><p className="text-xl md:text-2xl font-bold text-on-surface">{calculations.radius.toFixed(1)} <span className="label-sm opacity-40">MPa</span></p></div>
                <div className="bg-primary/10 p-4 md:p-6 rounded-2xl relative overflow-hidden group"><p className="label-sm text-primary mb-2 flex flex-col gap-1"><span className="flex items-center gap-1">Abs. Max Shear <span className="normal-case lowercase font-mono">τₘₐₓ</span></span>{is3D && <span className="text-[10px] text-primary/60">(Absolute Over 3 Planes)</span>}</p><p className="text-xl md:text-2xl font-bold text-primary">{Math.abs(calculations.absMaxShear).toFixed(1)} <span className="label-sm opacity-40">MPa</span></p></div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] mt-4 lg:mt-8 ambient-shadow relative overflow-hidden">
          <h3 className="text-xl md:headline-sm text-on-surface mb-6 md:mb-8 flex items-center gap-3 relative z-10"><Hash className="w-6 h-6 text-primary" />Detailed Calculation Steps</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative z-10">
            <div className="space-y-6">
              <div className="bg-surface-container-highest/50 p-6 rounded-2xl border border-outline/5"><h4 className="label-lg text-primary mb-4">1. In-Plane Constitutive Parameters</h4><div className="overflow-x-auto text-on-surface pb-2"><BlockMath math={`\\sigma_{avg} = \\frac{\\sigma_x + \\sigma_y}{2} = \\frac{${sigmaX} + ${sigmaY}}{2} = ${calculations.avg.toFixed(2)} \\text{ MPa}`} /></div><div className="overflow-x-auto text-on-surface pb-2 mt-4"><BlockMath math={`R_{xy} = \\sqrt{\\left(\\frac{\\sigma_x - \\sigma_y}{2}\\right)^2 + \\tau_{xy}^2}`} /><BlockMath math={`R_{xy} = \\sqrt{\\left(\\frac{${sigmaX} - ${sigmaY}}{2}\\right)^2 + (${tauXY})^2} = ${calculations.radius.toFixed(2)} \\text{ MPa}`} /></div></div>
              <div className="bg-surface-container-highest/50 p-6 rounded-2xl border border-outline/5"><h4 className="label-lg text-primary mb-4">2. Principal Plane Orientation</h4><div className="overflow-x-auto text-on-surface pb-2 text-sm"><BlockMath math={`\\tan(2\\theta_p) = \\frac{2\\tau_{xy}}{\\sigma_x - \\sigma_y}`} /><BlockMath math={`2\\theta_p = ${(calculations.twoThetaPRad * 180 / Math.PI).toFixed(2)}^{\\circ} \\implies \\theta_p = ${calculations.thetaP.toFixed(2)}^{\\circ}`} /></div></div>
            </div>
            <div className="space-y-6">
              <div className="bg-surface-container-highest/50 p-6 rounded-2xl border border-outline/5 h-full"><h4 className="label-lg text-primary mb-4">3. Principal Stresses & Absolute Maxima</h4><div className="overflow-x-auto text-on-surface pb-2"><BlockMath math={`\\sigma_{1(xy)} = \\sigma_{avg} + R_{xy} = ${calculations.sigma1.toFixed(2)} \\text{ MPa}`} /><BlockMath math={`\\sigma_{2(xy)} = \\sigma_{avg} - R_{xy} = ${calculations.sigma2.toFixed(2)} \\text{ MPa}`} /></div><hr className="border-outline/10 my-6" /><div className="overflow-x-auto text-on-surface pb-2 text-sm"><BlockMath math={`\\sigma_1=${calculations.p1.toFixed(2)}, \\; \\sigma_3=${calculations.p3.toFixed(2)}`} /><BlockMath math={`\\tau_{max(abs)} = \\frac{\\sigma_1 - \\sigma_3}{2} = ${calculations.absMaxShear.toFixed(2)} \\text{ MPa}`} /></div></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div onClick={saveState} className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] hover:bg-surface-container-high transition-colors cursor-pointer group"><Save className="w-8 h-8 md:w-10 md:h-10 text-primary mb-4 md:mb-6" /><h4 className="text-base md:text-lg font-bold text-on-surface mb-2">Save Snapshot</h4><p className="body-md text-on-surface-variant leading-relaxed">Persist current stress configuration to the project history.</p></div>
          <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] hover:bg-surface-container-high transition-colors cursor-pointer"><FileDown className="w-8 h-8 md:w-10 md:h-10 text-on-surface-variant mb-4 md:mb-6" /><h4 className="text-base md:text-lg font-bold text-on-surface mb-2">Export Vector</h4><p className="body-md text-on-surface-variant leading-relaxed">Download current plot as high-fidelity SVG or PDF.</p></div>
          <div className="sm:col-span-2 bg-surface-container-high p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] relative overflow-hidden flex items-center"><div className="relative z-10"><h4 className="text-lg md:text-xl font-bold text-on-surface mb-2">Recent Failure Criteria</h4><p className="body-md text-on-surface-variant mb-6">Analytic stability verified.</p></div></div>
        </div>
      </div>
    </MainLayout>
  );
}

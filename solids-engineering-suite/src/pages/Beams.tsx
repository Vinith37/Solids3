import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calculator, 
  Plus, 
  Trash2, 
  Info, 
  Save, 
  Share2,
  Layers
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  ReferenceLine
} from 'recharts';
import MainLayout from '../layouts/MainLayout';
import { beamsService } from '../services/api';
import { useCalculation } from '../hooks/useCalculation';
import { useAnalysis } from '../hooks/useAnalysis';
import type { BeamsInput, BeamsResult, BeamLoadInput } from '../types/api';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

type LoadType = 'point' | 'udl' | 'uvl';

export default function Beams() {
  const navigate = useNavigate();
  const [length, setLength] = useState<number>(10);
  const [modulus, setModulus] = useState<number>(200); // GPa
  const [inertia, setInertia] = useState<number>(500); // cm^4
  const [loads, setLoads] = useState<BeamLoadInput[]>([
    { id: '1', type: 'point', position: 5, length: 0, magnitude: 10, endMagnitude: 10 }
  ]);
  const [beamType, setBeamType] = useState<'simply_supported' | 'cantilever'>('simply_supported');
  const [supportA, setSupportA] = useState<number>(0);
  const [supportB, setSupportB] = useState<number>(10);
  const [draggingSupport, setDraggingSupport] = useState<'A' | 'B' | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // --- Hooks ---
  const analysisInput: BeamsInput = { length, modulus, inertia, beamType, supportA, supportB, loads };

  const { result: analysis, isLoading, error } = useAnalysis<BeamsInput, BeamsResult>(
    beamsService.analyze,
    analysisInput,
  );

  const getState = useCallback(
    () => ({ length, modulus, inertia, beamType, supportA, supportB, loads }),
    [length, modulus, inertia, beamType, supportA, supportB, loads],
  );

  const { saveState } = useCalculation({
    type: 'Beams',
    module: '/beams',
    getState,
    onLoad: (state) => {
      if (state.length !== undefined) setLength(state.length as number);
      if (state.modulus !== undefined) setModulus(state.modulus as number);
      if (state.inertia !== undefined) setInertia(state.inertia as number);
      if (state.beamType !== undefined) setBeamType(state.beamType as 'simply_supported' | 'cantilever');
      if (state.supportA !== undefined) setSupportA(state.supportA as number);
      if (state.supportB !== undefined) setSupportB(state.supportB as number);
      if (state.loads !== undefined) setLoads(state.loads as BeamLoadInput[]);
    },
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingSupport || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const widthRatio = 800 / rect.width;
    const svgX = (e.clientX - rect.left) * widthRatio;
    let newPos = ((svgX - 100) / 600) * length;
    newPos = Math.max(0, Math.min(length, newPos));
    newPos = Math.round(newPos * 10) / 10;

    if (draggingSupport === 'A') {
      setSupportA(Math.min(newPos, supportB - 0.1));
    } else {
      setSupportB(Math.max(newPos, supportA + 0.1));
    }
  };

  const handleMouseUp = () => setDraggingSupport(null);

  const addLoad = () => {
    setLoads([...loads, { 
      id: Math.random().toString(36).substr(2, 9), 
      type: 'point', 
      position: Math.round(length / 2), 
      length: 0, 
      magnitude: 5, 
      endMagnitude: 5 
    }]);
  };

  const removeLoad = (id: string) => {
    setLoads(loads.filter(l => l.id !== id));
  };

  const updateLoad = (id: string, field: keyof BeamLoadInput, value: string | number) => {
    setLoads(loads.map(l => {
      if (l.id !== id) return l;
      if (field === 'type') {
        return { ...l, type: value as LoadType, length: value === 'point' ? 0 : 2 };
      }
      return { ...l, [field]: value };
    }));
  };

  if (!analysis) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          {error ? (
            <div className="text-error bg-error/10 p-6 rounded-2xl flex items-center gap-3">
              <Info className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-lg mb-1">Analysis Error</h3>
                <p>{error}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-on-surface-variant animate-pulse">Running beam analysis...</p>
            </div>
          )}
        </div>
      </MainLayout>
    );
  }

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
            <h1 className="display-lg text-on-surface mb-4">Beams & Deflection</h1>
            <p className="body-md text-on-surface-variant">Analyze shear force and bending moment for simply supported beams with multiple point loads.</p>
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
                <Layers className="w-5 h-5" />
                Beam Properties
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block label-sm text-on-surface-variant mb-3">Beam Length (m)</label>
                  <input 
                    type="number" 
                    value={length} 
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-mono text-on-surface focus:ring-2 ring-primary/20 transition-all" 
                  />
                </div>
                <div>
                  <label className="block label-sm text-on-surface-variant mb-3">E (GPa)</label>
                  <input 
                    type="number" 
                    value={modulus} 
                    onChange={(e) => setModulus(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-mono text-on-surface focus:ring-2 ring-primary/20 transition-all" 
                  />
                </div>
                <div>
                  <label className="block label-sm text-on-surface-variant mb-3">I (cm⁴)</label>
                  <input 
                    type="number" 
                    value={inertia} 
                    onChange={(e) => setInertia(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-mono text-on-surface focus:ring-2 ring-primary/20 transition-all" 
                  />
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h3 className="label-sm text-primary flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  System Loads
                </h3>
                <button 
                  onClick={addLoad}
                  className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {loads.map((load) => (
                  <div key={load.id} className="p-4 md:p-6 bg-surface-container-high rounded-2xl relative group">
                    <button 
                      onClick={() => removeLoad(load.id)}
                      className="absolute -top-2 -right-2 p-2 bg-error/10 text-error rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="mb-4">
                      <select 
                        value={load.type}
                        onChange={(e) => updateLoad(load.id, 'type', e.target.value)}
                        className="w-full px-4 py-3 bg-surface-container-highest rounded-xl outline-none text-on-surface font-bold text-sm"
                      >
                        <option value="point">Point Load</option>
                        <option value="udl">Uniformly Distributed (UDL)</option>
                        <option value="uvl">Uniformly Varying (UVL)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block label-sm text-on-surface-variant mb-2">Start Pos (m)</label>
                        <input 
                          type="number" 
                          value={load.position} 
                          onChange={(e) => updateLoad(load.id, 'position', Number(e.target.value))}
                          className="w-full px-4 py-2 bg-surface-container-highest rounded-xl outline-none text-on-surface font-mono" 
                        />
                      </div>
                      
                      {load.type !== 'point' && (
                        <div>
                          <label className="block label-sm text-on-surface-variant mb-2">Length (m)</label>
                          <input 
                            type="number" 
                            value={load.length} 
                            onChange={(e) => updateLoad(load.id, 'length', Number(e.target.value))}
                            className="w-full px-4 py-2 bg-surface-container-highest rounded-xl outline-none text-on-surface font-mono" 
                          />
                        </div>
                      )}
                      
                      <div>
                        <label className="block label-sm text-on-surface-variant mb-2">{load.type === 'point' ? 'Load' : 'Start W'} (kN)</label>
                        <input 
                          type="number" 
                          value={load.magnitude} 
                          onChange={(e) => updateLoad(load.id, 'magnitude', Number(e.target.value))}
                          className="w-full px-4 py-2 bg-surface-container-highest rounded-xl outline-none text-on-surface font-mono" 
                        />
                      </div>

                      {load.type === 'uvl' && (
                        <div>
                          <label className="block label-sm text-on-surface-variant mb-2">End W (kN)</label>
                          <input 
                            type="number" 
                            value={load.endMagnitude} 
                            onChange={(e) => updateLoad(load.id, 'endMagnitude', Number(e.target.value))}
                            className="w-full px-4 py-2 bg-surface-container-highest rounded-xl outline-none text-on-surface font-mono" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loads.length === 0 && (
                  <p className="text-center text-on-surface-variant label-sm py-8 opacity-50">No loads added. Add a load to see diagrams.</p>
                )}
              </div>
            </div>

            <div className="bg-primary/10 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none bg-engineering-dots" />
              <div className="flex gap-4 relative z-10">
                <div className="p-2 bg-primary/10 rounded-xl h-fit">
                  <Info className="w-5 h-5 text-primary shrink-0" />
                </div>
                <div className="space-y-4 w-full">
                  <p className="label-sm text-primary">Reactions</p>
                  <div className="grid grid-cols-2 gap-6 md:gap-8">
                    <div>
                      <p className="label-sm text-on-surface-variant mb-1">Rₐ (Left)</p>
                      <p className="text-xl md:text-2xl font-bold text-on-surface">{analysis.Ra.toFixed(2)} <span className="label-sm opacity-40">kN</span></p>
                    </div>
                    <div>
                      <p className="label-sm text-on-surface-variant mb-1">R_b (Right)</p>
                      <p className="text-xl md:text-2xl font-bold text-on-surface">{analysis.Rb.toFixed(2)} <span className="label-sm opacity-40">kN</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Diagrams Panel */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">
            {/* FBD */}
            <div className="bg-surface-container-low p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
                <h3 className="text-xl md:headline-md text-on-surface">Free Body Diagram (FBD)</h3>
                <div className="flex items-center gap-3">
                  <label className="label-sm text-on-surface-variant">Beam System:</label>
                  <select 
                    value={beamType} 
                    onChange={(e) => setBeamType(e.target.value as 'simply_supported' | 'cantilever')}
                    className="px-4 py-2 bg-surface-container-highest rounded-xl outline-none text-on-surface font-bold text-sm shadow-sm"
                  >
                    <option value="simply_supported">Simply Supported</option>
                    <option value="cantilever">Cantilever (Fixed-Free)</option>
                  </select>
                </div>
              </div>
              <div 
                className={`w-full bg-surface-container-lowest rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 ambient-shadow flex justify-center overflow-x-auto ${draggingSupport ? 'cursor-grabbing' : ''}`}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <svg viewBox="0 0 800 300" className="w-[800px] h-auto shrink-0 select-none" ref={svgRef}>
                  
                  {/* Outer Bounding Scale Guides */}
                  <line x1="100" y1="210" x2="700" y2="210" stroke="var(--color-outline)" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                  <text x="400" y="225" textAnchor="middle" fill="var(--color-on-surface-variant)" fontSize="12" className="font-mono">L = {length} m</text>
                  <line x1="100" y1="205" x2="100" y2="215" stroke="var(--color-outline)" strokeWidth="1" opacity="0.4" />
                  <line x1="700" y1="205" x2="700" y2="215" stroke="var(--color-outline)" strokeWidth="1" opacity="0.4" />
                  
                  {/* Dynamic Dimension Indicators (Visible when moving simply_supported) */}
                  <g opacity="0.8">
                     {beamType === 'simply_supported' && (
                       <>
                         <line x1="100" y1="250" x2={100 + (supportA/length)*600} y2="250" stroke="var(--color-primary)" strokeWidth="1" opacity="0.3" markerEnd="url(#arrowheadSmall)" markerStart="url(#arrowheadSmallR)" />
                         {supportA > 0 && <text x={100 + (supportA/length)*300} y="245" textAnchor="middle" fill="var(--color-primary)" fontSize="12" opacity="0.6">{supportA.toFixed(1)}m</text>}

                         <line x1={100 + (supportA/length)*600} y1="250" x2={100 + (supportB/length)*600} y2="250" stroke="var(--color-primary)" strokeWidth="1" opacity="0.3" markerEnd="url(#arrowheadSmall)" markerStart="url(#arrowheadSmallR)" />
                         <text x={100 + ((supportA+supportB)/2/length)*600} y="245" textAnchor="middle" fill="var(--color-primary)" fontSize="12" opacity="0.6">{(supportB - supportA).toFixed(1)}m</text>
                         
                         {supportB < length && (
                           <>
                             <line x1={100 + (supportB/length)*600} y1="250" x2="700" y2="250" stroke="var(--color-primary)" strokeWidth="1" opacity="0.3" markerEnd="url(#arrowheadSmall)" markerStart="url(#arrowheadSmallR)" />
                             <text x={100 + ((supportB+length)/2/length)*600} y="245" textAnchor="middle" fill="var(--color-primary)" fontSize="12" opacity="0.6">{(length - supportB).toFixed(1)}m</text>
                           </>
                         )}
                       </>
                     )}
                  </g>

                  {/* Main Beam */}
                  <line x1="100" y1="120" x2="700" y2="120" stroke="var(--color-on-surface)" strokeWidth="6" strokeLinecap="round" />

                  {beamType === 'simply_supported' ? (
                    <>
                      {/* Movable Support A */}
                  <g 
                    transform={`translate(${100 + (supportA / length) * 600}, 0)`} 
                    onMouseDown={(e) => { e.preventDefault(); setDraggingSupport('A'); }}
                    className="cursor-grab"
                  >
                    <path d="M 0 120 L -10 140 L 10 140 Z" fill={draggingSupport === 'A' ? "var(--color-primary)" : "none"} stroke="var(--color-on-surface)" strokeWidth="2" opacity="0.8" />
                    {[...Array(3)].map((_,i) => <line key={`LA${i}`} x1={-15+i*7} y1="140" x2={-20+i*7} y2="150" stroke="var(--color-on-surface)" strokeWidth="1" opacity="0.5"/>)}
                    <line x1="0" y1="180" x2="0" y2="125" stroke="var(--color-primary)" strokeWidth="3" markerEnd="url(#arrowheadPrimary)" />
                    <text x="0" y="195" textAnchor="middle" fill="var(--color-primary)" fontSize="14" fontWeight="bold">Rₐ = {analysis.Ra.toFixed(2)}</text>
                    
                    {/* Invisible Hitbox Expanders for Mouse Access */}
                    <rect x="-30" y="120" width="60" height="80" fill="transparent" />
                  </g>

                  {/* Movable Support B */}
                  <g 
                    transform={`translate(${100 + (supportB / length) * 600}, 0)`}
                    onMouseDown={(e) => { e.preventDefault(); setDraggingSupport('B'); }}
                    className="cursor-grab"
                  >
                    <circle cx="0" cy="130" r="10" fill={draggingSupport === 'B' ? "var(--color-primary)" : "none"} stroke="var(--color-on-surface)" strokeWidth="2" opacity="0.8" />
                    {[...Array(3)].map((_,i) => <line key={`LB${i}`} x1={-15+i*7} y1="140" x2={-20+i*7} y2="150" stroke="var(--color-on-surface)" strokeWidth="1" opacity="0.5"/>)}
                    <line x1="0" y1="180" x2="0" y2="145" stroke="var(--color-primary)" strokeWidth="3" markerEnd="url(#arrowheadPrimary)" />
                    <text x="0" y="195" textAnchor="middle" fill="var(--color-primary)" fontSize="14" fontWeight="bold">R_b = {analysis.Rb.toFixed(2)}</text>

                      {/* Invisible Hitbox */}
                      <rect x="-30" y="120" width="60" height="80" fill="transparent" />
                    </g>
                  </>) : (
                    <>
                      {/* Fixed Cantilever Wall at x=100 (which is 0m) */}
                      <rect x="80" y="80" width="20" height="80" fill="var(--color-on-surface-variant)" opacity="0.8" />
                      {[...Array(8)].map((_,i) => <line key={`W${i}`} x1="70" y1={85+i*10} x2="80" y2={80+i*10} stroke="var(--color-on-surface-variant)" />)}
                      <line x1="100" y1="80" x2="100" y2="160" stroke="var(--color-on-surface)" strokeWidth="6" />
                      
                      {/* Reaction Ra */}
                      <line x1="100" y1="180" x2="100" y2="125" stroke="var(--color-primary)" strokeWidth="3" markerEnd="url(#arrowheadPrimary)" />
                      <text x="100" y="195" textAnchor="middle" fill="var(--color-primary)" fontSize="14" fontWeight="bold">Rₐ = {analysis.Ra.toFixed(2)}</text>
                      
                      {/* Reaction Ma */}
                      <path d="M 130 150 A 30 30 0 0 0 130 90" fill="none" stroke="var(--color-primary)" strokeWidth="3" markerEnd="url(#arrowheadPrimary)" />
                      <text x="145" y="80" fill="var(--color-primary)" fontSize="14" fontWeight="bold">Mₐ = {analysis.Ma.toFixed(2)}</text>
                    </>
                  )}

                  {/* Load Vectors */}
                  {analysis.sortedLoads.map((load) => {
                    const x = 100 + (load.position / length) * 600;
                    if (load.type === 'point') {
                      const isUp = load.magnitude < 0;
                      return (
                        <g key={load.id}>
                          <line x1={x} y1={isUp ? "150" : "50"} x2={x} y2={isUp ? "115" : "115"} stroke={isUp ? "var(--color-secondary)" : "var(--color-error)"} strokeWidth="3" markerEnd={isUp ? "url(#arrowheadSecondary)" : "url(#arrowheadError)"} />
                          <text x={x} y={isUp ? "165" : "40"} textAnchor="middle" fill={isUp ? "var(--color-secondary)" : "var(--color-error)"} fontSize="14" fontWeight="bold">P = {load.magnitude} kN</text>
                        </g>
                      );
                    } else {
                      // UDL or UVL
                      const endX = 100 + ((load.position + load.length) / length) * 600;
                      const spanX = endX - x;
                      // Determine max boundary height to scale the polygons nicely
                      const maxAbs = Math.max(Math.abs(load.magnitude), Math.abs(load.type === 'uvl' ? load.endMagnitude : load.magnitude));
                      const isUp = maxAbs < 0; 
                      
                      const h1 = isUp ? 120 + Math.abs(load.magnitude)/maxAbs * 35 : 120 - Math.abs(load.magnitude)/maxAbs * 35;
                      const h2 = isUp ? 120 + Math.abs(load.type === 'uvl' ? load.endMagnitude : load.magnitude)/maxAbs * 35 : 120 - Math.abs(load.type === 'uvl' ? load.endMagnitude : load.magnitude)/maxAbs * 35;
                      
                      return (
                        <g key={load.id}>
                          {/* Polygons */}
                          <polygon points={`${x},120 ${x},${h1} ${endX},${h2} ${endX},120`} fill={isUp ? "var(--color-secondary)" : "var(--color-error)"} opacity="0.15" />
                          <line x1={x} y1={h1} x2={endX} y2={h2} stroke={isUp ? "var(--color-secondary)" : "var(--color-error)"} strokeWidth="2" opacity="0.7"/>
                          
                          {/* Intensity Lines */}
                          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                            const curX = x + spanX * ratio;
                            const curH = h1 + (h2 - h1) * ratio;
                            if (Math.abs(curH - 120) < 2) return null; // Too small
                            return <line key={ratio} x1={curX} y1={curH} x2={curX} y2={isUp ? 121 : 119} stroke={isUp ? "var(--color-secondary)" : "var(--color-error)"} strokeWidth="2" markerEnd={isUp ? "url(#arrowheadSecondary)" : "url(#arrowheadError)"} />
                          })}
                          
                          {/* Text bounds */}
                          <text x={x + spanX / 2} y={isUp ? Math.max(h1, h2) + 15 : Math.min(h1, h2) - 10} textAnchor="middle" fill={isUp ? "var(--color-secondary)" : "var(--color-error)"} fontSize="12" fontWeight="bold" className="bg-surface/50">
                            {load.type === 'udl' ? `w = ${load.magnitude} kN/m` : `w: ${load.magnitude} ➝ ${load.endMagnitude}`}
                          </text>
                        </g>
                      );
                    }
                  })}

                  <defs>
                    <marker id="arrowheadPrimary" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                      <polygon points="0 0, 6 2, 0 4" fill="var(--color-primary)" />
                    </marker>
                    <marker id="arrowheadError" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                      <polygon points="0 0, 6 2, 0 4" fill="var(--color-error)" />
                    </marker>
                    <marker id="arrowheadSecondary" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                      <polygon points="0 0, 6 2, 0 4" fill="var(--color-secondary)" />
                    </marker>
                    <marker id="arrowheadSmall" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
                      <polygon points="0 0, 4 2, 0 4" fill="var(--color-primary)" />
                    </marker>
                    <marker id="arrowheadSmallR" markerWidth="4" markerHeight="4" refX="1" refY="2" orient="auto">
                      <polygon points="4 0, 0 2, 4 4" fill="var(--color-primary)" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Shear Force Diagram */}
            <div className="bg-surface-container-low p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem]">
              <h3 className="text-xl md:headline-md text-on-surface mb-6 md:mb-10">Shear Force Diagram (V)</h3>
              <div className="h-[250px] md:h-[300px] w-full bg-surface-container-lowest rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 ambient-shadow">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysis.data}>
                    <defs>
                      <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline)" opacity={0.1} />
                    <XAxis dataKey="x" hide />
                    <YAxis stroke="var(--color-on-surface-variant)" fontSize={10} tickFormatter={(v) => `${v}kN`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-surface-container-high)', border: 'none', borderRadius: '16px', color: 'var(--color-on-surface)' }}
                      itemStyle={{ color: 'var(--color-primary)' }}
                    />
                    <ReferenceLine y={0} stroke="var(--color-on-surface-variant)" strokeWidth={2} opacity={0.5} />
                    <Area type="stepAfter" dataKey="V" stroke="var(--color-primary)" fill="url(#colorV)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bending Moment Diagram */}
            <div className="bg-surface-container-low p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem]">
              <h3 className="text-xl md:headline-md text-on-surface mb-6 md:mb-10">Bending Moment Diagram (M)</h3>
              <div className="h-[250px] md:h-[300px] w-full bg-surface-container-lowest rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 ambient-shadow">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysis.data}>
                    <defs>
                      <linearGradient id="colorM" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-tertiary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-tertiary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline)" opacity={0.1} />
                    <XAxis dataKey="x" stroke="var(--color-on-surface-variant)" fontSize={10} tickFormatter={(v) => `${v}m`} />
                    <YAxis stroke="var(--color-on-surface-variant)" fontSize={10} tickFormatter={(v) => `${v}kNm`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-surface-container-high)', border: 'none', borderRadius: '16px', color: 'var(--color-on-surface)' }}
                      itemStyle={{ color: 'var(--color-tertiary)' }}
                    />
                    <ReferenceLine y={0} stroke="var(--color-on-surface-variant)" strokeWidth={2} opacity={0.5} />
                    <Area type="monotone" dataKey="M" stroke="var(--color-tertiary)" fill="url(#colorM)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Deflection Curve Diagram */}
            <div className="bg-surface-container-low p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem]">
              <h3 className="text-xl md:headline-md text-on-surface mb-6 md:mb-10">Deflection Curve (y)</h3>
              <div className="h-[250px] md:h-[300px] w-full bg-surface-container-lowest rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 ambient-shadow">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysis.data}>
                    <defs>
                      <linearGradient id="colorD" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline)" opacity={0.1} />
                    <XAxis dataKey="x" stroke="var(--color-on-surface-variant)" fontSize={10} tickFormatter={(v) => `${v}m`} />
                    <YAxis stroke="var(--color-on-surface-variant)" fontSize={10} tickFormatter={(v) => `${v}mm`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-surface-container-high)', border: 'none', borderRadius: '16px', color: 'var(--color-on-surface)' }}
                      itemStyle={{ color: 'var(--color-secondary)' }}
                    />
                    <ReferenceLine y={0} stroke="var(--color-on-surface-variant)" strokeWidth={2} opacity={0.5} />
                    <Area type="monotone" dataKey="D" stroke="var(--color-secondary)" fill="url(#colorD)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Mathematical Formulation Panel */}
        <div className="bg-surface-container-low p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] mt-6 lg:mt-12 ambient-shadow">
          <h3 className="text-xl md:headline-sm text-on-surface mb-6 md:mb-10 flex items-center gap-3">
            <Calculator className="w-6 h-6 text-primary" />
            Detailed Mathematical Derivation
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            <div className="space-y-6">
              <div className="bg-surface-container-highest/50 p-6 rounded-2xl border border-outline/5 h-full">
                <h4 className="label-lg text-primary mb-4">1. Reaction Forces Equations of Equilibrium</h4>
                {beamType === 'simply_supported' ? (
                  <>
                    <p className="body-sm text-on-surface-variant mb-2">Taking moments about support A to find the normal reaction at B (<InlineMath math="R_b" />):</p>
                    <div className="overflow-x-auto text-on-surface pb-2 text-sm">
                      <BlockMath math={`\\Sigma M_A = 0 \\implies R_b \\cdot (${analysis.span.toFixed(1)}) - \\sum (P_i \\cdot (x_i - A)) = 0`} />
                      <BlockMath math={`R_b = \\frac{\\sum P_i (x_i - A)}{B - A} = \\frac{${analysis.sumPx_A.toFixed(2)}}{${analysis.span.toFixed(2)}} = ${analysis.Rb.toFixed(2)} \\text{ kN}`} />
                    </div>
                    <hr className="my-4 border-outline/10" />
                    <p className="body-sm text-on-surface-variant mb-2">Resolving forces vertically to find reaction at A (<InlineMath math="R_a" />):</p>
                    <div className="overflow-x-auto text-on-surface pb-2 text-sm">
                      <BlockMath math={`\\Sigma F_y = 0 \\implies R_a + R_b - \\sum P_i = 0`} />
                      <BlockMath math={`R_a = \\sum P_i - R_b = ${analysis.sumP.toFixed(2)} - ${analysis.Rb.toFixed(2)} = ${analysis.Ra.toFixed(2)} \\text{ kN}`} />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="body-sm text-on-surface-variant mb-2">Analyzing the fixed support <InlineMath math="A" /> (x=0) retaining structural rotations (<InlineMath math="M_a" />):</p>
                    <div className="overflow-x-auto text-on-surface pb-2 text-sm">
                      <BlockMath math={`\\Sigma M_{support} = 0 \\implies M_a - \\sum (P_i \\cdot x_i) = 0`} />
                      <BlockMath math={`M_a = \\sum (P_i \\cdot x_i) = ${analysis.Ma.toFixed(2)} \\text{ kNm}`} />
                    </div>
                    <hr className="my-4 border-outline/10" />
                    <p className="body-sm text-on-surface-variant mb-2">Resolving forces vertically to find vertical reaction at fixed origin (<InlineMath math="R_a" />):</p>
                    <div className="overflow-x-auto text-on-surface pb-2 text-sm">
                      <BlockMath math={`\\Sigma F_y = 0 \\implies R_a - \\sum P_i = 0`} />
                      <BlockMath math={`R_a = \\sum P_i = ${analysis.Ra.toFixed(2)} \\text{ kN}`} />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-surface-container-highest/50 p-6 rounded-2xl border border-outline/5 h-full">
                <h4 className="label-lg text-primary mb-4">2. Bending Moment & Deflection Method</h4>
                <p className="body-sm text-on-surface-variant mb-2">The elastic curve <InlineMath math={"y(x)"} /> is resolved utilizing exact double-integration of the contiguous internal Bending Moment arrays guaranteeing universal robustness mapped across complex loading fields:</p>
                <div className="overflow-x-auto text-on-surface pb-2 text-sm">
                  <BlockMath math={`\\theta(x) = \\int \\frac{M(x)}{EI} dx + C_1`} />
                  <BlockMath math={`y(x) = \\int \\theta(x) dx + C_2`} />
                </div>
                <p className="body-sm text-on-surface-variant mt-3 mb-2">Where geometric boundaries {beamType === 'simply_supported' ? <><InlineMath math={"y(A) = 0"} /> and <InlineMath math={"y(B) = 0"} /></> : <><InlineMath math={"y(0) = 0"} /> and <InlineMath math={"y'(0) = 0"} /></>} extract integration constants dynamically isolating pure local displacement geometries independently:</p>
                <div className="overflow-x-auto text-on-surface pb-2 text-sm">
                  {beamType === 'simply_supported' ? (
                    <>
                      <BlockMath math={`C_1 = \\frac{y_{unadj}(B) - y_{unadj}(A)}{B - A} = ${analysis.C1.toExponential(2)}`} />
                      <BlockMath math={`C_2 = -y_{unadj}(A) - C_1(A) = ${analysis.C2.toExponential(2)}`} />
                    </>
                  ) : (
                    <>
                      <BlockMath math={`C_1 = 0 \\quad \\text{(Fixed Slope)}`} />
                      <BlockMath math={`C_2 = 0 \\quad \\text{(Fixed Displacement)}`} />
                    </>
                  )}
                </div>
                <hr className="my-4 border-outline/10" />
                <p className="body-sm text-on-surface-variant mb-2">With <InlineMath math={`EI = ${analysis.EI.toFixed(2)} \\text{ kN \\cdot m}^2`} /> yielding Absolute Operational Maxima limits within the boundary:</p>
                <div className="flex gap-4 items-center">
                  <div className="p-4 bg-tertiary/10 rounded-xl flex-1 text-center">
                    <p className="label-sm text-tertiary mb-1">Max Moment (M)</p>
                    <p className="text-xl font-bold text-tertiary">{analysis.maxMoment.toFixed(2)} <span className="text-xs opacity-50">kNm</span></p>
                  </div>
                  <div className="p-4 bg-secondary/10 rounded-xl flex-1 text-center">
                    <p className="label-sm text-secondary mb-1">Max Deflection (y)</p>
                    <p className="text-xl font-bold text-secondary">{Math.abs(analysis.maxDeflection).toFixed(3)} <span className="text-xs opacity-50">mm</span></p>
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

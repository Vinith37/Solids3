import React, { useState, useMemo } from 'react';
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
  Area
} from 'recharts';
import MainLayout from '../layouts/MainLayout';

interface PointLoad {
  id: string;
  position: number;
  magnitude: number;
}

export default function Beams() {
  const navigate = useNavigate();
  const [length, setLength] = useState<number>(10);
  const [modulus, setModulus] = useState<number>(200); // GPa
  const [inertia, setInertia] = useState<number>(500); // cm^4
  const [loads, setLoads] = useState<PointLoad[]>([
    { id: '1', position: 5, magnitude: 10 }
  ]);

  const addLoad = () => {
    setLoads([...loads, { id: Math.random().toString(36).substr(2, 9), position: length / 2, magnitude: 5 }]);
  };

  const removeLoad = (id: string) => {
    setLoads(loads.filter(l => l.id !== id));
  };

  const updateLoad = (id: string, field: keyof PointLoad, value: number) => {
    setLoads(loads.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const analysis = useMemo(() => {
    // Reactions for Simply Supported Beam
    const sumPx = loads.reduce((acc, l) => acc + l.magnitude * l.position, 0);
    const sumP = loads.reduce((acc, l) => acc + l.magnitude, 0);
    
    const Rb = sumPx / length;
    const Ra = sumP - Rb;

    // Generate points for diagrams
    const points = 101;
    const step = length / (points - 1);
    const data = [];

    for (let i = 0; i < points; i++) {
      const x = i * step;
      
      // Shear Force V(x)
      let V = Ra;
      for (const l of loads) {
        if (x >= l.position) V -= l.magnitude;
      }

      // Bending Moment M(x)
      let M = Ra * x;
      for (const l of loads) {
        if (x >= l.position) M -= l.magnitude * (x - l.position);
      }
      
      data.push({
        x: Number(x.toFixed(2)),
        V: Number(V.toFixed(2)),
        M: Number(M.toFixed(2))
      });
    }

    return { Ra, Rb, data };
  }, [length, loads]);

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
                  Point Loads
                </h3>
                <button 
                  onClick={addLoad}
                  className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {loads.map((load, idx) => (
                  <div key={load.id} className="p-4 md:p-6 bg-surface-container-high rounded-2xl relative group">
                    <button 
                      onClick={() => removeLoad(load.id)}
                      className="absolute -top-2 -right-2 p-2 bg-error/10 text-error rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="block label-sm text-on-surface-variant mb-2">Position (m)</label>
                        <input 
                          type="number" 
                          value={load.position} 
                          onChange={(e) => updateLoad(load.id, 'position', Number(e.target.value))}
                          className="w-full px-4 py-2 bg-surface-container-highest rounded-xl outline-none text-on-surface font-mono" 
                        />
                      </div>
                      <div>
                        <label className="block label-sm text-on-surface-variant mb-2">Load (kN)</label>
                        <input 
                          type="number" 
                          value={load.magnitude} 
                          onChange={(e) => updateLoad(load.id, 'magnitude', Number(e.target.value))}
                          className="w-full px-4 py-2 bg-surface-container-highest rounded-xl outline-none text-on-surface font-mono" 
                        />
                      </div>
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
                    <Area type="monotone" dataKey="M" stroke="var(--color-tertiary)" fill="url(#colorM)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

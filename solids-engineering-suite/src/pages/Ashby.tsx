import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Info, 
  Save, 
  Share2,
  Database
} from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import MainLayout from '../layouts/MainLayout';

interface Material {
  name: string;
  category: string;
  density: number; // kg/m^3
  modulus: number; // GPa
  strength: number; // MPa
  cost: number; // $/kg
}

const materialData: Material[] = [
  { name: 'Steel (AISI 1020)', category: 'Metals', density: 7850, modulus: 200, strength: 350, cost: 0.8 },
  { name: 'Aluminum (6061-T6)', category: 'Metals', density: 2700, modulus: 70, strength: 270, cost: 2.5 },
  { name: 'Titanium (Ti-6Al-4V)', category: 'Metals', density: 4430, modulus: 114, strength: 880, cost: 30 },
  { name: 'CFRP (High Modulus)', category: 'Composites', density: 1600, modulus: 200, strength: 1200, cost: 80 },
  { name: 'GFRP (E-glass)', category: 'Composites', density: 2000, modulus: 45, strength: 1000, cost: 15 },
  { name: 'Polycarbonate', category: 'Polymers', density: 1200, modulus: 2.4, strength: 70, cost: 4 },
  { name: 'ABS', category: 'Polymers', density: 1050, modulus: 2.3, strength: 40, cost: 2 },
  { name: 'Oak Wood', category: 'Natural', density: 750, modulus: 12, strength: 50, cost: 1.5 },
  { name: 'Balsa Wood', category: 'Natural', density: 150, modulus: 3, strength: 10, cost: 10 },
  { name: 'Silicon Carbide', category: 'Ceramics', density: 3100, modulus: 450, strength: 600, cost: 50 },
  { name: 'Alumina', category: 'Ceramics', density: 3900, modulus: 380, strength: 300, cost: 20 },
];

export default function Ashby() {
  const navigate = useNavigate();
  const [xAxis, setXAxis] = useState<keyof Material>('density');
  const [yAxis, setYAxis] = useState<keyof Material>('modulus');
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    return materialData.filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
    ).map(m => ({
      ...m,
      x: m[xAxis],
      y: m[yAxis]
    }));
  }, [search, xAxis, yAxis]);

  const categories = Array.from(new Set(materialData.map(m => m.category)));
  const colors: Record<string, string> = {
    'Metals': 'var(--color-primary)',
    'Composites': 'var(--color-secondary)',
    'Polymers': 'var(--color-tertiary)',
    'Natural': 'var(--color-on-surface-variant)',
    'Ceramics': 'var(--color-error)'
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
            <h1 className="display-lg text-on-surface mb-4">Ashby Material Chart</h1>
            <p className="body-md text-on-surface-variant">Select optimal materials based on performance indices and property trade-offs using log-log visualization.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="w-full sm:w-auto px-6 py-3 bg-surface-container-high text-on-surface font-bold rounded-full hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              Save Selection
            </button>
            <button className="w-full sm:w-auto px-6 py-3 primary-gradient text-on-primary rounded-full font-bold hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg">
              <Share2 className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Controls Panel */}
          <div className="lg:col-span-3 space-y-6 lg:space-y-8">
            <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
              <h3 className="label-sm text-primary mb-6 md:mb-8 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Chart Controls
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block label-sm text-on-surface-variant mb-3">X-Axis Property</label>
                  <select 
                    value={xAxis}
                    onChange={(e) => setXAxis(e.target.value as keyof Material)}
                    className="w-full px-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-sans text-on-surface focus:ring-2 ring-primary/20 transition-all appearance-none"
                  >
                    <option value="density">Density (kg/m³)</option>
                    <option value="modulus">Young's Modulus (GPa)</option>
                    <option value="strength">Yield Strength (MPa)</option>
                    <option value="cost">Cost ($/kg)</option>
                  </select>
                </div>
                <div>
                  <label className="block label-sm text-on-surface-variant mb-3">Y-Axis Property</label>
                  <select 
                    value={yAxis}
                    onChange={(e) => setYAxis(e.target.value as keyof Material)}
                    className="w-full px-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-sans text-on-surface focus:ring-2 ring-primary/20 transition-all appearance-none"
                  >
                    <option value="modulus">Young's Modulus (GPa)</option>
                    <option value="density">Density (kg/m³)</option>
                    <option value="strength">Yield Strength (MPa)</option>
                    <option value="cost">Cost ($/kg)</option>
                  </select>
                </div>
                <div className="pt-4">
                  <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search materials..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-sans text-on-surface focus:ring-2 ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
              <h3 className="label-sm text-on-surface-variant mb-6 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Categories
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                {categories.map(cat => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colors[cat] }}></span>
                    <span className="label-sm text-on-surface truncate">{cat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart Panel */}
          <div className="lg:col-span-9 space-y-8">
            <div className="bg-surface-container-low p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] min-h-[400px] md:min-h-[700px] flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-engineering-dots opacity-5 pointer-events-none" />
              
              <div className="flex-1 relative z-10 bg-surface-container-lowest rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 ambient-shadow">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline)" opacity={0.1} />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name={xAxis} 
                      scale="log" 
                      domain={['auto', 'auto']}
                      stroke="var(--color-on-surface-variant)"
                      fontSize={10}
                      label={{ value: xAxis.toUpperCase(), position: 'bottom', offset: 0, fontSize: 10, fontWeight: '700', fill: 'var(--color-on-surface-variant)', className: 'label-sm' }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name={yAxis} 
                      scale="log" 
                      domain={['auto', 'auto']}
                      stroke="var(--color-on-surface-variant)"
                      fontSize={10}
                      label={{ value: yAxis.toUpperCase(), angle: -90, position: 'left', offset: 0, fontSize: 10, fontWeight: '700', fill: 'var(--color-on-surface-variant)', className: 'label-sm' }}
                    />
                    <ZAxis type="number" range={[100, 1000]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3', stroke: 'var(--color-primary)', strokeWidth: 2 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as Material;
                          return (
                            <div className="bg-surface-container-high p-4 md:p-6 rounded-2xl border-none shadow-2xl text-on-surface min-w-[180px] md:min-w-[200px]">
                              <p className="text-lg md:headline-md mb-4">{data.name}</p>
                              <div className="space-y-2 label-sm text-on-surface-variant">
                                <p className="flex justify-between gap-4"><span>Density:</span> <span className="text-on-surface font-mono">{data.density} kg/m³</span></p>
                                <p className="flex justify-between gap-4"><span>Modulus:</span> <span className="text-on-surface font-mono">{data.modulus} GPa</span></p>
                                <p className="flex justify-between gap-4"><span>Strength:</span> <span className="text-on-surface font-mono">{data.strength} MPa</span></p>
                                <p className="flex justify-between gap-4"><span>Cost:</span> <span className="text-on-surface font-mono">${data.cost}/kg</span></p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Materials" data={filteredData}>
                      {filteredData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[entry.category]} fillOpacity={0.4} stroke={colors[entry.category]} strokeWidth={3} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 md:mt-10 pt-6 md:pt-10 border-t border-outline/10 relative z-10">
                <div className="flex gap-4">
                  <div className="p-2 bg-primary/10 rounded-xl h-fit">
                    <Info className="w-5 h-5 text-primary shrink-0" />
                  </div>
                  <p className="body-sm md:body-md text-on-surface-variant leading-relaxed">
                    Ashby charts use log-log scales to visualize material property space. Performance indices (e.g., E/ρ) appear as lines of constant slope on these charts, allowing for rapid material selection based on structural efficiency.
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

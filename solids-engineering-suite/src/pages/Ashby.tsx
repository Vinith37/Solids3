import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  Wind, 
  Info, 
  Save, 
  Share2,
  Maximize2,
  Filter
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
  Label,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { materialsService } from '../services/api';
import { useCalculation } from '../hooks/useCalculation';
import type { Material } from '../types/api';


const axisOptions = [
  { label: 'Modulus (GPa)', value: 'modulus' },
  { label: 'Strength (MPa)', value: 'strength' },
  { label: 'Density (kg/m³)', value: 'density' },
  { label: 'Cost ($/kg)', value: 'cost' },
  { label: 'CTE (10⁻⁶/K)', value: 'thermalExpansion' }
];

export default function Ashby() {
  const navigate = useNavigate();
  const [xAxis, setXAxis] = useState('modulus');
  const [yAxis, setYAxis] = useState('strength');
  const [search, setSearch] = useState('');
  const [materialData, setMaterialData] = useState<Material[]>([]);

  useEffect(() => {
    materialsService.list()
      .then(data => setMaterialData(data))
      .catch(err => console.error('[Ashby] Failed to load materials:', err));
  }, []);

  const getState = useCallback(
    () => ({ xAxis, yAxis, search }),
    [xAxis, yAxis, search],
  );

  const { saveState } = useCalculation({
    type: 'Ashby Chart',
    module: '/ashby',
    getState,
    onLoad: (state) => {
      if (state.xAxis) setXAxis(state.xAxis as string);
      if (state.yAxis) setYAxis(state.yAxis as string);
      if (state.search !== undefined) setSearch(state.search as string);
    },
  });

  const filteredData = useMemo(() => {
    return materialData.filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [materialData, search]);

  const chartData = useMemo(() => {
    return filteredData.map(m => ({
      ...m,
      x: m[xAxis as keyof Material],
      y: m[yAxis as keyof Material],
    }));
  }, [filteredData, xAxis, yAxis]);

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Metals': return 'var(--color-primary)';
      case 'Polymers': return 'var(--color-secondary)';
      case 'Composites': return 'var(--color-tertiary)';
      case 'Ceramics': return 'var(--color-error)';
      case 'Natural': return 'var(--color-success)';
      default: return 'var(--color-on-surface-variant)';
    }
  };

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
            <h1 className="display-lg text-on-surface mb-4">Ashby Material Chart</h1>
            <p className="body-md text-on-surface-variant">Multi-objective material selection using standard performance indices and property trade-off visualization.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={saveState}
              className="w-full sm:w-auto px-6 py-3 bg-surface-container-high text-on-surface font-bold rounded-full hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save View
            </button>
            <button className="w-full sm:w-auto px-6 py-3 primary-gradient text-on-primary rounded-full font-bold hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg">
              <Share2 className="w-4 h-4" />
              Export Chart
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-3 space-y-6 lg:space-y-8">
            <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] ambient-shadow">
              <h3 className="label-sm text-primary mb-6 md:mb-8 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Axis Selection
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="label-sm text-on-surface-variant block mb-3 text-[10px] tracking-widest uppercase font-bold">X-Axis Property</label>
                  <select 
                    value={xAxis}
                    onChange={(e) => setXAxis(e.target.value)}
                    className="w-full px-5 py-3 bg-surface-container-highest rounded-2xl outline-none font-sans text-on-surface focus:ring-2 ring-primary/20 transition-all appearance-none"
                  >
                    {axisOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-sm text-on-surface-variant block mb-3 text-[10px] tracking-widest uppercase font-bold">Y-Axis Property</label>
                  <select 
                    value={yAxis}
                    onChange={(e) => setYAxis(e.target.value)}
                    className="w-full px-5 py-3 bg-surface-container-highest rounded-2xl outline-none font-sans text-on-surface focus:ring-2 ring-primary/20 transition-all appearance-none"
                  >
                    {axisOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search materials..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-highest rounded-2xl outline-none font-sans text-sm text-on-surface focus:ring-2 ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] ambient-shadow">
               <h3 className="label-sm text-on-surface-variant mb-6 uppercase tracking-widest">Legend</h3>
               <div className="space-y-4">
                 {[
                   { name: 'Metals', color: 'bg-primary' },
                   { name: 'Polymers', color: 'bg-secondary' },
                   { name: 'Composites', color: 'bg-tertiary' },
                   { name: 'Ceramics', color: 'bg-error' },
                   { name: 'Natural', color: 'bg-success' }
                 ].map(cat => (
                   <div key={cat.name} className="flex items-center gap-3">
                     <span className={`w-3 h-3 rounded-full ${cat.color}`} />
                     <span className="label-sm text-on-surface">{cat.name}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="lg:col-span-9">
            <div className="bg-surface-container-low p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] ambient-shadow h-[500px] md:h-[650px] flex flex-col">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <Maximize2 className="w-5 h-5 text-primary" />
                  <h3 className="text-xl md:headline-sm text-on-surface">Property Map</h3>
                </div>
              </div>

              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline)" opacity={0.1} />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name={xAxis} 
                      stroke="black" 
                      strokeWidth={2}
                      scale="log" 
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 12, fontWeight: 700 }}
                    >
                      <Label value={axisOptions.find(o=>o.value===xAxis)?.label} position="bottom" offset={20} className="label-sm font-bold fill-on-surface" />
                    </XAxis>
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name={yAxis} 
                      stroke="black" 
                      strokeWidth={2}
                      scale="log" 
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 12, fontWeight: 700 }}
                    >
                      <Label value={axisOptions.find(o=>o.value===yAxis)?.label} angle={-90} position="left" offset={0} className="label-sm font-bold fill-on-surface" />
                    </YAxis>
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      contentStyle={{ backgroundColor: 'var(--color-surface-container-highest)', border: 'none', borderRadius: '16px', color: 'var(--color-on-surface)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-surface-container-highest p-4 rounded-2xl shadow-xl border border-outline/10">
                              <p className="font-bold text-primary mb-2">{data.name}</p>
                              <p className="text-xs text-on-surface-variant mb-1">Category: {data.category}</p>
                              <p className="text-xs text-on-surface-variant">{xAxis}: {data.x}</p>
                              <p className="text-xs text-on-surface-variant">{yAxis}: {data.y}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter data={chartData}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

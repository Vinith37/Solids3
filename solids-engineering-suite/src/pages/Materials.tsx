import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  Database, 
  Info, 
  Save, 
  Share2,
  Table as TableIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

interface Material {
  name: string;
  category: string;
  density: number; // kg/m^3
  modulus: number; // GPa
  strength: number; // MPa
  poisson: number;
  thermalExpansion: number; // 10^-6/K
  cost: number; // $/kg
}

const materialData: Material[] = [
  { name: 'Steel (AISI 1020)', category: 'Metals', density: 7850, modulus: 200, strength: 350, poisson: 0.29, thermalExpansion: 11.7, cost: 0.8 },
  { name: 'Steel (AISI 4140)', category: 'Metals', density: 7850, modulus: 205, strength: 655, poisson: 0.29, thermalExpansion: 12.3, cost: 1.2 },
  { name: 'Aluminum (6061-T6)', category: 'Metals', density: 2700, modulus: 70, strength: 270, poisson: 0.33, thermalExpansion: 23.6, cost: 2.5 },
  { name: 'Aluminum (7075-T6)', category: 'Metals', density: 2810, modulus: 71, strength: 503, poisson: 0.33, thermalExpansion: 23.2, cost: 4.5 },
  { name: 'Titanium (Ti-6Al-4V)', category: 'Metals', density: 4430, modulus: 114, strength: 880, poisson: 0.34, thermalExpansion: 8.6, cost: 30 },
  { name: 'Copper (C11000)', category: 'Metals', density: 8960, modulus: 115, strength: 220, poisson: 0.34, thermalExpansion: 16.9, cost: 8 },
  { name: 'CFRP (High Modulus)', category: 'Composites', density: 1600, modulus: 200, strength: 1200, poisson: 0.3, thermalExpansion: -0.5, cost: 80 },
  { name: 'GFRP (E-glass)', category: 'Composites', density: 2000, modulus: 45, strength: 1000, poisson: 0.25, thermalExpansion: 6, cost: 15 },
  { name: 'Polycarbonate', category: 'Polymers', density: 1200, modulus: 2.4, strength: 70, poisson: 0.37, thermalExpansion: 65, cost: 4 },
  { name: 'ABS', category: 'Polymers', density: 1050, modulus: 2.3, strength: 40, poisson: 0.35, thermalExpansion: 90, cost: 2 },
  { name: 'Silicon Carbide', category: 'Ceramics', density: 3100, modulus: 450, strength: 600, poisson: 0.14, thermalExpansion: 4, cost: 50 },
  { name: 'Alumina', category: 'Ceramics', density: 3900, modulus: 380, strength: 300, poisson: 0.22, thermalExpansion: 8.1, cost: 20 },
];

export default function Materials() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filteredData = useMemo(() => {
    return materialData.filter(m => 
      (category === 'All' || m.category === category) &&
      (m.name.toLowerCase().includes(search.toLowerCase()) ||
       m.category.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, category]);

  const categories = ['All', ...Array.from(new Set(materialData.map(m => m.category)))];

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
            <h1 className="display-lg text-on-surface mb-4">Material Properties</h1>
            <p className="body-md text-on-surface-variant">Comprehensive database of engineering materials and their mechanical properties for precise structural analysis.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="w-full sm:w-auto px-6 py-3 bg-surface-container-high text-on-surface font-bold rounded-full hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              Save Selection
            </button>
            <button className="w-full sm:w-auto px-6 py-3 primary-gradient text-on-primary rounded-full font-bold hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg">
              <Share2 className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden ambient-shadow">
          <div className="p-6 md:p-10 border-b border-outline/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:gap-6 flex-1">
              <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search materials..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-sans text-on-surface focus:ring-2 ring-primary/20 transition-all"
                />
              </div>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-6 py-4 bg-surface-container-highest rounded-2xl outline-none font-sans text-on-surface focus:ring-2 ring-primary/20 transition-all appearance-none min-w-[160px]"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant label-sm">
              <Database className="w-5 h-5 text-primary" />
              {filteredData.length} Materials Found
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-surface-container-highest/30">
                  <th className="px-6 md:px-8 py-4 md:py-6 label-sm text-on-surface-variant border-b border-outline/10">Material Name</th>
                  <th className="px-6 md:px-8 py-4 md:py-6 label-sm text-on-surface-variant border-b border-outline/10">Category</th>
                  <th className="px-6 md:px-8 py-4 md:py-6 label-sm text-on-surface-variant border-b border-outline/10 text-right">Density (kg/m³)</th>
                  <th className="px-6 md:px-8 py-4 md:py-6 label-sm text-on-surface-variant border-b border-outline/10 text-right">Modulus (GPa)</th>
                  <th className="px-6 md:px-8 py-4 md:py-6 label-sm text-on-surface-variant border-b border-outline/10 text-right">Strength (MPa)</th>
                  <th className="px-6 md:px-8 py-4 md:py-6 label-sm text-on-surface-variant border-b border-outline/10 text-right">Poisson's Ratio</th>
                  <th className="px-6 md:px-8 py-4 md:py-6 label-sm text-on-surface-variant border-b border-outline/10 text-right">CTE (10⁻⁶/K)</th>
                  <th className="px-6 md:px-8 py-4 md:py-6 label-sm text-on-surface-variant border-b border-outline/10 text-right">Cost ($/kg)</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((m, idx) => (
                  <tr key={m.name} className="hover:bg-surface-container-highest/20 transition-colors group">
                    <td className="px-6 md:px-8 py-4 md:py-6 body-sm md:body-md font-bold text-on-surface border-b border-outline/5">{m.name}</td>
                    <td className="px-6 md:px-8 py-4 md:py-6 border-b border-outline/5">
                      <span className="px-3 py-1 bg-surface-container-highest text-on-surface rounded-lg label-sm">
                        {m.category}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-4 md:py-6 body-sm md:body-md font-mono text-on-surface-variant border-b border-outline/5 text-right">{m.density}</td>
                    <td className="px-6 md:px-8 py-4 md:py-6 body-sm md:body-md font-mono text-on-surface-variant border-b border-outline/5 text-right">{m.modulus}</td>
                    <td className="px-6 md:px-8 py-4 md:py-6 body-sm md:body-md font-mono text-on-surface-variant border-b border-outline/5 text-right">{m.strength}</td>
                    <td className="px-6 md:px-8 py-4 md:py-6 body-sm md:body-md font-mono text-on-surface-variant border-b border-outline/5 text-right">{m.poisson}</td>
                    <td className="px-6 md:px-8 py-4 md:py-6 body-sm md:body-md font-mono text-on-surface-variant border-b border-outline/5 text-right">{m.thermalExpansion}</td>
                    <td className="px-6 md:px-8 py-4 md:py-6 body-sm md:body-md font-mono text-on-surface-variant border-b border-outline/5 text-right">{m.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] ambient-shadow">
          <div className="flex gap-4">
            <div className="p-2 bg-primary/10 rounded-xl h-fit">
              <Info className="w-5 h-5 text-primary shrink-0" />
            </div>
            <p className="body-sm md:body-md text-on-surface-variant leading-relaxed">
              Properties listed are typical values for standard engineering grades. For critical applications, always refer to the specific material manufacturer's data sheet.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

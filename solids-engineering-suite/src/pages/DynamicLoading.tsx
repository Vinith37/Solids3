import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Calculator, 
  Info, 
  Save, 
  Share2,
  Zap,
  Waves
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { dynamicService } from '../services/api';
import { useCalculation } from '../hooks/useCalculation';
import { useAnalysis } from '../hooks/useAnalysis';
import type { DynamicInput, DynamicResult } from '../types/api';
import UnitInput from '../components/UnitInput';
import UnitDisplay from '../components/UnitDisplay';

export default function DynamicLoading() {
  const navigate = useNavigate();
  const [mass, setMass] = useState<number>(10); // kg
  const [height, setHeight] = useState<number>(0.5); // m
  const [stiffness, setStiffness] = useState<number>(10000); // N/m

  // --- Hooks ---
  const analysisInput: DynamicInput = { mass, height, stiffness };

  const { result: rawResults } = useAnalysis<DynamicInput, DynamicResult>(
    dynamicService.analyze,
    analysisInput,
  );

  const getState = useCallback(
    () => ({ mass, height, stiffness }),
    [mass, height, stiffness],
  );

  const { saveState } = useCalculation({
    type: 'Dynamic Loading',
    module: '/dynamic',
    getState,
    onLoad: (state) => {
      if (state.mass !== undefined) setMass(state.mass as number);
      if (state.height !== undefined) setHeight(state.height as number);
      if (state.stiffness !== undefined) setStiffness(state.stiffness as number);
    },
  });

  const results: DynamicResult = rawResults ?? { deltaSt: 0, impactFactor: 2, dynamicForce: 0, fn: 0 };

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
            <h1 className="display-lg text-on-surface mb-4">Dynamic Loading</h1>
            <p className="body-md text-on-surface-variant">Analyze impact stresses and natural vibration frequencies for dynamic structural integrity.</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-1 space-y-6 lg:space-y-8">
            <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] ambient-shadow">
              <h3 className="label-sm text-primary mb-6 md:mb-8 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Impact Parameters
              </h3>
              
              <div className="space-y-5">
                <UnitInput
                  label="Falling Mass"
                  value={mass}
                  onChange={setMass}
                  unitType="mass"
                />
                <UnitInput
                  label="Drop Height"
                  value={height}
                  onChange={setHeight}
                  unitType="length"
                />
                <UnitInput
                  label="System Stiffness"
                  value={stiffness}
                  onChange={setStiffness}
                  unitType="stiffness"
                />
              </div>
            </div>

            <div className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] ambient-shadow">
              <div className="flex gap-4">
                <div className="p-2 bg-primary/10 rounded-xl h-fit">
                  <Info className="w-5 h-5 text-primary shrink-0" />
                </div>
                <p className="body-sm text-on-surface-variant leading-relaxed">
                  The <strong className="text-on-surface">Impact Factor</strong> represents the ratio of dynamic stress to static stress. For a sudden load (h=0), the factor is 2.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface-container-low p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] ambient-shadow min-h-[400px] md:min-h-[500px] flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-engineering-pattern opacity-10 pointer-events-none" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative z-10">
                <div className="space-y-8 md:space-y-12">
                  <div>
                    <p className="label-sm text-on-surface-variant mb-4">Impact Factor</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl md:text-6xl font-black text-on-surface">{results.impactFactor.toFixed(2)}</span>
                      <span className="text-xl md:text-2xl font-bold text-on-surface-variant italic">x</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="label-sm text-on-surface-variant mb-4">Natural Frequency (fₙ)</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl md:text-6xl font-black text-primary">{results.fn.toFixed(2)}</span>
                      <span className="text-xl md:text-2xl font-bold text-on-surface-variant italic">Hz</span>
                    </div>
                  </div>

                  <div className="pt-6 md:pt-8 border-t border-outline/10">
                    <p className="label-sm text-on-surface-variant mb-2">Max Dynamic Force</p>
                    <UnitDisplay value={results.dynamicForce / 1000} unitType="force" precision={1} valueClassName="text-xl md:headline-md text-on-surface" />
                  </div>

                  <div className="pt-4 border-t border-outline/10">
                    <p className="label-sm text-on-surface-variant mb-2">Static Deflection</p>
                    <UnitDisplay value={results.deltaSt} unitType="deflection" precision={2} valueClassName="text-xl md:headline-md text-on-surface" />
                  </div>
                </div>

                <div className="flex items-center justify-center py-8 md:py-0">
                  <div className="relative w-40 h-40 md:w-64 md:h-64 bg-surface-container-highest rounded-full flex items-center justify-center ambient-shadow overflow-hidden group">
                    <div className="absolute inset-0 opacity-20 bg-engineering-pattern" />
                    <motion.div 
                      key={results.fn}
                      animate={{ 
                        y: [0, -20, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: results.fn > 0 ? Math.max(0.05, 1 / results.fn) : 1, 
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="relative z-10"
                    >
                      <Waves className="w-12 h-12 md:w-24 md:h-24 text-primary" />
                    </motion.div>
                    <div className="absolute bottom-6 md:bottom-8 text-[10px] md:label-sm text-on-surface-variant italic">Vibration Mode</div>
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

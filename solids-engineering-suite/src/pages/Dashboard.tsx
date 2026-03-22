import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Layers, 
  Circle, 
  Wind, 
  Zap, 
  ArrowRight, 
  History, 
  Star,
  ShieldCheck,
  Cpu,
  Box,
  PieChart,
  Database
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';

const modules = [
  { 
    title: 'Failure Theories', 
    description: 'Analyze static loading using Von Mises, Tresca, and Rankine theories.',
    icon: Activity,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    path: '/failure-theories'
  },
  { 
    title: 'Mohr Circle', 
    description: 'Visualize principal stresses and maximum shear stress in 2D/3D.',
    icon: Circle,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    path: '/mohr-circle'
  },
  { 
    title: 'Beams & Deflection', 
    description: 'Calculate shear force, bending moment, and deflection profiles.',
    icon: Layers,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    path: '/beams'
  },
  { 
    title: 'Ashby Material Chart', 
    description: 'Select optimal materials based on performance indices and cost.',
    icon: Wind,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    path: '/ashby'
  },
  { 
    title: 'Torsion Analysis', 
    description: 'Analyze circular and non-circular shafts under torsional loading.',
    icon: Zap,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    path: '/torsion'
  },
  { 
    title: 'Fatigue & S-N Curve', 
    description: 'Predict fatigue life using Goodman, Gerber, and Soderberg criteria.',
    icon: ShieldCheck,
    color: 'text-primary-dim',
    bg: 'bg-primary/10',
    path: '/fatigue'
  },
  { 
    title: 'Dynamic Loading', 
    description: 'Analyze impact stresses and natural vibration frequencies.',
    icon: PieChart,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    path: '/dynamic'
  },
  { 
    title: 'Material Properties', 
    description: 'Searchable database of mechanical and thermal properties.',
    icon: Database,
    color: 'text-cyan-500',
    bg: 'bg-cyan-50',
    path: '/materials'
  },
];

const recentCalculations = [
  { id: 1, name: 'Shaft Design - Project X', date: '2 hours ago', type: 'Torsion' },
  { id: 2, name: 'Support Beam Analysis', date: '5 hours ago', type: 'Beams' },
  { id: 3, name: 'Material Selection - Drone Frame', date: 'Yesterday', type: 'Ashby' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-12 pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] primary-gradient p-6 md:p-10 lg:p-16 text-on-primary ambient-shadow">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <div className="bg-engineering-grid w-full h-full" />
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-on-primary/10 text-on-primary text-[10px] font-bold tracking-[0.1em] uppercase mb-6 md:mb-8">
              <Cpu className="w-3 h-3" />
              SOLIDS Engineering Suite v2.4
            </div>
            <h1 className="display-lg mb-4 md:mb-6">
              Precision Engineering, <br />
              <span className="opacity-80">Simplified.</span>
            </h1>
            <p className="text-on-primary/70 text-base md:text-lg mb-8 md:mb-10 leading-relaxed max-w-xl">
              Access advanced mechanical analysis modules, material databases, and failure prediction tools in one unified, editorial-grade dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="w-full sm:w-auto px-8 py-4 bg-on-primary text-primary font-bold rounded-full hover:scale-105 transition-all flex items-center justify-center gap-2 group">
                New Project
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-transparent border border-on-primary/20 text-on-primary font-bold rounded-full hover:bg-on-primary/10 transition-all">
                View Documentation
              </button>
            </div>
          </motion.div>
        </section>

        {/* Quick Stats / Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[
            { label: 'Safety Status', value: 'All Systems Nominal', icon: ShieldCheck, color: 'text-emerald-400' },
            { label: 'Active Projects', value: '12 Calculations', icon: Box, color: 'text-primary' },
            { label: 'Material DB', value: '450+ Alloys', icon: Star, color: 'text-amber-400' }
          ].map((stat) => (
            <div key={stat.label} className="bg-surface-container-low p-6 md:p-8 rounded-[1.5rem] flex items-center gap-6">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-surface-container-high flex items-center justify-center shrink-0">
                <stat.icon className={`w-6 h-6 md:w-7 md:h-7 ${stat.color}`} />
              </div>
              <div>
                <p className="label-sm text-on-surface-variant mb-1">{stat.label}</p>
                <p className="text-lg md:text-xl font-bold text-on-surface">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Modules Grid */}
        <section>
          <div className="flex items-center justify-between mb-6 md:mb-8 px-2">
            <h2 className="text-xl md:headline-md text-on-surface">Analysis Modules</h2>
            <button className="text-xs md:text-sm font-bold text-primary hover:underline underline-offset-4">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {modules.map((module, idx) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
                onClick={() => navigate(module.path)}
                className="bg-surface-container-high p-6 md:p-8 rounded-[2rem] transition-all cursor-pointer group hover:bg-surface-container-highest"
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-surface-container-highest flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <module.icon className={`w-6 h-6 md:w-7 md:h-7 text-primary`} />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-on-surface mb-3">{module.title}</h3>
                <p className="body-sm md:body-md text-on-surface-variant mb-8">
                  {module.description}
                </p>
                <div className="flex items-center label-sm text-on-surface-variant group-hover:text-primary transition-colors">
                  LAUNCH MODULE
                  <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Bottom Section: Recent & Favorites */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
          <div className="lg:col-span-2 bg-surface-container-low rounded-[2rem] overflow-hidden">
            <div className="p-6 md:p-8 border-b border-outline/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-on-surface-variant" />
                <h3 className="text-base md:text-lg font-bold text-on-surface">Recent Calculations</h3>
              </div>
              <button className="label-sm text-on-surface-variant hover:text-on-surface">Clear</button>
            </div>
            <div className="divide-y divide-outline/5">
              {recentCalculations.map((calc) => (
                <div key={calc.id} className="p-4 md:p-6 hover:bg-surface-container-high transition-colors flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4 md:gap-5">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                      <FileTextIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="text-sm md:text-base font-bold text-on-surface">{calc.name}</p>
                      <p className="text-[10px] md:text-xs text-on-surface-variant mt-1">{calc.type} • {calc.date}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-high rounded-[2rem] p-8 md:p-10 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap className="w-24 h-24 md:w-32 md:h-32 text-primary" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-on-surface mb-4">Pro Tip</h3>
              <p className="body-sm md:body-md text-on-surface-variant leading-relaxed">
                You can export any calculation to a professional PDF report with your company logo by clicking the "Export" button in the top navigation bar.
              </p>
            </div>
            <button className="mt-8 md:mt-10 w-full py-3 md:py-4 bg-surface-container-highest text-on-surface font-bold rounded-full hover:bg-outline/20 transition-all text-sm">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>
    </svg>
  );
}

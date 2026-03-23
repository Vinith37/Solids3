import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Compass, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      // Error is handled by context but we can log or perform additional cleanup
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-engineering-pattern opacity-20 pointer-events-none"></div>
      
      <header className="w-full relative z-10">
        <div className="flex justify-between items-center px-12 py-8 max-w-7xl mx-auto">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-primary font-headline italic uppercase">
            SOLIDS
          </Link>
          <div className="flex items-center gap-8">
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors label-sm">Support</a>
            <Link to="/signup" className="text-primary font-bold label-sm">Create Account</Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-surface-container-low rounded-[2.5rem] p-12 ambient-shadow">
            <div className="mb-12">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
                <Compass className="w-7 h-7 text-primary" />
              </div>
              <h1 className="display-md text-on-surface mb-3">Welcome Back</h1>
              <p className="body-md text-on-surface-variant">Enter your credentials to access the engineering suite.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                <p className="body-sm text-error">{error}</p>
              </div>
            )}

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <label className="label-sm text-on-surface-variant block ml-1" htmlFor="email">Work Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                  </div>
                  <input 
                    className="block w-full pl-14 pr-6 py-4 bg-surface-container-highest rounded-2xl outline-none text-on-surface focus:ring-2 ring-primary/20 transition-all placeholder:text-on-surface-variant/40" 
                    id="email" 
                    placeholder="engineer@company.com" 
                    type="email"
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="label-sm text-on-surface-variant block" htmlFor="password">Password</label>
                  <Link to="/forgot-password" title="Forgot Password" className="label-sm text-primary hover:text-primary-dim transition-colors">Forgot Password?</Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                  </div>
                  <input 
                    className="block w-full pl-14 pr-6 py-4 bg-surface-container-highest rounded-2xl outline-none text-on-surface focus:ring-2 ring-primary/20 transition-all placeholder:text-on-surface-variant/40" 
                    id="password" 
                    placeholder="••••••••" 
                    type="password"
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full primary-gradient text-on-primary font-bold py-4 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 shadow-xl shadow-primary/20 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          </div>

          <div className="mt-12 flex justify-between items-center px-6">
            <div className="flex flex-col">
              <span className="label-sm text-on-surface-variant/40 mb-1">System Status</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="body-sm text-on-surface-variant">All Engines Operational</span>
              </div>
            </div>
            <div className="text-right">
              <span className="label-sm text-on-surface-variant/40 mb-1 block">Build</span>
              <span className="body-sm text-on-surface-variant">v2.4.0-precision</span>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="w-full py-12 flex flex-col items-center justify-center gap-6 relative z-10">
        <div className="flex gap-12">
          <a className="label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Privacy</a>
          <a className="label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Terms</a>
          <a className="label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Support</a>
        </div>
        <p className="label-sm text-on-surface-variant/40 italic">© 2024 SOLIDS Engineering. Built for precision.</p>
      </footer>
    </div>
  );
}

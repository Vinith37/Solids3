import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ArrowRight, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { resetPassword, error, setError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMessage('');
      setError(null);
      setLoading(true);
      await resetPassword(email);
      setMessage('We have sent you an email with instructions to reset your password. Please check your inbox.');
    } catch (err: any) {
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
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors label-sm">Documentation</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors label-sm">API</a>
            <button className="text-primary font-bold label-sm">Support</button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="hidden lg:block lg:col-span-5 space-y-8">
            <div className="inline-flex items-center px-4 py-1.5 bg-primary/10 text-primary rounded-full label-sm">
              Security Protocol
            </div>
            <h2 className="display-md text-on-surface leading-tight">
              Recover your <span className="text-primary italic">workspace</span> access.
            </h2>
            <p className="body-md text-on-surface-variant leading-relaxed">
              Engineering Editorial Standards require secure authentication for all technical contributors. Ensure you use your primary work domain email.
            </p>
            <div className="pt-6 flex items-center gap-4 text-on-surface-variant/40">
              <Lock className="w-5 h-5" />
              <span className="label-sm italic">End-to-end encrypted reset</span>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-[480px] bg-surface-container-low rounded-[2.5rem] p-12 ambient-shadow">
              <div className="mb-10">
                <h1 className="headline-md text-on-surface mb-3">Reset your password</h1>
                <p className="body-md text-on-surface-variant">
                  Enter your work email and we will send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                  <p className="body-sm text-error">{error}</p>
                </div>
              )}

              {message && (
                <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="body-sm text-primary">{message}</p>
                </div>
              )}

              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <label className="label-sm text-on-surface-variant block ml-1">Work Email Address</label>
                  <input 
                    className="w-full bg-surface-container-highest rounded-2xl px-6 py-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 ring-primary/20 transition-all outline-none" 
                    placeholder="name@company.com" 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full primary-gradient text-on-primary font-bold py-4 px-8 rounded-full shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
              <div className="mt-12 pt-10 border-t border-outline/10 flex flex-col items-center gap-6">
                <Link to="/login" className="body-sm font-bold text-primary hover:text-primary-dim flex items-center gap-2 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                  Return to Login
                </Link>
                <p className="label-sm text-on-surface-variant/40 italic">
                  Need help? <a className="text-primary hover:underline" href="#">Contact Engineering Support</a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
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

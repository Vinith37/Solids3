import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, error, setError } = useAuth();
  const navigate = useNavigate();

  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccessMsg('');
      setLoading(true);
      await signup(email, password, name);

      // Show success state
      setSuccessMsg('Account created successfully! Redirecting...');

      // Give a slight delay so user can read the success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (err: any) {
      console.error(err);
      // The error is already set via AuthContext, but we can manage local loading state
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface relative flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-engineering-pattern opacity-20 pointer-events-none"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>

      <header className="w-full relative z-10">
        <nav className="flex justify-between items-center px-12 py-8 max-w-7xl mx-auto">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-primary font-headline italic uppercase">SOLIDS</Link>
          <div className="flex items-center gap-8">
            <Link to="/login" className="text-on-surface-variant hover:text-primary transition-colors label-sm">Login</Link>
            <Link to="/signup" className="text-primary font-bold label-sm">Sign Up</Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow relative z-10 flex items-center justify-center px-4 py-12">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-surface-container-low rounded-[2.5rem] p-12 ambient-shadow">
            <div className="mb-12">
              <h1 className="display-md text-on-surface mb-3">Build precision.</h1>
              <p className="body-md text-on-surface-variant">Join the professional engineering workspace.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                <p className="body-sm text-error">{error}</p>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="body-sm text-primary">{successMsg}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <label className="label-sm text-on-surface-variant block ml-1">Full Name</label>
                <input
                  className="w-full bg-surface-container-highest rounded-2xl px-6 py-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 ring-primary/20 transition-all outline-none"
                  placeholder="Dr. Sarah Chen"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="label-sm text-on-surface-variant block ml-1">Email ID</label>
                <input
                  className="w-full bg-surface-container-highest rounded-2xl px-6 py-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 ring-primary/20 transition-all outline-none"
                  placeholder="sarah@engineering.co"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="label-sm text-on-surface-variant block ml-1">Password</label>
                <input
                  className="w-full bg-surface-container-highest rounded-2xl px-6 py-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 ring-primary/20 transition-all outline-none"
                  placeholder="••••••••••••"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="mt-4 flex gap-2 px-1">
                  <div className="h-1.5 flex-1 rounded-full bg-primary"></div>
                  <div className="h-1.5 flex-1 rounded-full bg-primary"></div>
                  <div className="h-1.5 flex-1 rounded-full bg-primary"></div>
                  <div className="h-1.5 flex-1 rounded-full bg-surface-container-highest"></div>
                </div>
                <p className="label-sm text-primary mt-2 ml-1">Strength: Engineering Grade</p>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full primary-gradient text-on-primary font-bold py-4 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center justify-center disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>

              <div className="text-center pt-4">
                <p className="body-sm text-on-surface-variant">
                  Already have an account?
                  <Link to="/login" className="text-primary font-bold hover:text-primary-dim ml-1">Sign In</Link>
                </p>
              </div>
            </form>

            <div className="mt-12 flex items-center gap-6">
              <div className="h-px flex-1 bg-outline/10"></div>
              <span className="label-sm text-on-surface-variant/40">Verified Registration</span>
              <div className="h-px flex-1 bg-outline/10"></div>
            </div>

            <div className="mt-8 flex justify-center gap-8 opacity-40 grayscale">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="label-sm">TLS 1.3</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span className="label-sm">ISO 27001</span>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="w-full py-12 flex flex-col items-center justify-center gap-6 relative z-10">
        <div className="flex gap-12">
          <a className="label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Privacy</a>
          <a className="label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Terms</a>
          <a className="label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Support</a>
        </div>
        <p className="label-sm text-on-surface-variant/40 italic">
          © 2024 SOLIDS Engineering. Built for precision.
        </p>
      </footer>
    </div>
  );
}

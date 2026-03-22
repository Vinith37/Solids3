import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, CheckCircle, Circle } from 'lucide-react';
import { motion } from 'motion/react';

export default function ResetPassword() {
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
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-surface-container-low rounded-[2.5rem] p-12 ambient-shadow">
            <div className="mb-12">
              <h1 className="display-md text-on-surface mb-3">
                Set new password
              </h1>
              <p className="body-md text-on-surface-variant">
                Your new password must be different from previous used passwords.
              </p>
            </div>

            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-3">
                <label className="label-sm text-on-surface-variant block ml-1" htmlFor="new-password">
                  New Password
                </label>
                <div className="relative group">
                  <input 
                    className="w-full bg-surface-container-highest rounded-2xl px-6 py-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 ring-primary/20 transition-all outline-none" 
                    id="new-password" 
                    placeholder="••••••••" 
                    type="password" 
                  />
                  <button className="absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors" type="button">
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <span className="label-sm text-on-surface-variant">Strength</span>
                  <span className="label-sm text-primary font-bold">Engineering Grade</span>
                </div>
                <div className="flex gap-2 h-1.5">
                  <div className="h-full flex-1 rounded-full bg-primary"></div>
                  <div className="h-full flex-1 rounded-full bg-primary"></div>
                  <div className="h-full flex-1 rounded-full bg-surface-container-highest"></div>
                  <div className="h-full flex-1 rounded-full bg-surface-container-highest"></div>
                </div>
                <ul className="space-y-2 pt-2">
                  <li className="flex items-center gap-3 label-sm text-on-surface-variant">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-3 label-sm text-on-surface-variant">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    One special character
                  </li>
                  <li className="flex items-center gap-3 label-sm text-on-surface-variant/40 italic">
                    <Circle className="w-4 h-4" />
                    One uppercase letter
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <label className="label-sm text-on-surface-variant block ml-1" htmlFor="confirm-password">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input 
                    className="w-full bg-surface-container-highest rounded-2xl px-6 py-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 ring-primary/20 transition-all outline-none" 
                    id="confirm-password" 
                    placeholder="••••••••" 
                    type="password" 
                  />
                </div>
              </div>

              <div className="pt-4">
                <Link 
                  to="/login"
                  className="w-full primary-gradient text-on-primary font-bold py-4 rounded-full shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  Reset Password
                </Link>
              </div>
            </form>

            <div className="mt-10 text-center">
              <Link to="/login" className="label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="w-full py-12 flex flex-col items-center justify-center gap-6 relative z-10">
        <div className="flex gap-12">
          <a className="label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Privacy Policy</a>
          <a className="label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Terms of Service</a>
          <a className="label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Security Documentation</a>
        </div>
        <p className="label-sm text-on-surface-variant/40 italic">
          © 2024 SOLIDS Engineering. Built for precision.
        </p>
      </footer>
    </div>
  );
}

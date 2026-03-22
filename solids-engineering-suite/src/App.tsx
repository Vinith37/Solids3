import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { motion } from 'motion/react';
import { ArrowUpRight, TrendingUp, Users, DollarSign } from 'lucide-react';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import FailureTheories from './pages/FailureTheories';
import MohrCircle from './pages/MohrCircle';
import Beams from './pages/Beams';
import Torsion from './pages/Torsion';
import Fatigue from './pages/Fatigue';
import Ashby from './pages/Ashby';
import DynamicLoading from './pages/DynamicLoading';
import Materials from './pages/Materials';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/failure-theories" element={<FailureTheories />} />
        <Route path="/mohr-circle" element={<MohrCircle />} />
        <Route path="/beams" element={<Beams />} />
        <Route path="/torsion" element={<Torsion />} />
        <Route path="/fatigue" element={<Fatigue />} />
        <Route path="/ashby" element={<Ashby />} />
        <Route path="/dynamic" element={<DynamicLoading />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

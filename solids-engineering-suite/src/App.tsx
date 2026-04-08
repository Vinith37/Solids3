import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

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
import ThinCylinders from './pages/ThinCylinders';
import Buckling from './pages/Buckling';
import Settings from './pages/Settings';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/failure-theories" element={<PrivateRoute><FailureTheories /></PrivateRoute>} />
            <Route path="/mohr-circle" element={<PrivateRoute><MohrCircle /></PrivateRoute>} />
            <Route path="/beams" element={<PrivateRoute><Beams /></PrivateRoute>} />
            <Route path="/torsion" element={<PrivateRoute><Torsion /></PrivateRoute>} />
            <Route path="/fatigue" element={<PrivateRoute><Fatigue /></PrivateRoute>} />
            <Route path="/ashby" element={<PrivateRoute><Ashby /></PrivateRoute>} />
            <Route path="/dynamic" element={<PrivateRoute><DynamicLoading /></PrivateRoute>} />
            <Route path="/materials" element={<PrivateRoute><Materials /></PrivateRoute>} />
            <Route path="/thin-cylinders" element={<PrivateRoute><ThinCylinders /></PrivateRoute>} />
            <Route path="/buckling" element={<PrivateRoute><Buckling /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Dashboard from './pages/Dashboard';
import VehicleRegistry from './pages/VehicleRegistry';
import TripDispatcher from './pages/TripDispatcher';
import Maintenance from './pages/Maintenance';
import ExpenseFuelLog from './pages/ExpenseFuelLog';
import DriverPerformance from './pages/DriverPerformance';
import Analytics from './pages/Analytics';
import DashboardLayout from './components/DashboardLayout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              fontSize: '14px'
            }
          }}
        />
        <Routes>
          {/* Auth pages (no sidebar) */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Dashboard pages (with sidebar layout) */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vehicles" element={<VehicleRegistry />} />
            <Route path="/trips" element={<TripDispatcher />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/expenses" element={<ExpenseFuelLog />} />
            <Route path="/performance" element={<DriverPerformance />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// Placeholder for upcoming pages
function ComingSoon({ page }) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-4xl mb-4">🚧</p>
        <h2 className="text-2xl font-bold text-white mb-2">{page}</h2>
        <p className="text-slate-400">Coming soon...</p>
      </div>
    </div>
  );
}

export default App;

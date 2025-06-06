import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const loadProfile = useAuthStore((state) => state.loadProfile);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <PrivateRoute>
              <Transactions />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

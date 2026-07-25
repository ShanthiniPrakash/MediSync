import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import PatientDashboard from './pages/patient/PatientDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import EmergencyDashboard from './pages/EmergencyDashboard';
import DashboardLayout from './layouts/DashboardLayout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="spinner-container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        
        {/* Public or Quick-Access Emergency Portal */}
        <Route path="/emergency-portal" element={<EmergencyDashboard />} />

        {/* Dashboard Layout Wrapper */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              user ? (
                user.role === 'ROLE_ADMIN' ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : user.role === 'ROLE_PHARMACY' ? (
                  <Navigate to="/pharmacy/dashboard" replace />
                ) : (
                  <Navigate to="/patient/dashboard" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          
          <Route
            path="patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="pharmacy/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ROLE_PHARMACY']}>
                <PharmacyDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

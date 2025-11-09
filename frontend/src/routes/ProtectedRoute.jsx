import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // 'replace' allows sending users back to where they left before going to the Login Page
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
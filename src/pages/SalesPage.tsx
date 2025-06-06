import React from 'react';
import SalesModule from '../components/sales/SalesModule';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const SalesPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <SalesModule userRole={user.role} />;
};

export default SalesPage; 
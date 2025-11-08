import React from 'react';
import { Navigate } from 'react-router-dom';
import storage from '../services/storage';

function PrivateRoute({ children, allowedRoles }) {
  storage.initDefaultData();
  const user = storage.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;


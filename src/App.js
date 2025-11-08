import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import ManagerDashboard from './components/ManagerDashboard';
import AccountantDashboard from './components/AccountantDashboard';
import DirectorDashboard from './components/DirectorDashboard';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/manager/*"
            element={
              <PrivateRoute allowedRoles={['manager']}>
                <ManagerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/accountant/*"
            element={
              <PrivateRoute allowedRoles={['accountant']}>
                <AccountantDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/director/*"
            element={
              <PrivateRoute allowedRoles={['director']}>
                <DirectorDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


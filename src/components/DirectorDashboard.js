import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import storage from '../services/storage';
import ReportsTab from './director/ReportsTab';
import AnalyticsTab from './director/AnalyticsTab';
import './Dashboard.css';

function DirectorDashboard() {
  const [activeTab, setActiveTab] = useState('reports');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    storage.initDefaultData();
    const currentUser = storage.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    storage.logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1>Панель директора</h1>
          <div className="user-info">
            <span>{user?.username}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </div>
      </div>
      <div className="dashboard-nav">
        <div className="dashboard-nav-content">
          <button
            className={`nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Отчеты
          </button>
          <button
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Аналитика
          </button>
        </div>
      </div>
      <div className="dashboard-content">
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  );
}

export default DirectorDashboard;


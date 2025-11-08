import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import storage from '../services/storage';
import ProductsTab from './manager/ProductsTab';
import OperationsTab from './manager/OperationsTab';
import ReportsTab from './manager/ReportsTab';
import './Dashboard.css';

function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState('products');
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
          <h1>Панель менеджера</h1>
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
            className={`nav-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Товары
          </button>
          <button
            className={`nav-tab ${activeTab === 'operations' ? 'active' : ''}`}
            onClick={() => setActiveTab('operations')}
          >
            Операции
          </button>
          <button
            className={`nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Отчеты
          </button>
        </div>
      </div>
      <div className="dashboard-content">
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'operations' && <OperationsTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </div>
    </div>
  );
}

export default ManagerDashboard;


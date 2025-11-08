import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      // Redirect based on role
      const role = response.data.user.role;
      if (role === 'manager') {
        navigate('/manager');
      } else if (role === 'accountant') {
        navigate('/accountant');
      } else if (role === 'director') {
        navigate('/director');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при входе в систему');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>ООО «Айрус»</h1>
        <h2>Система управления</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label htmlFor="username">Логин</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <div className="login-info">
          <p><strong>Тестовые учетные записи:</strong></p>
          <p>Директор: director / director123</p>
          <p>Менеджер: manager / manager123</p>
          <p>Бухгалтер: accountant / accountant123</p>
        </div>
      </div>
    </div>
  );
}

export default Login;


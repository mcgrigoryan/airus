import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function SalariesTab() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      const response = await api.get('/salaries');
      setSalaries(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при загрузке данных о зарплатах');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/salaries/export/txt');
      const blob = new Blob([response.data], { type: 'text/plain; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `salaries_${new Date().toISOString().split('T')[0]}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Ошибка при экспорте');
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  const total = salaries.reduce((sum, s) => sum + s.salary, 0);

  return (
    <div>
      <div className="actions-bar">
        <h2>Расчет заработной платы</h2>
        <button className="btn btn-primary" onClick={handleExport}>
          Экспорт в TXT
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Должность</th>
              <th>Оклад</th>
            </tr>
          </thead>
          <tbody>
            {salaries.map((salary, index) => (
              <tr key={index}>
                <td>{salary.position}</td>
                <td>{salary.salary.toLocaleString('ru-RU')} руб.</td>
              </tr>
            ))}
            <tr style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
              <td>ИТОГО</td>
              <td>{total.toLocaleString('ru-RU')} руб.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalariesTab;


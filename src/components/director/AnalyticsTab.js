import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

function AnalyticsTab() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [year]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/analytics/sales?year=${year}`);
      setAnalytics(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при загрузке аналитики');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  const chartData = analytics?.monthlyData || [];

  return (
    <div>
      <div className="actions-bar">
        <h2>Аналитика продаж</h2>
        <div className="form-group" style={{ marginBottom: 0, width: '200px' }}>
          <label htmlFor="year">Год</label>
          <input
            type="number"
            id="year"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            min="2020"
            max="2100"
          />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Динамика продаж за {year} год</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="sold"
                stroke="#007bff"
                name="Продано (шт)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#28a745"
                name="Прибыль (руб)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="loss"
                stroke="#dc3545"
                name="Убытки (руб)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>Нет данных за выбранный год</p>
        )}
      </div>

      {chartData.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '16px' }}>Детальная статистика</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Месяц</th>
                <th>Продано (шт)</th>
                <th>Прибыль (руб)</th>
                <th>Убытки (руб)</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((month) => (
                <tr key={month.month}>
                  <td>{month.monthName}</td>
                  <td>{month.sold}</td>
                  <td style={{ color: '#28a745' }}>
                    {month.profit.toLocaleString('ru-RU')} руб.
                  </td>
                  <td style={{ color: '#dc3545' }}>
                    {month.loss.toLocaleString('ru-RU')} руб.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AnalyticsTab;


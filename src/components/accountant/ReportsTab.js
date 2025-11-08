import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      setReports(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при загрузке отчетов');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="actions-bar">
        <h2>Просмотр отчетов</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Отчеты менеджера</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Месяц</th>
              <th>Год</th>
              <th>Создан</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>
                  Нет отчетов
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id}>
                  <td>
                    {new Date(2000, report.month - 1).toLocaleString('ru-RU', { month: 'long' })}
                  </td>
                  <td>{report.year}</td>
                  <td>{new Date(report.created_at).toLocaleString('ru-RU')}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleViewReport(report)}
                    >
                      Просмотр
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedReport && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>
              Отчет за {new Date(2000, selectedReport.month - 1).toLocaleString('ru-RU', { month: 'long' })} {selectedReport.year}
            </h3>
            <button className="btn btn-secondary" onClick={() => setSelectedReport(null)}>
              Закрыть
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Наименование</th>
                <th>Произведено</th>
                <th>Закуплено</th>
                <th>Продано</th>
                <th>Остаток</th>
                <th>Прибыль</th>
                <th>Убытки</th>
              </tr>
            </thead>
            <tbody>
              {selectedReport.data.products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.produced}</td>
                  <td>{product.purchased}</td>
                  <td>{product.sold}</td>
                  <td>{product.stock}</td>
                  <td style={{ color: '#28a745' }}>
                    {product.profit.toLocaleString('ru-RU')} руб.
                  </td>
                  <td style={{ color: '#dc3545' }}>
                    {product.loss.toLocaleString('ru-RU')} руб.
                  </td>
                </tr>
              ))}
              <tr style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                <td>ИТОГО</td>
                <td>{selectedReport.data.totals.produced}</td>
                <td>{selectedReport.data.totals.purchased}</td>
                <td>{selectedReport.data.totals.sold}</td>
                <td>-</td>
                <td style={{ color: '#28a745' }}>
                  {selectedReport.data.totals.profit.toLocaleString('ru-RU')} руб.
                </td>
                <td style={{ color: '#dc3545' }}>
                  {selectedReport.data.totals.loss.toLocaleString('ru-RU')} руб.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ReportsTab;


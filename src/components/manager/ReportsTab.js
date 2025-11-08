import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [currentReport, setCurrentReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      setReports(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при загрузке отчетов');
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setCurrentReport(null);

    try {
      const response = await api.post('/reports/generate', { month, year });
      setCurrentReport(response.data);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при формировании отчета');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (reportId) => {
    try {
      const response = await api.get(`/reports/${reportId}/export/json`);
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const report = reports.find(r => r.id === reportId) || currentReport;
      link.setAttribute('download', `report_${report?.year || year}_${String(report?.month || month).padStart(2, '0')}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Ошибка при экспорте отчета');
    }
  };

  return (
    <div>
      <div className="actions-bar">
        <h2>Формирование отчетов</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Сформировать отчет</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label htmlFor="month">Месяц</label>
            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString('ru-RU', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
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
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Формирование...' : 'Сформировать отчет'}
          </button>
        </div>

        {currentReport && currentReport.data && (
          <div style={{ marginTop: '20px' }}>
            <h4>Результаты отчета за {new Date(2000, month - 1).toLocaleString('ru-RU', { month: 'long' })} {year}</h4>
            <table className="table" style={{ marginTop: '16px' }}>
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
                {currentReport.data.products && currentReport.data.products.length > 0 ? (
                  currentReport.data.products.map((product) => (
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center' }}>
                      Нет данных за выбранный период
                    </td>
                  </tr>
                )}
                {currentReport.data.products && currentReport.data.products.length > 0 && (
                  <tr style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                    <td>ИТОГО</td>
                    <td>{currentReport.data.totals.produced}</td>
                    <td>{currentReport.data.totals.purchased}</td>
                    <td>{currentReport.data.totals.sold}</td>
                    <td>-</td>
                    <td style={{ color: '#28a745' }}>
                      {currentReport.data.totals.profit.toLocaleString('ru-RU')} руб.
                    </td>
                    <td style={{ color: '#dc3545' }}>
                      {currentReport.data.totals.loss.toLocaleString('ru-RU')} руб.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {currentReport.id && (
              <button
                className="btn btn-success"
                onClick={() => handleExport(currentReport.id)}
                style={{ marginTop: '16px' }}
              >
                Сохранить отчет (JSON)
              </button>
            )}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3 style={{ marginBottom: '16px' }}>История отчетов</h3>
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
                      className="btn btn-secondary"
                      onClick={() => handleExport(report.id)}
                    >
                      Экспорт JSON
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportsTab;


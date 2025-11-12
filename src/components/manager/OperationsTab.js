import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import OperationModal from './OperationModal';

function OperationsTab() {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchOperations();
  }, []);

  const fetchOperations = async () => {
    try {
      const response = await api.get('/operations');
      setOperations(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при загрузке операций');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalSave = () => {
    fetchOperations();
    setInfo('Операция успешно зарегистрирована.');
    handleModalClose();
  };

  const resetFilters = () => {
    setTypeFilter('all');
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
  };

  const filteredOperations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return operations.filter((operation) => {
      const matchesType = typeFilter === 'all' || operation.type === typeFilter;
      const matchesSearch = term
        ? operation.product_name.toLowerCase().includes(term)
        : true;
      const opDate = operation.operation_date;
      const matchesDateFrom = dateFrom ? opDate >= dateFrom : true;
      const matchesDateTo = dateTo ? opDate <= dateTo : true;
      return matchesType && matchesSearch && matchesDateFrom && matchesDateTo;
    });
  }, [operations, typeFilter, searchTerm, dateFrom, dateTo]);

  const operationsStats = useMemo(() => {
    return operations.reduce(
      (acc, operation) => {
        if (operation.type === 'Производство') {
          acc.production += operation.quantity;
        } else if (operation.type === 'Закупка') {
          acc.purchase += operation.quantity;
        } else if (operation.type === 'Продажа') {
          acc.sale += operation.quantity;
        }
        acc.total += 1;
        return acc;
      },
      { total: 0, production: 0, purchase: 0, sale: 0 }
    );
  }, [operations]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="actions-bar">
        <h2>Учет операций</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          Записать операцию
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {info && <div className="alert alert-success">{info}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Всего операций</h3>
          <div className="value">{operationsStats.total}</div>
        </div>
        <div className="stat-card">
          <h3>Производство (шт)</h3>
          <div className="value">{operationsStats.production}</div>
        </div>
        <div className="stat-card">
          <h3>Закупка (шт)</h3>
          <div className="value">{operationsStats.purchase}</div>
        </div>
        <div className="stat-card">
          <h3>Продажа (шт)</h3>
          <div className="value">{operationsStats.sale}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="filters-grid filters-grid--operations">
          <div className="form-group inline-form-group">
            <label htmlFor="operation-type">Тип операции</label>
            <select
              id="operation-type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Все типы</option>
              <option value="Производство">Производство</option>
              <option value="Закупка">Закупка</option>
              <option value="Продажа">Продажа</option>
            </select>
          </div>

          <div className="form-group inline-form-group">
            <label htmlFor="operation-search">Поиск по товару</label>
            <input
              id="operation-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Введите наименование товара"
            />
          </div>

          <div className="form-group inline-form-group">
            <label htmlFor="date-from">С даты</label>
            <input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              max={dateTo || undefined}
            />
          </div>

          <div className="form-group inline-form-group">
            <label htmlFor="date-to">По дату</label>
            <input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom || undefined}
            />
          </div>

          <div className="filters-actions">
            <button className="btn btn-secondary" onClick={resetFilters}>
              Сбросить фильтры
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Журнал операций (последние 30)</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Тип операции</th>
              <th>Товар</th>
              <th>Категория</th>
              <th>Количество</th>
            </tr>
          </thead>
          <tbody>
            {filteredOperations.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>
                  {operations.length === 0
                    ? 'Нет операций'
                    : 'По заданным условиям фильтрации операции не найдены'}
                </td>
              </tr>
            ) : (
              filteredOperations.map((operation) => (
                <tr key={operation.id}>
                  <td>{new Date(operation.operation_date).toLocaleDateString('ru-RU')}</td>
                  <td>{operation.type}</td>
                  <td>{operation.product_name}</td>
                  <td>{operation.category}</td>
                  <td>{operation.quantity}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <OperationModal
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}

export default OperationsTab;


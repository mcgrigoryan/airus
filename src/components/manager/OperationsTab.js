import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import OperationModal from './OperationModal';

function OperationsTab() {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOperations();
  }, []);

  const fetchOperations = async () => {
    try {
      const response = await api.get('/operations');
      setOperations(response.data);
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
    handleModalClose();
  };

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
            {operations.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>
                  Нет операций
                </td>
              </tr>
            ) : (
              operations.map((operation) => (
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


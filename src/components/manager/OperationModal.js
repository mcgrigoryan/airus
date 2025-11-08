import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function OperationModal({ onClose, onSave }) {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    type: 'Производство',
    product_id: '',
    quantity: '',
    operation_date: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.filter(p => p.is_active));
    } catch (err) {
      setError('Ошибка при загрузке товаров');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        ...formData,
        product_id: parseInt(formData.product_id),
        quantity: parseInt(formData.quantity)
      };

      await api.post('/operations', data);
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при создании операции');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Записать операцию</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="type">Тип операции</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              <option value="Производство">Производство</option>
              <option value="Закупка">Закупка</option>
              <option value="Продажа">Продажа</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="product_id">Товар</label>
            <select
              id="product_id"
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              required
            >
              <option value="">Выберите товар</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (Остаток: {product.stock})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Количество</label>
            <input
              type="number"
              id="quantity"
              min="1"
              step="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="operation_date">Дата операции</label>
            <input
              type="date"
              id="operation_date"
              value={formData.operation_date}
              onChange={(e) => setFormData({ ...formData, operation_date: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Сохранение...' : 'Записать операцию'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OperationModal;


import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function ProductModal({ product, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Для дома',
    cost_price: '',
    selling_price: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        cost_price: product.cost_price,
        selling_price: product.selling_price
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        ...formData,
        cost_price: parseFloat(formData.cost_price),
        selling_price: parseFloat(formData.selling_price)
      };

      if (product) {
        await api.put(`/products/${product.id}`, data);
      } else {
        await api.post('/products', data);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при сохранении товара');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{product ? 'Редактировать товар' : 'Добавить товар'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Наименование</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              maxLength={255}
              disabled={!!product}
            />
            {product && <small style={{ color: '#666' }}>Наименование нельзя изменить</small>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Категория</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="Для дома">Для дома</option>
              <option value="Для автомобиля">Для автомобиля</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="cost_price">Себестоимость</label>
            <input
              type="number"
              id="cost_price"
              step="0.01"
              min="0.01"
              value={formData.cost_price}
              onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="selling_price">Цена продажи</label>
            <input
              type="number"
              id="selling_price"
              step="0.01"
              min="0.01"
              value={formData.selling_price}
              onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;


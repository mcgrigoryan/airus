import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ProductModal from './ProductModal';

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при загрузке товаров');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при удалении товара');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleModalSave = () => {
    fetchProducts();
    handleModalClose();
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="actions-bar">
        <h2>Учет товаров</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          Добавить товар
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Наименование</th>
              <th>Категория</th>
              <th>Себестоимость</th>
              <th>Цена продажи</th>
              <th>Остаток</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>
                  Нет товаров
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.cost_price.toLocaleString('ru-RU')} руб.</td>
                  <td>{product.selling_price.toLocaleString('ru-RU')} руб.</td>
                  <td>{product.stock}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleEdit(product)}
                      >
                        Редактировать
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(product.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}

export default ProductsTab;


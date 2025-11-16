import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import ProductModal from './ProductModal';

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
      setError('');
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

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
  };

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch = term
        ? product.name.toLowerCase().includes(term)
        : true;
      const matchesCategory =
        categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

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

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="filters-grid">
          <div className="form-group inline-form-group">
            <label htmlFor="product-search">Поиск по наименованию</label>
            <input
              id="product-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Введите название товара"
            />
          </div>
          <div className="form-group inline-form-group">
            <label htmlFor="product-category">Категория</label>
            <select
              id="product-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Все категории</option>
              <option value="Для дома">Для дома</option>
              <option value="Для автомобиля">Для автомобиля</option>
            </select>
          </div>
          <div className="filters-actions">
            <button className="btn btn-secondary" onClick={resetFilters}>
              Сбросить фильтры
            </button>
          </div>
        </div>
      </div>

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
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>
                  {products.length === 0
                    ? 'Нет товаров'
                    : 'По заданным условиям фильтрации товары не найдены'}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
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


// API сервис для работы с localStorage
import storage from './storage';

// Симуляция API для совместимости с существующим кодом
const api = {
  // Авторизация
  post: async (url, data) => {
    if (url === '/auth/login') {
      const { username, password } = data;
      // Инициализируем данные перед логином
      storage.initDefaultData();
      const result = await Promise.resolve(storage.login(username, password));
      if (result.success) {
        return { data: { token: 'mock-token', user: result.user } };
      }
      throw { response: { data: { error: result.error } } };
    }
    
    // Операции
    if (url === '/operations') {
      const result = await Promise.resolve(storage.createOperation(data));
      if (result.success) {
        return { data: result.operation };
      }
      throw { response: { data: { error: result.error } } };
    }
    
    // Товары
    if (url === '/products') {
      const product = storage.createProduct(data);
      return { data: product };
    }
    
    // Отчеты
    if (url === '/reports/generate') {
      const user = storage.getCurrentUser();
      const report = storage.generateReport(data.month, data.year, user.id);
      return { data: report };
    }
    
    throw { response: { data: { error: 'Unknown endpoint' } } };
  },
  
  get: async (url) => {
    // Товары
    if (url === '/products') {
      const products = await Promise.resolve(storage.getProducts());
      return { data: products.filter(p => p.is_active) };
    }
    
    if (url.startsWith('/products/')) {
      const id = url.split('/')[2];
      const product = await Promise.resolve(storage.getProduct(id));
      if (!product) {
        throw { response: { status: 404, data: { error: 'Товар не найден' } } };
      }
      return { data: product };
    }
    
    // Операции
    if (url === '/operations') {
      const operations = await Promise.resolve(storage.getOperations());
      return { data: operations };
    }
    
    // Отчеты
    if (url === '/reports') {
      const user = storage.getCurrentUser();
      const reports = await Promise.resolve(storage.getReports(user.role));
      return { data: reports };
    }
    
    if (url.startsWith('/reports/') && url.endsWith('/export/json')) {
      const id = parseInt(url.split('/')[2]);
      const reports = storage.getReports('director');
      const report = reports.find(r => r.id === id);
      if (!report) {
        throw { response: { status: 404, data: { error: 'Отчет не найден' } } };
      }
      return { data: JSON.stringify(report.data, null, 2) };
    }
    
    if (url.startsWith('/reports/') && url.endsWith('/export/excel')) {
      const id = parseInt(url.split('/')[2]);
      const reports = storage.getReports('director');
      const report = reports.find(r => r.id === id);
      if (!report) {
        throw { response: { status: 404, data: { error: 'Отчет не найден' } } };
      }
      // Экспорт в Excel будет обработан в компоненте
      return { data: report };
    }
    
    // Зарплаты
    if (url === '/salaries') {
      const salaries = storage.getSalaries();
      return { data: salaries };
    }
    
    if (url === '/salaries/export/txt') {
      const salaries = storage.getSalaries();
      let txtContent = 'ВЕДОМОСТЬ ЗАРАБОТНОЙ ПЛАТЫ\n';
      txtContent += '='.repeat(50) + '\n\n';
      salaries.forEach(({ position, salary }) => {
        txtContent += `${position}: ${salary.toLocaleString('ru-RU')} руб.\n`;
      });
      txtContent += '\n' + '='.repeat(50) + '\n';
      const total = salaries.reduce((sum, s) => sum + s.salary, 0);
      txtContent += `ИТОГО: ${total.toLocaleString('ru-RU')} руб.\n`;
      return { data: txtContent };
    }
    
    // Аналитика
    if (url.startsWith('/analytics/sales')) {
      const params = new URLSearchParams(url.split('?')[1]);
      const year = params.get('year') || new Date().getFullYear();
      const analytics = await Promise.resolve(storage.getSalesAnalytics(year));
      return { data: analytics };
    }
    
    throw { response: { status: 404, data: { error: 'Not found' } } };
  },
  
  put: async (url, data) => {
    if (url.startsWith('/products/')) {
      const id = url.split('/')[2];
      const product = await Promise.resolve(storage.updateProduct(id, data));
      if (!product) {
        throw { response: { status: 404, data: { error: 'Товар не найден' } } };
      }
      return { data: product };
    }
    
    throw { response: { status: 404, data: { error: 'Not found' } } };
  },
  
  delete: async (url) => {
    if (url.startsWith('/products/')) {
      const id = url.split('/')[2];
      const success = await Promise.resolve(storage.deleteProduct(id));
      if (!success) {
        throw { response: { status: 404, data: { error: 'Товар не найден' } } };
      }
      return { data: { message: 'Товар успешно удален' } };
    }
    
    throw { response: { status: 404, data: { error: 'Not found' } } };
  }
};

export default api;


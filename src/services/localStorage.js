const STORAGE_KEYS = {
  USERS: 'airus_users',
  PRODUCTS: 'airus_products',
  OPERATIONS: 'airus_operations',
  REPORTS: 'airus_reports',
  CURRENT_USER: 'airus_current_user'
};

const initDefaultData = () => {
  const defaultUsers = [
    { id: 1, username: 'director', password: 'director123', role: 'director' },
    { id: 2, username: 'manager', password: 'manager123', role: 'manager' },
    { id: 3, username: 'accountant', password: 'accountant123', role: 'accountant' }
  ];

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.OPERATIONS)) {
    localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
  }
};

const getData = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const setData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const login = (username, password) => {
  initDefaultData();

  const activeSession = getCurrentUser();
  if (activeSession) {
    return {
      success: false,
      error: `Пользователь "${activeSession.username}" уже авторизован. Выполните выход, чтобы войти под другой учетной записью.`
    };
  }

  const trimmedUsername = username.trim();
  const users = getData(STORAGE_KEYS.USERS);
  const user = users.find(
    (u) => u.username === trimmedUsername && u.password === password
  );

  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    setData(STORAGE_KEYS.CURRENT_USER, userWithoutPassword);
    return { success: true, user: userWithoutPassword };
  }

  return { success: false, error: 'Неверный логин или пароль' };
};

const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

const getCurrentUser = () => {
  return getData(STORAGE_KEYS.CURRENT_USER);
};

const getProducts = () => {
  initDefaultData();
  return getData(STORAGE_KEYS.PRODUCTS) || [];
};

const getProduct = (id) => {
  const products = getProducts();
  return products.find(p => p.id === parseInt(id));
};

const createProduct = (productData) => {
  const products = getProducts();
  const newProduct = {
    id: Date.now(),
    ...productData,
    stock: 0,
    is_active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  products.push(newProduct);
  setData(STORAGE_KEYS.PRODUCTS, products);
  return newProduct;
};

const updateProduct = (id, productData) => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === parseInt(id));
  if (index === -1) return null;
  
  products[index] = {
    ...products[index],
    ...productData,
    updated_at: new Date().toISOString()
  };
  setData(STORAGE_KEYS.PRODUCTS, products);
  return products[index];
};

const deleteProduct = (id) => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === parseInt(id));
  if (index === -1) return false;
  
  products[index].is_active = 0;
  products[index].updated_at = new Date().toISOString();
  setData(STORAGE_KEYS.PRODUCTS, products);
  return true;
};

const getOperations = () => {
  initDefaultData();
  const operations = getData(STORAGE_KEYS.OPERATIONS) || [];
  const products = getProducts();
  
  return operations
    .map(op => {
      const product = products.find(p => p.id === op.product_id);
      return {
        ...op,
        product_name: product?.name || 'Неизвестный товар',
        category: product?.category || ''
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 30);
};

const createOperation = (operationData) => {
  initDefaultData();
  const operations = getData(STORAGE_KEYS.OPERATIONS) || [];
  const products = getProducts();
  
  const product = products.find(p => p.id === parseInt(operationData.product_id));
  if (!product || !product.is_active) {
    return { success: false, error: 'Товар не найден или неактивен' };
  }
  
  if (operationData.type === 'Продажа' && product.stock < operationData.quantity) {
    return { success: false, error: 'Недостаточно товара на складе' };
  }
  
  const newOperation = {
    id: Date.now(),
    ...operationData,
    product_id: parseInt(operationData.product_id),
    quantity: parseInt(operationData.quantity),
    created_at: new Date().toISOString()
  };
  operations.push(newOperation);
  setData(STORAGE_KEYS.OPERATIONS, operations);
  
  let newStock = product.stock;
  if (operationData.type === 'Производство' || operationData.type === 'Закупка') {
    newStock += operationData.quantity;
  } else if (operationData.type === 'Продажа') {
    newStock -= operationData.quantity;
  }
  
  updateProduct(product.id, { stock: newStock });
  
  return { success: true, operation: newOperation, newStock };
};

const getReports = (userRole) => {
  initDefaultData();
  const reports = getData(STORAGE_KEYS.REPORTS) || [];
  const currentUser = getCurrentUser();
  
  if (userRole === 'director') {
    return reports.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.month - a.month;
    });
  }
  
  return reports
    .filter(r => r.created_by === currentUser?.id)
    .sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.month - a.month;
    });
};

const generateReport = (month, year, userId) => {
  initDefaultData();
  const products = getProducts().filter(p => p.is_active);
  const operations = getData(STORAGE_KEYS.OPERATIONS) || [];
  
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  
  const reportData = {
    month: parseInt(month),
    year: parseInt(year),
    products: [],
    totals: {
      produced: 0,
      purchased: 0,
      sold: 0,
      profit: 0,
      loss: 0
    }
  };
  
  products.forEach(product => {
    const monthOperations = operations.filter(op => {
      const opDate = op.operation_date;
      return op.product_id === product.id &&
             opDate >= startDate &&
             opDate <= endDate;
    });
    
    let produced = 0;
    let purchased = 0;
    let sold = 0;
    
    monthOperations.forEach(op => {
      if (op.type === 'Производство') produced += op.quantity;
      if (op.type === 'Закупка') purchased += op.quantity;
      if (op.type === 'Продажа') sold += op.quantity;
    });
    
    const revenue = sold * product.selling_price;
    const cost = (produced + purchased) * product.cost_price;
    const profit = revenue - cost;
    
    const productData = {
      id: product.id,
      name: product.name,
      category: product.category,
      produced,
      purchased,
      sold,
      stock: product.stock,
      profit: profit > 0 ? profit : 0,
      loss: profit < 0 ? Math.abs(profit) : 0
    };
    
    reportData.products.push(productData);
    reportData.totals.produced += produced;
    reportData.totals.purchased += purchased;
    reportData.totals.sold += sold;
    reportData.totals.profit += productData.profit;
    reportData.totals.loss += productData.loss;
  });
  
  const newReport = {
    id: Date.now(),
    month: parseInt(month),
    year: parseInt(year),
    data: reportData,
    created_by: userId,
    created_by_name: getCurrentUser()?.username || 'Неизвестно',
    created_at: new Date().toISOString()
  };
  
  const reports = getData(STORAGE_KEYS.REPORTS) || [];
  reports.push(newReport);
  setData(STORAGE_KEYS.REPORTS, reports);
  
  return { ...newReport, data: reportData };
};

const getSalaries = () => {
  return [
    { position: 'Директор', salary: 80000 },
    { position: 'Менеджер', salary: 55000 },
    { position: 'Бухгалтер', salary: 50000 },
    { position: 'Мастер цеха', salary: 45000 },
    { position: 'Кладовщик', salary: 35000 }
  ];
};

const getSalesAnalytics = (year) => {
  initDefaultData();
  const reports = getData(STORAGE_KEYS.REPORTS) || [];
  const yearReports = reports.filter(r => r.year === parseInt(year));
  
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  
  const monthlyData = [];
  for (let i = 1; i <= 12; i++) {
    monthlyData.push({
      month: i,
      monthName: monthNames[i - 1],
      sold: 0,
      profit: 0,
      loss: 0
    });
  }
  
  yearReports.forEach(report => {
    const monthIndex = report.month - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      monthlyData[monthIndex] = {
        month: report.month,
        monthName: monthNames[monthIndex],
        sold: report.data.totals.sold,
        profit: report.data.totals.profit,
        loss: report.data.totals.loss
      };
    }
  });
  
  return {
    year: parseInt(year),
    monthlyData
  };
};

const storage = {
  initDefaultData,
  login,
  logout,
  getCurrentUser,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getOperations,
  createOperation,
  getReports,
  generateReport,
  getSalaries,
  getSalesAnalytics
};

export default storage;


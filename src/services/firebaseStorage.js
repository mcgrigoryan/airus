// Сервис для работы с Firebase Firestore
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit
} from 'firebase/firestore';
import { db } from './firebase';

// Проверка наличия db
if (!db) {
  console.error('Firebase не инициализирован. Проверьте конфигурацию в firebase.js');
}

// Коллекции в Firestore
const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  OPERATIONS: 'operations',
  REPORTS: 'reports'
};

// Инициализация данных по умолчанию
export const initDefaultData = async () => {
  try {
    // Проверяем, есть ли пользователи
    const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    
    if (usersSnapshot.empty) {
      // Создаем пользователей по умолчанию
      const defaultUsers = [
        { username: 'director', password: 'director123', role: 'director' },
        { username: 'manager', password: 'manager123', role: 'manager' },
        { username: 'accountant', password: 'accountant123', role: 'accountant' }
      ];

      for (const user of defaultUsers) {
        await addDoc(collection(db, COLLECTIONS.USERS), user);
      }
    }
  } catch (error) {
    console.error('Ошибка инициализации данных:', error);
  }
};

// Авторизация
export const login = async (username, password) => {
  try {
    const usersSnapshot = await getDocs(
      query(collection(db, COLLECTIONS.USERS), where('username', '==', username))
    );

    if (usersSnapshot.empty) {
      return { success: false, error: 'Неверный логин или пароль' };
    }

    const userDoc = usersSnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    if (user.password !== password) {
      return { success: false, error: 'Неверный логин или пароль' };
    }

    const { password: _, ...userWithoutPassword } = user;
    
    // Сохраняем текущего пользователя в localStorage для быстрого доступа
    localStorage.setItem('airus_current_user', JSON.stringify(userWithoutPassword));

    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    return { success: false, error: 'Ошибка при входе в систему' };
  }
};

// Выход
export const logout = () => {
  localStorage.removeItem('airus_current_user');
};

// Получить текущего пользователя
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('airus_current_user');
  return userStr ? JSON.parse(userStr) : null;
};

// Товары
export const getProducts = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, COLLECTIONS.PRODUCTS), where('is_active', '==', true))
    );
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Ошибка получения товаров:', error);
    return [];
  }
};

export const getProduct = async (id) => {
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Ошибка получения товара:', error);
    return null;
  }
};

export const createProduct = async (productData) => {
  try {
    const newProduct = {
      ...productData,
      stock: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), newProduct);
    return { id: docRef.id, ...newProduct };
  } catch (error) {
    console.error('Ошибка создания товара:', error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
    await updateDoc(docRef, {
      ...productData,
      updated_at: new Date().toISOString()
    });
    return await getProduct(id);
  } catch (error) {
    console.error('Ошибка обновления товара:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
    await updateDoc(docRef, { is_active: false, updated_at: new Date().toISOString() });
    return true;
  } catch (error) {
    console.error('Ошибка удаления товара:', error);
    throw error;
  }
};

// Операции
export const getOperations = async () => {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.OPERATIONS),
        orderBy('created_at', 'desc'),
        limit(30)
      )
    );
    
    const operations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const products = await getProducts();
    
    return operations.map(op => {
      const product = products.find(p => p.id === op.product_id);
      return {
        ...op,
        product_name: product?.name || 'Неизвестный товар',
        category: product?.category || ''
      };
    });
  } catch (error) {
    console.error('Ошибка получения операций:', error);
    return [];
  }
};

export const createOperation = async (operationData) => {
  try {
    const product = await getProduct(operationData.product_id);
    if (!product || !product.is_active) {
      return { success: false, error: 'Товар не найден или неактивен' };
    }

    if (operationData.type === 'Продажа' && product.stock < operationData.quantity) {
      return { success: false, error: 'Недостаточно товара на складе' };
    }

    const newOperation = {
      ...operationData,
      product_id: operationData.product_id,
      quantity: parseInt(operationData.quantity),
      created_at: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.OPERATIONS), newOperation);

    // Обновить остаток товара
    let newStock = product.stock;
    if (operationData.type === 'Производство' || operationData.type === 'Закупка') {
      newStock += operationData.quantity;
    } else if (operationData.type === 'Продажа') {
      newStock -= operationData.quantity;
    }

    await updateProduct(product.id, { stock: newStock });

    return { 
      success: true, 
      operation: { id: docRef.id, ...newOperation }, 
      newStock 
    };
  } catch (error) {
    console.error('Ошибка создания операции:', error);
    return { success: false, error: 'Ошибка при создании операции' };
  }
};

// Отчеты
export const getReports = async (userRole) => {
  try {
    const currentUser = getCurrentUser();
    let q;

    if (userRole === 'director') {
      q = query(
        collection(db, COLLECTIONS.REPORTS),
        orderBy('year', 'desc'),
        orderBy('month', 'desc')
      );
    } else {
      q = query(
        collection(db, COLLECTIONS.REPORTS),
        where('created_by', '==', currentUser?.id),
        orderBy('year', 'desc'),
        orderBy('month', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        data: typeof data.data === 'string' ? JSON.parse(data.data) : data.data
      };
    });
  } catch (error) {
    console.error('Ошибка получения отчетов:', error);
    return [];
  }
};

export const generateReport = async (month, year, userId) => {
  try {
    const products = await getProducts();
    const operationsSnapshot = await getDocs(collection(db, COLLECTIONS.OPERATIONS));
    const operations = operationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

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

    for (const product of products) {
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
    }

    const currentUser = getCurrentUser();
    const newReport = {
      month: parseInt(month),
      year: parseInt(year),
      data: JSON.stringify(reportData),
      created_by: userId,
      created_by_name: currentUser?.username || 'Неизвестно',
      created_at: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.REPORTS), newReport);

    return { id: docRef.id, ...newReport, data: reportData };
  } catch (error) {
    console.error('Ошибка формирования отчета:', error);
    throw error;
  }
};

// Зарплаты
export const getSalaries = () => {
  return [
    { position: 'Директор', salary: 80000 },
    { position: 'Менеджер', salary: 55000 },
    { position: 'Бухгалтер', salary: 50000 },
    { position: 'Мастер цеха', salary: 45000 },
    { position: 'Кладовщик', salary: 35000 }
  ];
};

// Аналитика
export const getSalesAnalytics = async (year) => {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.REPORTS),
        where('year', '==', parseInt(year)),
        orderBy('month', 'asc')
      )
    );

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

    snapshot.docs.forEach(doc => {
      const report = doc.data();
      const data = typeof report.data === 'string' ? JSON.parse(report.data) : report.data;
      const monthIndex = report.month - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyData[monthIndex] = {
          month: report.month,
          monthName: monthNames[monthIndex],
          sold: data.totals.sold,
          profit: data.totals.profit,
          loss: data.totals.loss
        };
      }
    });

    return {
      year: parseInt(year),
      monthlyData
    };
  } catch (error) {
    console.error('Ошибка получения аналитики:', error);
    return { year: parseInt(year), monthlyData: [] };
  }
};


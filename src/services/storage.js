import localStorageModule from './localStorage';

const STORAGE_MODE = process.env.REACT_APP_STORAGE_MODE || 'localStorage';

let storage = localStorageModule.default || localStorageModule;

if (STORAGE_MODE === 'firebase') {
  import('./firebaseStorage').then(firebaseStorageModule => {
    storage = {
      initDefaultData: firebaseStorageModule.initDefaultData,
      login: firebaseStorageModule.login,
      logout: firebaseStorageModule.logout,
      getCurrentUser: firebaseStorageModule.getCurrentUser,
      getProducts: firebaseStorageModule.getProducts,
      getProduct: firebaseStorageModule.getProduct,
      createProduct: firebaseStorageModule.createProduct,
      updateProduct: firebaseStorageModule.updateProduct,
      deleteProduct: firebaseStorageModule.deleteProduct,
      getOperations: firebaseStorageModule.getOperations,
      createOperation: firebaseStorageModule.createOperation,
      getReports: firebaseStorageModule.getReports,
      generateReport: firebaseStorageModule.generateReport,
      getSalaries: firebaseStorageModule.getSalaries,
      getSalesAnalytics: firebaseStorageModule.getSalesAnalytics
    };
  }).catch(err => {
    console.error('Ошибка загрузки Firebase модуля:', err);
  });
}

export default storage;

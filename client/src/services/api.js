import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email, password) => api.post('/users/login', { email, password });

// Users
export const getUsers = (params) => api.get('/users', { params });
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProductByName = (name) => api.get(`/products/${name}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Categories
export const getCategories = (params) => api.get('/categories', { params });
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Customers
export const getCustomers = (params) => api.get('/customers', { params });
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

// Suppliers
export const getSuppliers = (params) => api.get('/suppliers', { params });
export const createSupplier = (data) => api.post('/suppliers', data);
export const updateSupplier = (id, data) => api.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id) => api.delete(`/suppliers/${id}`);

// Transactions
export const getTransactions = (params) => api.get('/transactions', { params });
export const createTransaction = (data) => api.post('/transactions', data);
export const getReturnableTransaction = (id) => api.get(`/transactions/${id}/returnable`);
export const createTransactionReturn = (id, data) => api.post(`/transactions/${id}/returns`, data);

// Cashier shifts
export const getActiveShift = () => api.get('/shifts/active');
export const getShiftHistory = () => api.get('/shifts/history');
export const openShift = (data) => api.post('/shifts/open', data);
export const getCashMovements = (id) => api.get(`/shifts/${id}/movements`);
export const addCashMovement = (id, data) => api.post(`/shifts/${id}/movements`, data);
export const closeShift = (id, data) => api.post(`/shifts/${id}/close`, data);

// Reports
export const getSalesReport = (params) => api.get('/reports/sales', { params });

// Warehouses
export const getWarehouses = (params) => api.get('/warehouse', { params });
export const createWarehouse = (data) => api.post('/warehouse', data);
export const updateWarehouse = (id, data) => api.put(`/warehouse/${id}`, data);
export const deleteWarehouse = (id) => api.delete(`/warehouse/${id}`);

// Stock / Inventory
export const getStocks = (params) => api.get('/stock', { params });
export const createStock = (data) => api.post('/stock', data);
export const updateStock = (id, data) => api.put(`/stock/${id}`, data);
export const deleteStock = (id) => api.delete(`/stock/${id}`);

export const getUnit = (params) => api.get('/unit', { params });
export const createUnit = (data) => api.post('/unit', data);
export const updateUnit = (id, data) => api.put(`/unit/${id}`, data);
export const deleteUnit = (id) => api.delete(`/unit/${id}`);


// Account
export const getAccount = (params) => api.get('/account', { params });
export const createAccount = (data) => api.post('/account', data);
export const updateAccount = (id, data) => api.put(`/account/${id}`, data);
export const deleteAccount = (id) => api.delete(`/account/${id}`);


export default api;
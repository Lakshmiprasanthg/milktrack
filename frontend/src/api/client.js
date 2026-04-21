import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authApi = {
  signup: (data) => apiClient.post('/auth/signup', data),
  login: (data) => apiClient.post('/auth/login', data),
  googleLogin: (data) => apiClient.post('/auth/google', data),
};

// Customer APIs
export const customerApi = {
  getAll: () => apiClient.get('/customers'),
  getById: (id) => apiClient.get(`/customers/${id}`),
  create: (data) => apiClient.post('/customers', data),
  update: (id, data) => apiClient.put(`/customers/${id}`, data),
  delete: (id) => apiClient.delete(`/customers/${id}`),
};

// Delivery APIs
export const deliveryApi = {
  getAll: (params) => apiClient.get('/deliveries', { params }),
  getById: (id) => apiClient.get(`/deliveries/${id}`),
  create: (data) => apiClient.post('/deliveries', data),
  update: (id, data) => apiClient.put(`/deliveries/${id}`, data),
  toggle: (id) => apiClient.patch(`/deliveries/${id}/toggle`),
  delete: (id) => apiClient.delete(`/deliveries/${id}`),
};

// Dashboard APIs
export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats'),
  getTodayDeliveries: () => apiClient.get('/dashboard/today'),
};

// Report APIs
export const reportApi = {
  getMonthlySummary: (month, customerId = null) =>
    apiClient.get('/reports/summary', { params: { month, customerId } }),
  generateBillPdf: (customerId, month) =>
    apiClient.get(`/reports/bill/${customerId}/${month}`, { responseType: 'blob' }),
  generateMonthlyCsv: (month) =>
    apiClient.get(`/reports/export/${month}`, { responseType: 'blob' }),
  getCustomerReport: (customerId, month) =>
    apiClient.get(`/reports/customer/${customerId}/${month}`),
};

export default apiClient;

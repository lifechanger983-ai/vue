import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 300000, // ✅ 60s pour uploads

  // ✅ CRITIQUE - Pas de Content-Type global
  maxContentLength: Infinity,
  maxBodyLength: Infinity
});

// ✅ INTERCEPTEUR FORM DATA - COMME PRODUITS !
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ✅ CRITIQUE : FormData → NO Content-Type !
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];  // ✅ Boundary AUTO !
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
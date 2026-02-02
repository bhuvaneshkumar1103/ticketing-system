import axios from 'axios';

// Create an instance so we don't mess with global axios settings
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthPage = window.location.pathname === '/auth';

    if (error.response && error.response.status === 401 && !isAuthPage) {
      // Only clear and redirect if we aren't already at login
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    
    return Promise.reject(error);
  }
);

// Request Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
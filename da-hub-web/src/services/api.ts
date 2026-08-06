import axios from 'axios';

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return `http://${window.location.hostname}:8080/api`;
};

export const getFileBaseUrl = () => {
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace(/\/api\/?$/, '');
};

export const formatFileUrl = (filePath?: string) => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  const base = getFileBaseUrl();
  const path = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${base}${path}`;
};

export const api = axios.create({
  baseURL: getApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@DAHub:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data && typeof error.response.data === 'object') {
      const data = error.response.data;
      if (data.message && typeof data.message === 'string') {
        error.response.data = data.message;
      } else if (data.error && typeof data.error === 'string') {
        error.response.data = data.error;
      }
    }
    return Promise.reject(error);
  }
);

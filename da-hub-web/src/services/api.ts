import axios from 'axios';

export const api = axios.create({
  baseURL: `http://${window.location.hostname}:8080/api`,
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

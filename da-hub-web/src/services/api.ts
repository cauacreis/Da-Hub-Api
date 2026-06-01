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

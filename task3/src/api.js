import axios from 'axios';

const API = axios.create({
  baseURL: 'https://taskpro-ai-8302.onrender.com',
});

// Token expire pe auto logout
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
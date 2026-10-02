import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7237';

const api = axios.create({
  baseURL: BASE_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // If the backend already returns an object with 'success' property, leave it as is
    if (response.data && typeof response.data.success !== 'undefined') {
      return response;
    }
    // Otherwise wrap it in our ApiResponse format
    response.data = {
      success: true,
      data: response.data,
      message: 'Success'
    };
    return response;
  },
  (error) => {
    // Handle error formatting
    if (error.response && error.response.data) {
      // If the backend returned { message: "..." }
      if (error.response.data.message) {
        error.response.data = {
          success: false,
          message: error.response.data.message,
          data: null
        };
      }
    }

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      alert('السيشن بتاعتك خلصت، من فضلك سجل دخول من تاني عشان تكمل.');
      window.location.href = '/admin/login';
      return new Promise(() => {});
    }

    return Promise.reject(error);
  }
);

export default api;

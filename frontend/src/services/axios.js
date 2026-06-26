import axios from 'axios';
import { toast } from 'react-toastify';

// Base URL untuk API backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - tambahkan Bearer token ke setiap request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle error response
axiosInstance.interceptors.response.use(
  (response) => {
    // Return response data directly
    return response;
  },
  (error) => {
    // Handle different error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - token invalid/expired
          // Hanya handle jika BUKAN request login
          if (!error.config.url.includes('/auth/login')) {
            toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirect to login after short delay
            setTimeout(() => {
              window.location.href = '/login';
            }, 1500);
          }
          break;
          
        case 403:
          // Forbidden - no access rights
          toast.error('Anda tidak memiliki akses untuk melakukan aksi ini.');
          break;
          
        case 404:
          // Not found
          toast.error(data.message || 'Data tidak ditemukan.');
          break;
          
        case 422: {
          // Validation error
          const validationErrors = data.errors || {};
          const errorMessages = Object.values(validationErrors).flat();
          
          if (errorMessages.length > 0) {
            errorMessages.forEach(msg => toast.error(msg));
          } else {
            toast.error(data.message || 'Validasi gagal.');
          }
          break;
        }
          
        case 500:
          // Server error
          toast.error('Terjadi kesalahan pada server. Silakan coba lagi.');
          break;
          
        default:
          toast.error(data.message || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ No response from server:', error.request);
      console.error('Request URL:', error.config?.url);
      console.error('Base URL:', error.config?.baseURL);
      toast.error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } else {
      // Something else happened
      console.error('❌ Request setup error:', error.message);
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

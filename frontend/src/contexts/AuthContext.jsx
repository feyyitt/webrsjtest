/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../services/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user dari localStorage saat aplikasi dimuat
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        username,
        password,
      });

      const { data } = response;

      if (data.success) {
        // Simpan token dan user data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        setUser(data.data.user);
        
        toast.success(`Selamat datang, ${data.data.user.nama}!`);
        
        // Redirect ke dashboard
        navigate('/dashboard');
        
        return { success: true };
      } else {
        toast.error(data.message || 'Login gagal');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Error sudah dihandle oleh axios interceptor
      // Tapi kita return untuk handle di component
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login gagal' 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Optional: Call logout endpoint jika ada
      // await axiosInstance.post('/auth/logout');
      
      // Clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      setUser(null);
      
      toast.success('Anda telah logout');
      
      // Redirect ke login
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      
      // Tetap clear storage meskipun API error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role?.toUpperCase() === role.toUpperCase();
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('ADMIN');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAdmin,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

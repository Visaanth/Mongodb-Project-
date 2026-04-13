// =============================================
// Auth Context - Global Authentication State
// =============================================

import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../api/axios';

// Create Auth Context
const AuthContext = createContext(null);

// Custom hook to easily access auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage (persists across refreshes)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  // Sync user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Login function - calls backend, stores token and user
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (formData) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', formData);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function - clears all stored data
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update user state (after profile edit)
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

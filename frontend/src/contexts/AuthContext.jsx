import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/apiClient';

// THIS IS THE PLACE TO MANAGE USER'S LOGIN STATE
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    // If a token exists, add it to all future API request headers
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await apiClient.post('/login', { email, password });
    setUser(response.data.user);
    setToken(response.data.token);
    return response.data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };
  
  const value = { user, token, isAuthenticated: !!token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};
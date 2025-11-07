import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/apiClient';

// THIS IS THE PLACE TO MANAGE USER'S LOGIN STATE
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Get token from local storage
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        // Set the token for all future API calls
        setToken(storedToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        try {
          // Fetch user profile using the token
          const response = await apiClient.get('/user');
          setUser(response.data.data);
        } catch (error) {
          // If the token is invalid (e.g., expired), clear it
          console.error("Invalid token, logging out.", error);
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
        }
      }
      // Finished checking
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await apiClient.post('/login', { email, password });
    const { user: userData, token: userToken } = response.data;

    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${userToken}`; // Include credentials for all subsequent requests

    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const setAuthData = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };
  
  const value = { user, token, isAuthenticated: !!token, loading, login, logout, setAuthData };

  // Render after finish loading
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};
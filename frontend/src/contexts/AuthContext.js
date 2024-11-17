// src/contexts/AuthContext.js

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const API_URL = useMemo(() => {
    const url = process.env.REACT_APP_API_URL || 'https://hiraya.amihan.net';
    return url.replace(/\/+$/, '');
  }, []);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('token', token);
        setError(null);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch user:', errorData);
        localStorage.removeItem('token');
        setUser(null);
        setError(errorData.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setUser(null);
      setError('Network error while authenticating');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');
    
    if (token) {
      fetchUser(token);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      setError(params.get('message') || 'Authentication failed');
      setLoading(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [fetchUser]);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetchUser(token);
    }
  }, [fetchUser]);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    logout,
    clearError,
    refreshUser,
    isAuthenticated: !!user,
    apiUrl: API_URL
  }), [user, loading, error, API_URL, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
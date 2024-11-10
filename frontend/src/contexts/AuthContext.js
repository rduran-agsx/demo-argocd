// src/contexts/AuthContext.js

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const API_URL = useMemo(() => {
    // Get URL from environment variable
    const url = process.env.REACT_APP_API_URL || 'https://hiraya.amihan.net';
    // Remove any trailing slashes
    return url.replace(/\/+$/, '');
  }, []);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async (token) => {
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
  };

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Check URL for token or error parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');
    
    if (token) {
      fetchUser(token);
      // Clean up URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      setError(params.get('message') || 'Authentication failed');
      setLoading(false);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetchUser(token);
    }
  };

  const value = useMemo(() => ({
    user,
    loading,
    error,
    logout,
    clearError,
    refreshUser,
    isAuthenticated: !!user,
    apiUrl: API_URL
  }), [user, loading, error, API_URL]);

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
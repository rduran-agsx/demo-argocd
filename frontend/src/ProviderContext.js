// src/contexts/ProviderContext.js

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchWithAuth } from './utils/api';

const ProviderContext = createContext();

export const ProviderProvider = ({ children }) => {
  const API_URL = useMemo(() => {
    return process.env.REACT_APP_API_URL || 'https://hiraya.amihan.net';
  }, []);

  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProviders = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`${API_URL}/api/providers?page=${page}&per_page=10`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data && Array.isArray(data.providers)) {
        setProviders(prevProviders => [...prevProviders, ...data.providers]);
        setTotalPages(data.pages || 1);
        setCurrentPage(data.current_page || 1);
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const loadMoreProviders = useCallback(() => {
    if (currentPage < totalPages && !isLoading) {
      fetchProviders(currentPage + 1);
    }
  }, [currentPage, totalPages, isLoading, fetchProviders]);

  const value = useMemo(() => ({
    providers: providers || [],
    isLoading,
    error,
    loadMoreProviders,
    hasMore: currentPage < totalPages,
    refetch: () => fetchProviders(1),
  }), [providers, isLoading, error, loadMoreProviders, currentPage, totalPages, fetchProviders]);

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  );
};

export const useProviders = () => {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error('useProviders must be used within a ProviderProvider');
  }
  return context;
};
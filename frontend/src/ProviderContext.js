import React, { createContext, useContext, useState, useEffect } from 'react';

const ProviderContext = createContext();

export const ProviderProvider = ({ children }) => {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProviders = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/providers?page=${page}&per_page=10`);
      const data = await response.json();
      setProviders(prevProviders => [...prevProviders, ...data.providers]);
      setTotalPages(data.pages);
      setCurrentPage(data.current_page);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const loadMoreProviders = () => {
    if (currentPage < totalPages) {
      fetchProviders(currentPage + 1);
    }
  };

  return (
    <ProviderContext.Provider value={{ providers, isLoading, loadMoreProviders, hasMore: currentPage < totalPages }}>
      {children}
    </ProviderContext.Provider>
  );
};

export const useProviders = () => useContext(ProviderContext);
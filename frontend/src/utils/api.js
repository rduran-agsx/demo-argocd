// src/utils/api.js

export const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    // Only add Authorization header if we have a token
    ...(localStorage.getItem('token') && {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    })
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });
    
    // Handle 401 Unauthorized globally
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
      return;
    }
    
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
const API_BASE_URL = 'https://yadegar-api.duster.ir';

export const api = {
  // Auth endpoints
  auth: {
    register: async (username, password) => {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      return response.json();
    },
    
    login: async (username, password) => {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      return response.json();
    },
    
    logout: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // Clear local storage regardless of response
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (!response.ok) {
        console.warn('Logout API call failed, but local session cleared');
      }
    },
  },
};

// Helper to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};
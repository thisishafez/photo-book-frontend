import { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.auth.login(username, password);
      
      // Store token and user
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await api.auth.register(username, email, password);
      return { success: true, user: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    /*try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } */
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading,
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
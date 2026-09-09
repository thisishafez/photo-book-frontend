import { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';
import { isTokenExpired, decodeToken } from '../utils/jwt';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser && !isTokenExpired(token)) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    } else if (token) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.auth.login(email, password);
      // response = { access_token, refresh_token } only

      const claims = decodeToken(response.access_token);
      const user = {
        id: claims?.sub ?? null,
        email,
        accountType: claims?.account_type ?? null,
      };

      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // accountType: 'user' | 'host' | 'moderator'
  const register = async (email, password, accountType = 'user') => {
    try {
      const response = await api.auth.register(email, password, accountType);
      // response = { id, email } — registration does NOT log you in
      return { success: true, user: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
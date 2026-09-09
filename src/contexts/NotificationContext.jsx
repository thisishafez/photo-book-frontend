import { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { getUserProfile } from '../utils/userCache';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadIncoming = async () => {
    try {
      const requests = await api.circle.getIncomingRequests();
      const enriched = await Promise.all(
        requests.map(async (req) => {
          const profile = await getUserProfile(req.RequesterID);
          return { ...req, requesterName: profile.display_name, requesterHandle: profile.handle };
        })
      );
      setIncomingRequests(enriched);
    } catch (error) {
      console.error('[Notifications] Failed to load circle requests', error);
      setIncomingRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setIncomingRequests([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    loadIncoming();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(loadIncoming, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const unreadCount = incomingRequests.length;

  const acceptRequest = async (requestId) => {
    await api.circle.acceptRequest(requestId);
    setIncomingRequests(prev => prev.filter(r => r.ID !== requestId));
  };

  const declineRequest = async (requestId) => {
    await api.circle.declineRequest(requestId);
    setIncomingRequests(prev => prev.filter(r => r.ID !== requestId));
  };

  return (
    <NotificationContext.Provider value={{
      incomingRequests, isLoading, unreadCount, acceptRequest, declineRequest, refresh: loadIncoming,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
}
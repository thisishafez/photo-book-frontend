import { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { getUserProfile } from '../utils/userCache';

const NotificationContext = createContext();

// Types where ActorID is a system action (equals RecipientID), not a
// person — never fetch/show an actor name for these.
const SYSTEM_TYPES = new Set(['upload_window_opened', 'badge_earned']);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
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
    }
  };

  const loadNotifications = async () => {
    try {
      const list = await api.notifications.getNotifications(50);
      const enriched = await Promise.all(
        list.map(async (n) => {
          if (SYSTEM_TYPES.has(n.Type) || n.ActorID === n.RecipientID) {
            return { ...n, actorName: null, actorHandle: null };
          }
          try {
            const profile = await getUserProfile(n.ActorID);
            return { ...n, actorName: profile.display_name, actorHandle: profile.handle };
          } catch {
            return { ...n, actorName: null, actorHandle: null };
          }
        })
      );
      setNotifications(enriched);
    } catch (error) {
      console.error('[Notifications] Failed to load notifications', error);
      setNotifications([]);
    }
  };

  const loadAll = async () => {
    await Promise.all([loadIncoming(), loadNotifications()]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setIncomingRequests([]);
      setNotifications([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    loadAll();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(loadAll, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Delivery is async (queue -> worker), so right after triggering an
  // action that should produce a notification, call this to poll a
  // few times with a short delay instead of expecting it immediately.
  const pollForNewNotification = async (attempts = 4, delayMs = 1000) => {
    for (let i = 0; i < attempts; i++) {
      await new Promise((res) => setTimeout(res, delayMs));
      await loadNotifications();
    }
  };

  const unreadCount =
    incomingRequests.length + notifications.filter((n) => !n.ReadAt).length;

  const acceptRequest = async (requestId) => {
    await api.circle.acceptRequest(requestId);
    setIncomingRequests(prev => prev.filter(r => r.ID !== requestId));
  };

  const declineRequest = async (requestId) => {
    await api.circle.declineRequest(requestId);
    setIncomingRequests(prev => prev.filter(r => r.ID !== requestId));
  };

  const markNotificationRead = async (id) => {
    // Optimistic update — the endpoint always returns 200 regardless
    // of whether the id was valid, so there's nothing useful to
    // reconcile against in the response.
    setNotifications(prev =>
      prev.map(n => (n.ID === id ? { ...n, ReadAt: new Date().toISOString() } : n))
    );
    try {
      await api.notifications.markRead(id);
    } catch (error) {
      console.error('[Notifications] Failed to mark read', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      incomingRequests, notifications, isLoading, unreadCount,
      acceptRequest, declineRequest, markNotificationRead,
      refresh: loadAll, pollForNewNotification,
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
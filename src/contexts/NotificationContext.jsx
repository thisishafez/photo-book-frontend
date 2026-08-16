import { createContext, useState, useContext, useEffect } from 'react';

const NotificationContext = createContext();

// Mock notifications data
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'tag_request',
    event_id: '1',
    event_name: 'Summer Beach Party 2026',
    from_user: 'alice',
    read: false,
    created_at: '2026-08-10T15:35:00Z'
  },
  {
    id: '2',
    type: 'tag_request',
    event_id: '2',
    event_name: 'Birthday Celebration',
    from_user: 'bob',
    read: false,
    created_at: '2026-08-09T10:20:00Z'
  },
  {
    id: '3',
    type: 'tag_rejected',
    event_id: '3',
    event_name: 'Weekend Hiking Trip',
    from_user: 'diana',
    read: false,
    created_at: '2026-08-08T18:45:00Z'
  },
  {
    id: '4',
    type: 'tag_request',
    event_id: '4',
    event_name: 'Movie Night',
    from_user: 'charlie',
    read: true,
    created_at: '2026-08-05T14:00:00Z'
  },
  {
    id: '5',
    type: 'tag_rejected',
    event_id: '5',
    event_name: 'Coffee Shop Meetup',
    from_user: 'eve',
    read: true,
    created_at: '2026-08-03T09:15:00Z'
  }
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notifications on mount
  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setNotifications(MOCK_NOTIFICATIONS);
      setIsLoading(false);
    };
    loadNotifications();
  }, []);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark a single notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  // Remove a notification (after approve/reject)
  const removeNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  // Add a notification (for future API integration)
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      isLoading,
      unreadCount,
      markAsRead,
      markAllAsRead,
      removeNotification,
      addNotification,
      setNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
import { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notifications on mount
  useEffect(() => {

  const loadNotifications = async () => {

    setIsLoading(true);

    // Simulate API call

    const loadNotifications = async () => {

      try {

        setIsLoading(true);

        const response = await api.notifications.getNotifications();

        setNotifications(response.results || []);

      } catch(error){

        console.error(
          '[Notifications] Failed:',
          error
        );

        setNotifications([]);

      }
      finally{

        setIsLoading(false);

      }

    };

    setIsLoading(false);

  };

  loadNotifications();

}, []);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark a single notification as read
  const markAsRead = async(notificationId)=>{

  try{

    await api.notifications.markAsRead(notificationId);


    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
        ?
        {...notif, read:true}
        :
        notif
      )
    );


  }catch(error){

    console.error(
      '[Notifications] Read failed',
      error
    );

  }

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
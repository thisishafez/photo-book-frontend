import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notifications on mount
  useEffect(() => {


  if (!isAuthenticated) {

    setNotifications([]);
    setIsLoading(false);

    return;

  }


  const loadNotifications = async () => {

    try {

      setIsLoading(true);

      const response =
        await api.notifications.getNotifications();


      console.log(
        "[Notifications] Loaded:",
        response
      );


      setNotifications(
        response.results || []
      );


    } catch(error){

      console.error(
        "[Notifications] Failed:",
        error
      );


      setNotifications([]);


    } finally {

      setIsLoading(false);

    }

  };


  loadNotifications();


}, [isAuthenticated]);

useEffect(() => {


  if (!isAuthenticated) return;


  const interval = setInterval(async()=>{


    try {


      const response =
        await api.notifications.getNotifications();


      setNotifications(
        response.results || []
      );


    } catch(error){


      console.error(
        "[Notifications] Poll failed",
        error
      );


    }


  }, 30000);


  return () => clearInterval(interval);


}, [isAuthenticated]);

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
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';
import Navbar from '../../components/Navbar/Navbar';
import { useNotifications } from '../../contexts/NotificationContext';

export default function Notifications() {
  const navigate = useNavigate();
  const { 
    notifications, 
    isLoading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useNotifications();
  const [processingId, setProcessingId] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleApprove = async(
 notificationId,
 memberId
)=>{

 try{

 setProcessingId(notificationId);


 await api.notifications.approveMember(memberId);


 removeNotification(notificationId);


 }catch(error){

 console.error(
 '[Notifications] Approve failed',
 error
 );

 }
 finally{

 setProcessingId(null);

 }

};

  const handleReject = async(
 notificationId,
 memberId
)=>{


try{

setProcessingId(notificationId);


await api.notifications.rejectMember(memberId);


removeNotification(notificationId);


}catch(error){

console.error(error);

}
finally{

setProcessingId(null);

}


};

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // If within 24 hours, show relative time
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Otherwise show formatted date
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const getNotificationMessage = (notification) => {
    if (notification.type === 'tag_request') {
      return (
        <>
          <span className="notif-highlight">{notification.from_user}</span>
          {' tagged you in '}
          <span className="notif-highlight">"{notification.event_name}"</span>
        </>
      );
    } else {
      return (
        <>
          <span className="notif-highlight">{notification.from_user}</span>
          {' rejected your tag in '}
          <span className="notif-highlight">"{notification.event_name}"</span>
        </>
      );
    }
  };

  const getNotificationIcon = (type) => {
    return type === 'tag_request' ? '📩' : '✕';
  };

  const LoadingSkeleton = () => (
    <div className="notifications-skeleton">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="notification-skeleton-item">
          <div className="skeleton-icon"></div>
          <div className="skeleton-content">
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
            <div className="skeleton-actions">
              <div className="skeleton-btn"></div>
              <div className="skeleton-btn"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="notifications-empty">
      <div className="empty-icon">🔔</div>
      <h3>All caught up!</h3>
      <p>You have no notifications at the moment.</p>
      <p className="empty-sub">When someone tags you, you'll see it here.</p>
    </div>
  );

  return (
    <div className="notifications-page">
      <Navbar onLogout={handleLogout} unreadCount={unreadCount} />

      <main className="notifications-main">
        <div className="notifications-container">
          {/* Header */}
          <div className="notifications-header">
            <div className="header-left">
              <h1 className="notifications-title">Notifications</h1>
              <p className="notifications-subtitle">
                {unreadCount} unread
              </p>
            </div>
            {notifications.length > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification List */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : notifications.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="notifications-list">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-message">
                      {getNotificationMessage(notification)}
                    </div>
                    <div className="notification-meta">
                      <span className="notification-date">
                        {formatDate(notification.created_at)}
                      </span>
                      {!notification.read && (
                        <span className="unread-dot">●</span>
                      )}
                    </div>
                    
                    {/* Actions for tag requests */}
                    {notification.type === 'tag_request' && (
                      <div className="notification-actions">
                        <button 
                          className="action-btn approve"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(notification.id,  notification.event_member_id);
                          }}
                          disabled={processingId === notification.id}
                        >
                          {processingId === notification.id ? 'Processing...' : '✓ Approve'}
                        </button>
                        <button 
                          className="action-btn reject"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(notification.id,  notification.event_member_id);
                          }}
                          disabled={processingId === notification.id}
                        >
                          {processingId === notification.id ? 'Processing...' : '✕ Decline'}
                        </button>
                      </div>
                    )}
                    
                    {/* Rejected tag message */}
                    {notification.type === 'tag_rejected' && (
                      <div className="notification-rejected">
                        <span className="rejected-label">Tag declined</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
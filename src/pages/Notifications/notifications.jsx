import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Notifications.css';

export default function Notifications() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { incomingRequests, isLoading, unreadCount, acceptRequest, declineRequest } = useNotifications();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className={`notifications-page${darkMode ? ' notifications-page-dark' : ''}`}>
      <Navbar onLogout={handleLogout} unreadCount={unreadCount} />
      <main className="notifications-main">
        <div className="notifications-container">
          <div className="notifications-header">
            <h1 className="notifications-title">Friend Requests</h1>
            <p className="notifications-subtitle">{unreadCount} pending</p>
          </div>

          {isLoading ? (
            <p>Loading...</p>
          ) : incomingRequests.length === 0 ? (
            <div className="notifications-empty">
              <div className="empty-icon">🔔</div>
              <h3>All caught up!</h3>
              <p>No pending friend requests.</p>
            </div>
          ) : (
            <div className="notifications-list">
              {incomingRequests.map(req => (
                <div key={req.ID} className="notification-item unread">
                  <div className="notification-icon">📩</div>
                  <div className="notification-content">
                    <div className="notification-message">
                      <span className="notif-highlight">{req.requesterName || req.requesterHandle}</span>
                      {' wants to connect'}
                    </div>
                    <div className="notification-actions">
                      <button className="action-btn approve" onClick={() => acceptRequest(req.ID)}>✓ Accept</button>
                      <button className="action-btn reject" onClick={() => declineRequest(req.ID)}>✕ Decline</button>
                    </div>
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
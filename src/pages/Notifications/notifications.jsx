import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Notifications.css';

const ICONS = {
  hangout_invite: '📅',
  hangout_invite_responded: '↩️',
  hangout_cancelled: '🚫',
  meetup_pin_proposed: '📍',
  meetup_pin_changed: '📍',
  meetup_pin_confirmed: '✅',
  upload_window_opened: '📸',
  activity_approved: '🎉',
  activity_rejected: '⚠️',
  comment_approved: '💬',
  comment_rejected: '⚠️',
  badge_earned: '🏅',
};

function describe(n) {
  const who = n.actorName || n.actorHandle || 'Someone';
  switch (n.Type) {
    case 'hangout_invite':
      return `${who} invited you to a hangout`;
    case 'hangout_invite_responded':
      return `${who} responded to your hangout invite`;
    case 'hangout_cancelled':
      return `${who} cancelled a hangout`;
    case 'meetup_pin_proposed':
      return `${who} proposed a meetup spot`;
    case 'meetup_pin_changed':
      return `${who} changed the meetup spot`;
    case 'meetup_pin_confirmed':
      return `${who} confirmed the meetup spot`;
    case 'upload_window_opened':
      return `Photo/video uploads are now open for a hangout`;
    case 'activity_approved':
      return `Your activity "${n.Metadata?.activity_title || ''}" was approved`;
    case 'activity_rejected':
      return `Your activity "${n.Metadata?.activity_title || ''}" was rejected${n.Metadata?.reason ? `: ${n.Metadata.reason}` : ''}`;
    case 'comment_approved':
      return `Your comment was approved`;
    case 'comment_rejected':
      return `Your comment was rejected`;
    case 'badge_earned':
      return `You earned the "${n.Metadata?.name || ''}" badge`;
    default:
      // Unrecognized types are safe to show generically.
      return 'New notification';
  }
}

export default function Notifications() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const {
    incomingRequests, notifications, isLoading, unreadCount,
    acceptRequest, declineRequest, markNotificationRead,
  } = useNotifications();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className={`notifications-page${darkMode ? ' notifications-page-dark kh-dark' : ''}`}>
      <Navbar onLogout={handleLogout} unreadCount={unreadCount} />
      <main className="notifications-main">
        <div className="notifications-container">

          <div className="notifications-header">
            <h1 className="notifications-title">Friend Requests</h1>
            <p className="notifications-subtitle">{incomingRequests.length} pending</p>
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

          <div className="notifications-header" style={{ marginTop: '2rem' }}>
            <h1 className="notifications-title">Notifications</h1>
            <p className="notifications-subtitle">
              {notifications.filter(n => !n.ReadAt).length} unread
            </p>
          </div>

          {isLoading ? (
            <p>Loading...</p>
          ) : notifications.length === 0 ? (
            <div className="notifications-empty">
              <div className="empty-icon">🔔</div>
              <h3>Nothing yet</h3>
              <p>You're all caught up.</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map(n => (
                <div
                  key={n.ID}
                  className={`notification-item${n.ReadAt ? '' : ' unread'}`}
                  onClick={() => !n.ReadAt && markNotificationRead(n.ID)}
                  style={{ cursor: n.ReadAt ? 'default' : 'pointer' }}
                >
                  <div className="notification-icon">{ICONS[n.Type] || '🔔'}</div>
                  <div className="notification-content">
                    <div className="notification-message">{describe(n)}</div>
                    <div className="notification-time">
                      {new Date(n.CreatedAt).toLocaleString()}
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
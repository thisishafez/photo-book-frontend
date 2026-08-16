import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Navbar.css';
import logo from '../../assets/Group 3 (1).svg';
import notificationEmpty from '../../assets/notification-empty.svg';
import notificationFull from '../../assets/notification-full.svg';
import galleryIcon from '../../assets/gallery.svg';

export default function Navbar({ onLogout, unreadCount = 0 }) {
  const navigate = useNavigate();
  const [hasUnread, setHasUnread] = useState(unreadCount > 0);

  useEffect(() => {
    setHasUnread(unreadCount > 0);
  }, [unreadCount]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="Shared Event Photo Book" className="navbar-logo" />
          <span className="navbar-title">Photo Book</span>
        </Link>

        <div className="navbar-right">
          {/* Gallery Navigation */}
          <Link to="/" className="navbar-nav-link">
            <img src={galleryIcon} alt="Gallery" className="nav-icon" />
            <span className="nav-label">Gallery</span>
          </Link>

          {/* Notifications */}
          <Link to="/notifications" className="navbar-nav-link notifications-link">
            <div className="notification-icon-wrapper">
              <img 
                src={hasUnread ? notificationFull : notificationEmpty} 
                alt="Notifications" 
                className="nav-icon notification-icon"
              />
              {hasUnread && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div>
            <span className="nav-label">Notifications</span>
          </Link>

          {/* Logout */}
          <button onClick={handleLogout} className="navbar-logout">
            Leave
          </button>
        </div>
      </div>
    </nav>
  );
}
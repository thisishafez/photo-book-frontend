import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Navbar.css';

import logo from '../../assets/logo.svg';
import logoDarkMode from '../../assets/logoDarkMode.svg';
import notificationEmpty from '../../assets/notification-empty.svg';
import notificationFull from '../../assets/notification-full.svg';
import galleryIcon from '../../assets/gallery.svg';

const NAV_LINKS = {
  user: [
    { key: 'home', to: '/', label: 'Home', icon: galleryIcon },
    { key: 'archive', to: '/archives', label: 'Archive' },
    { key: 'circle', to: '/circle', label: 'Circle' },
    { key: 'hangouts', to: '/hangouts', label: 'Hangouts' },
    { key: 'profile', to: '/profile', label: 'Profile' },
  ],
  host: [
    { key: 'dashboard', to: '/host/dashboard', label: 'Dashboard' },
    { key: 'home', to: '/', label: 'Home', icon: galleryIcon },
    { key: 'profile', to: '/profile', label: 'Profile' },
  ],
  moderator: [
    { key: 'home', to: '/', label: 'Home', icon: galleryIcon },
    { key: 'profile', to: '/profile', label: 'Profile' },
  ],
};

export default function Navbar({ unreadCount = 0 }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  const navLinks = NAV_LINKS[user?.accountType] ?? [];

  const [hasUnread, setHasUnread] = useState(unreadCount > 0);

  useEffect(() => {
    setHasUnread(unreadCount > 0);
  }, [unreadCount]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className={`navbar${darkMode ? ' navbar-dark' : ''}`}>
      <div className="navbar-container">

        <Link to="/" className="navbar-brand">
          <img
            src={darkMode ? logoDarkMode : logo}
            alt="Shared Event Photo Book"
            className="navbar-logo"
          />
          <span className="navbar-title">
            Photo Book
          </span>
        </Link>


        <div className="navbar-right">

          {navLinks.map((link) => (
            <Link key={link.key} to={link.to} className="navbar-nav-link">
              {link.icon && (
                <img
                  src={link.icon}
                  alt={link.label}
                  className="nav-icon"
                />
              )}
              <span className="nav-label">
                {link.label}
              </span>
            </Link>
          ))}


          {/* Notifications */}
          <Link
            to="/notifications"
            className="navbar-nav-link notifications-link"
          >
            <div className="notification-icon-wrapper">
              <img
                src={hasUnread ? notificationFull : notificationEmpty}
                alt="Notifications"
                className="nav-icon notification-icon"
              />

              {hasUnread && (
                <span className="notification-badge">
                  {unreadCount}
                </span>
              )}
            </div>

            <span className="nav-label">
              Notifications
            </span>
          </Link>


          {/* User info */}
          {user && (
            <span className="navbar-username">
              {user.username}
            </span>
          )}


          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="navbar-theme-toggle"
            aria-label="Toggle dark mode"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              // Sun icon
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="2"
                />

                <path
                  d="M12 2V4M12 20V22M4 12H2M22 12H20M19.07 4.93L17.66 6.34M6.34 17.66L4.93 19.07M19.07 19.07L17.66 17.66M6.34 6.34L4.93 4.93"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              // Moon icon
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>


          {/* Logout */}
          <button
            onClick={handleLogout}
            className="navbar-logout"
          >
            Leave
          </button>

        </div>
      </div>
    </nav>
  );
}
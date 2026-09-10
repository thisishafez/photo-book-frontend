import { useEffect, useState } from 'react';

import Navbar from '../../components/Navbar/Navbar';

import {
  useNotifications
} from '../../contexts/NotificationContext';

import {
  useTheme
} from '../../contexts/ThemeContext';

import {
  useAuth
} from '../../contexts/AuthContext';

import {
  getUserProfile
} from '../../utils/userCache';

import UserHome from './UserHome';
import HostHome from './HostHome';
import ModeratorHome from './ModeratorHome';

import './Home.css';

export default function Home() {
  const {
    unreadCount
  } = useNotifications();

  const {
    darkMode
  } = useTheme();

  const {
    user
  } = useAuth();

  // AuthContext's user object only carries id/email/accountType —
  // there's no username. Look up the real profile once, the same
  // way ChatBox/MeetupPin/ActivityModeration already do, instead of
  // showing "Hello, undefined" like the old greeting did.
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    getUserProfile(user.id).then((profile) => {
      if (cancelled) return;

      setDisplayName(
        profile?.display_name || profile?.handle || ''
      );
    });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const viewer = {
    ...user,
    displayName: displayName || user?.email || '',
  };

  const renderHome = () => {
    switch (user?.accountType) {
      case 'host':
        return <HostHome user={viewer} />;

      case 'moderator':
        return <ModeratorHome user={viewer} />;

      case 'user':
      default:
        return <UserHome user={viewer} />;
    }
  };

  return (
    <div
      className={`home-page ${darkMode ? 'home-dark' : ''}`}
    >
      <Navbar unreadCount={unreadCount} />

      <main className="home-main">
        <div className="home-container">
          {renderHome()}
        </div>
      </main>
    </div>
  );
}

import {
  useEffect,
  useState
} from 'react';

import {
  useNavigate
} from 'react-router-dom';

import Navbar from '../../components/Navbar/Navbar';
import ActivityCard from '../../components/ActivityCard/ActivityCard';

import {
  useNotifications
} from '../../contexts/NotificationContext';

import {
  useTheme
} from '../../contexts/ThemeContext';

import {
  api
} from '../../services/api';

import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  const {
    unreadCount
  } = useNotifications();

  const {
    darkMode
  } = useTheme();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const user =
    JSON.parse(localStorage.getItem('user')) || {
      username: 'User'
    };

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);

      const response = await api.activities.list();

      setActivities(response || []);
    } catch (error) {
      console.error(
        '[Home] Failed loading activities',
        error
      );

      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/login');
  };

  return (
    <div
      className={`home-page ${darkMode ? 'home-dark' : ''}`}
    >
      <Navbar
        onLogout={handleLogout}
        unreadCount={unreadCount}
      />

      <main className="home-main">
        <div className="home-container">

          <h1>
            Hello, {user.username} 👋
          </h1>

          <p className="home-subtitle">
            Discover activities you'll enjoy
          </p>

          <section>
            <h2>
              All Activities
            </h2>

            {loading ? (
              <p>
                Loading activities...
              </p>
            ) : activities.length === 0 ? (
              <p>
                No activities available yet.
              </p>
            ) : (
              <div className="activity-grid">
                {activities.map((activity) => (
                  <ActivityCard
                    key={activity.ID}

                    title={activity.Title}

                    description={
                      activity.Description
                    }

                    category={
                      activity.SourceType
                    }

                    onClick={() =>
                      navigate(
                        `/activity/${activity.ID}`
                      )
                    }
                  />
                ))}
              </div>
            )}
          </section>

          <button
            className="create-activity-btn"
            onClick={() =>
              navigate('/create-activity')
            }
          >
            + Create Activity
          </button>

        </div>
      </main>
    </div>
  );
}

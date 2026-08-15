import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Gallery.css';
import Navbar from '../../components/Navbar/Navbar';
import EventCard from '../../components/EventCard/EventCard';

// Mock data for demonstration
const MOCK_EVENTS = [
  {
    id: '1',
    name: 'Summer Beach Party 2026',
    photo_count: 8,
    approved_at: '2026-08-10T15:30:00Z'
  },
  {
    id: '2',
    name: 'Birthday Celebration',
    photo_count: 5,
    approved_at: '2026-08-08T20:15:00Z'
  },
  {
    id: '3',
    name: 'Weekend Hiking Trip',
    photo_count: 10,
    approved_at: '2026-08-05T10:00:00Z'
  },
  {
    id: '4',
    name: 'Movie Night',
    photo_count: 3,
    approved_at: '2026-08-01T22:30:00Z'
  },
  {
    id: '5',
    name: 'Coffee Shop Meetup',
    photo_count: 6,
    approved_at: '2026-07-28T14:00:00Z'
  }
];

export default function Gallery() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1200));
      setEvents(MOCK_EVENTS);
      setFilteredEvents(MOCK_EVENTS);
      setIsLoading(false);
    };

    loadEvents();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEvents(events);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = events.filter(event =>
        event.name.toLowerCase().includes(query)
      );
      setFilteredEvents(filtered);
    }
  }, [searchQuery, events]);

  const handleCreateEvent = async () => {
    setIsCreating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsCreating(false);
    alert('Create Event functionality will be implemented soon!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const LoadingSkeleton = () => (
    <div className="event-grid">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="event-card-skeleton">
          <div className="skeleton-thumbnail"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-date"></div>
            <div className="skeleton-divider"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="empty-state">
      <div className="empty-state-icon">📔</div>
      <h3>No memories yet</h3>
      <p>Create your first event to start collecting photographs.</p>
      <p className="empty-state-sub">Every story begins with a single picture.</p>
    </div>
  );

  return (
    <div className="gallery-page">
      <Navbar onLogout={handleLogout} />

      <main className="gallery-main">
        <div className="gallery-container">
          {/* Header Section */}
          <div className="gallery-header">
            <div className="gallery-header-left">
              <h1 className="gallery-title">Photographs</h1>
              <p className="gallery-subtitle">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'collection' : 'collections'}
              </p>
            </div>

            <button 
              className="create-event-btn"
              onClick={handleCreateEvent}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : '+ New Collection'}
            </button>
          </div>

          {/* Search Bar */}
          <div className="gallery-search">
            <input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
              disabled={isLoading}
            />
          </div>

          {/* Content */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : filteredEvents.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="event-grid">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Gallery.css';
import Navbar from '../../components/Navbar/Navbar';
import EventCard from '../../components/EventCard/EventCard';
import CreateEventModal from '../../components/CreateEventModal/CreateEventModal';
import { useNotifications } from '../../contexts/NotificationContext';
import { api } from '../../services/api';

export default function Gallery() {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  console.log('[Gallery] Component mounted');
  console.log('[Gallery] Initial state:', {
    eventsCount: events.length,
    filteredCount: filteredEvents.length,
    searchQuery,
    isLoading,
    error,
    showCreateModal
  });

  // Load gallery events
  useEffect(() => {
    console.log('[Gallery] useEffect - Loading gallery on mount');
    loadGalleryEvents();
  }, []);

  const loadGalleryEvents = async () => {
    console.log('[Gallery] loadGalleryEvents started');
    console.log('[Gallery] Current token:', localStorage.getItem('token') ? 'Present' : 'Missing');
    
    try {
      setIsLoading(true);
      setError(null);
      console.log('[Gallery] Setting loading state to true');
      
      console.log('[Gallery] Calling api.gallery.getEvents()...');
      const response = await api.gallery.getEvents();
      console.log('[Gallery] Received response from API:', response);
      
      const eventsData = response.events || [];
      console.log(`[Gallery] Processing ${eventsData.length} events`);
      console.log('[Gallery] Events data sample:', eventsData.slice(0, 2));
      
      setEvents(eventsData);
      setFilteredEvents(eventsData);
      console.log('[Gallery] State updated with events');
      
      if (eventsData.length === 0) {
        console.log('[Gallery] No events found in gallery');
      }
    } catch (err) {
      console.error('[Gallery] Error in loadGalleryEvents:', err);
      console.error('[Gallery] Error details:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
      setError(err.message || 'Failed to load gallery. Please try again.');
      setEvents([]);
      setFilteredEvents([]);
      console.log('[Gallery] Set error state and cleared events');
    } finally {
      setIsLoading(false);
      console.log('[Gallery] loadGalleryEvents completed, loading set to false');
    }
  };

  // Handle search with debounce
  useEffect(() => {
    console.log('[Gallery] Search effect triggered with query:', searchQuery);
    
    const searchTimeout = setTimeout(async () => {
      console.log('[Gallery] Debounce timer completed for search:', searchQuery);
      
      if (searchQuery.trim() === '') {
        console.log('[Gallery] Search query empty, reloading full gallery');
        if (searchQuery === '') {
          await loadGalleryEvents();
        }
        return;
      }

      try {
        setIsSearching(true);
        setError(null);
        console.log('[Gallery] Setting isSearching to true');
        console.log('[Gallery] Calling api.gallery.searchEvents() with:', searchQuery);
        
        const response = await api.gallery.searchEvents(searchQuery);
        console.log('[Gallery] Search response received:', response);
        
        const searchResults = response.events || [];
        console.log(`[Gallery] Search found ${searchResults.length} results for "${searchQuery}"`);
        console.log('[Gallery] Search results sample:', searchResults.slice(0, 2));
        
        setFilteredEvents(searchResults);
        console.log('[Gallery] Updated filtered events with search results');
      } catch (err) {
        console.error('[Gallery] Error in search:', err);
        console.error('[Gallery] Search error details:', {
          message: err.message,
          stack: err.stack,
          searchQuery: searchQuery,
          timestamp: new Date().toISOString()
        });
        setError(err.message || 'Search failed. Please try again.');
        console.log('[Gallery] Set search error state');
      } finally {
        setIsSearching(false);
        console.log('[Gallery] Search completed, isSearching set to false');
      }
    }, 500);

    return () => {
      console.log('[Gallery] Clearing search timeout for:', searchQuery);
      clearTimeout(searchTimeout);
    };
  }, [searchQuery]);

  const handleCreateEvent = async (eventData) => {
  console.log('[Gallery] Event already created:', eventData);
  console.log('[Gallery] Event ID:', eventData.id);
  console.log('[Gallery] Photos:', eventData.photos?.length || 0);
  console.log('[Gallery] Tagged users:', eventData.taggedUsers?.length || 0);

  try {
    setIsCreating(true);
    setError(null);

    const successMessage =
      `Collection "${eventData.name}" created with ` +
      `${eventData.photos?.length || 0} photos and ` +
      `${eventData.taggedUsers?.length || 0} tagged users!`;

    console.log('[Gallery] Success:', successMessage);

    alert(successMessage);

    console.log('[Gallery] Closing create modal');
    setShowCreateModal(false);

    console.log('[Gallery] Reloading gallery');
    await loadGalleryEvents();

    console.log('[Gallery] Gallery refreshed');

  } catch (err) {
    console.error('[Gallery] Refresh failed:', err);

    setError(
      err.message || 'Failed to refresh gallery'
    );

    throw err;

  } finally {
    setIsCreating(false);
    console.log('[Gallery] Creation flow finished');
  }
};

  const handleLogout = () => {
    console.log('[Gallery] handleLogout called');
    console.log('[Gallery] Clearing local storage and navigating to login');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('[Gallery] Local storage cleared');
    navigate('/login');
    console.log('[Gallery] Navigation to login complete');
  };

  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    console.log('[Gallery] Search input changed to:', newQuery);
    setSearchQuery(newQuery);
  };

  const handleOpenCreateModal = () => {
    console.log('[Gallery] Opening create modal');
    setShowCreateModal(true);
  };

  const LoadingSkeleton = () => {
    console.log('[Gallery] Rendering loading skeleton');
    return (
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
  };

  const EmptyState = () => {
    console.log('[Gallery] Rendering empty state');
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📔</div>
        <h3>No memories yet</h3>
        <p>Create your first event to start collecting photographs.</p>
        <p className="empty-state-sub">Every story begins with a single picture.</p>
        <button 
          className="create-event-btn empty-state-btn"
          onClick={handleOpenCreateModal}
        >
          + Create Your First Collection
        </button>
      </div>
    );
  };

  const ErrorState = () => {
    console.log('[Gallery] Rendering error state:', error);
    return (
      <div className="empty-state error-state">
        <div className="empty-state-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button 
          className="retry-btn"
          onClick={() => {
            console.log('[Gallery] Retry button clicked');
            loadGalleryEvents();
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    );
  };

  console.log('[Gallery] Rendering component with state:', {
    isLoading,
    isSearching,
    isCreating,
    hasError: !!error,
    error,
    eventsCount: events.length,
    filteredCount: filteredEvents.length,
    searchQuery,
    showCreateModal
  });

  return (
    <div className="gallery-page">
      <Navbar onLogout={handleLogout} unreadCount={unreadCount} />

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
              onClick={handleOpenCreateModal}
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
              disabled={isLoading || isSearching}
            />
            {isSearching && <span className="search-spinner">🔍</span>}
          </div>

          {/* Content */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorState />
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

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => {
          console.log('[Gallery] Closing create modal via onClose');
          setShowCreateModal(false);
        }}
        onCreate={handleCreateEvent}
      />
    </div>
  );
}
import { useNavigate } from 'react-router-dom';
import './EventCard.css';

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const { id, name, photo_count, approved_at } = event;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const handleClick = () => {
    navigate(`/event/${id}`);
  };

  // Vintage corner decoration
  const getRandomCorner = (seed) => {
    const corners = ['◈', '✦', '❖', '✧', '◇'];
    return corners[parseInt(seed) % corners.length];
  };

  return (
    <div className="event-card" onClick={handleClick}>
      <div className="event-card-thumbnail">
        <div className="event-card-photo-count">
          <span className="photo-count-number">{photo_count}</span>
          <span className="photo-count-label">photographs</span>
        </div>
        {/* Vintage corner decoration */}
        <span className="corner-decor top-left">{getRandomCorner(id)}</span>
        <span className="corner-decor top-right">{getRandomCorner(id + 1)}</span>
        <span className="corner-decor bottom-left">{getRandomCorner(id + 2)}</span>
        <span className="corner-decor bottom-right">{getRandomCorner(id + 3)}</span>
      </div>
      
      <div className="event-card-content">
        <h3 className="event-card-name">{name}</h3>
        <p className="event-card-date">{formatDate(approved_at)}</p>
        <div className="event-card-divider"></div>
      </div>
    </div>
  );
}
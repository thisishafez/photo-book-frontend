import { useNavigate } from 'react-router-dom';
import './EventCard.css';

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const { id, name, photo_count, approved_at, photos = [] } = event;

  console.log('[EventCard] Rendering event:', {
    id,
    name,
    photo_count,
    approved_at,
    photosCount: photos.length
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formatted = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
    console.log(`[EventCard] Formatted date for ${name}:`, formatted);
    return formatted;
  };

  const handleClick = () => {
    console.log(`[EventCard] Clicked on event: ${name} (${id})`);
    console.log(`[EventCard] Navigating to /event/${id}`);
    navigate(`/event/${id}`);
  };

  // Vintage corner decoration
  const getRandomCorner = (seed) => {
    const corners = ['◈', '✦', '❖', '✧', '◇'];
    const corner = corners[parseInt(seed) % corners.length];
    console.log(`[EventCard] Corner decoration for seed ${seed}:`, corner);
    return corner;
  };

  // Get first 4 photos for preview
  const previewPhotos = photos.slice(0, 4);
  console.log(`[EventCard] ${name} - ${previewPhotos.length} preview photos out of ${photos.length}`);

  return (
    <div className="event-card" onClick={handleClick}>
      <div className="event-card-thumbnail">
        {previewPhotos.length > 0 ? (
          <>
            <div className="photo-preview-grid">
              {previewPhotos.map((photo, index) => {
                console.log(`[EventCard] Rendering preview photo ${index + 1} for ${name}:`, photo.id);
                return (
                  <div key={photo.id || index} className="photo-preview-item">
                    <img 
                      src={photo.url} 
                      alt={`${name} preview ${index + 1}`}
                      loading="lazy"
                      onLoad={() => console.log(`[EventCard] Photo ${photo.id} loaded`)}
                      onError={() => console.error(`[EventCard] Failed to load photo ${photo.id}`)}
                    />
                    {index === 3 && photos.length > 4 && (
                      <div className="photo-preview-overlay">
                        <span>+{photos.length - 4}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="photo-count-badge">
              <span className="photo-count-number">{photo_count}</span>
              <span className="photo-count-label">photos</span>
            </div>
          </>
        ) : (
          <div className="photo-count-empty">
            <span className="photo-count-number">{photo_count}</span>
            <span className="photo-count-label">photographs</span>
          </div>
        )}
        
        {/* Vintage corner decorations */}
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
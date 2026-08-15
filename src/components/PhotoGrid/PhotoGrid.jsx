import './PhotoGrid.css';

export default function PhotoGrid({ photos }) {
  if (!photos || photos.length === 0) {
    return (
      <div className="photo-grid-empty">
        <span className="empty-icon">🖼️</span>
        <p>No photographs yet</p>
        <span className="empty-sub">Be the first to capture a moment</span>
      </div>
    );
  }

  return (
    <div className="photo-grid">
      {photos.map((photo, index) => (
        <div key={photo.id || index} className="photo-grid-item">
          <img 
            src={photo.url} 
            alt={`Photo ${index + 1}`}
            className="photo-grid-image"
            loading="lazy"
          />
          <div className="photo-grid-overlay">
            <span className="photo-grid-uploader">
              {photo.uploader || 'Anonymous'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
import { useState } from 'react';
import './PhotoGrid.css';

export default function PhotoGrid({ photos }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const openLightbox = (photo) => {
    setSelectedPhoto(photo);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    document.body.style.overflow = 'auto';
  };

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
    <>
      <div className="photo-grid">
        {photos.map((photo, index) => (
          <div 
            key={photo.id || index} 
            className="photo-grid-item"
            onClick={() => openLightbox(photo)}
          >
            <img 
              src={photo.url} 
              alt={`Photo ${index + 1}`}
              className="photo-grid-image"
              loading="lazy"
            />
            <div className="photo-grid-overlay">
              <span className="photo-grid-uploader">
                📸 {photo.uploader || 'Anonymous'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>✕</button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedPhoto.url} alt="Full size" />
            <div className="lightbox-info">
              <span>📸 {selectedPhoto.uploader || 'Anonymous'}</span>
              <span>{selectedPhoto.created_at ? new Date(selectedPhoto.created_at).toLocaleDateString() : ''}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Event.css';
import Navbar from '../../components/Navbar/Navbar';
import PhotoGrid from '../../components/PhotoGrid/PhotoGrid';

// Mock data for demonstration
const MOCK_EVENT = {
  id: '1',
  name: 'Summer Beach Party 2026',
  created_at: '2026-08-10T15:30:00Z',
  members: [
    { id: '1', username: 'alice', status: 'approved', tagged_by: null },
    { id: '2', username: 'bob', status: 'approved', tagged_by: null },
    { id: '3', username: 'charlie', status: 'invited', tagged_by: 'alice' },
    { id: '4', username: 'diana', status: 'approved', tagged_by: null },
    { id: '5', username: 'eve', status: 'rejected', tagged_by: 'bob' }
  ],
  photos: [
    { id: '1', url: 'https://picsum.photos/seed/1/400/400', uploader: 'alice', created_at: '2026-08-10T16:00:00Z' },
    { id: '2', url: 'https://picsum.photos/seed/2/400/400', uploader: 'bob', created_at: '2026-08-10T16:30:00Z' },
    { id: '3', url: 'https://picsum.photos/seed/3/400/400', uploader: 'alice', created_at: '2026-08-10T17:00:00Z' },
    { id: '4', url: 'https://picsum.photos/seed/4/400/400', uploader: 'diana', created_at: '2026-08-10T18:00:00Z' },
    { id: '5', url: 'https://picsum.photos/seed/5/400/400', uploader: 'bob', created_at: '2026-08-10T19:00:00Z' }
  ]
};

export default function Event() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showTag, setShowTag] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const loadEvent = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEvent(MOCK_EVENT);
      setIsLoading(false);
    };

    loadEvent();
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleUpload = () => {
    // TODO: Implement upload
    alert('Upload functionality will be implemented soon!');
    setShowUpload(false);
  };

  const handleTag = () => {
    // TODO: Implement tagging
    alert('Tag functionality will be implemented soon!');
    setShowTag(false);
    setSearchUser('');
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: { label: '✓ Approved', class: 'status-approved' },
      invited: { label: '⏳ Pending', class: 'status-invited' },
      rejected: { label: '✕ Declined', class: 'status-rejected' }
    };
    return badges[status] || { label: status, class: '' };
  };

  if (isLoading) {
    return (
      <div className="event-page">
        <Navbar onLogout={handleLogout} />
        <main className="event-main">
          <div className="event-container">
            <div className="event-loading">
              <div className="loading-spinner"></div>
              <p>Opening collection...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-page">
        <Navbar onLogout={handleLogout} />
        <main className="event-main">
          <div className="event-container">
            <div className="event-not-found">
              <span className="not-found-icon">📔</span>
              <h2>Collection not found</h2>
              <p>This collection may have been removed or you don't have access.</p>
              <button onClick={() => navigate('/')} className="back-btn">
                ← Return to Gallery
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="event-page">
      <Navbar onLogout={handleLogout} />

      <main className="event-main">
        <div className="event-container">
          {/* Back Button */}
          <button onClick={() => navigate('/')} className="back-btn">
            ← Back to Gallery
          </button>

          {/* Event Header */}
          <div className="event-header">
            <div className="event-header-left">
              <h1 className="event-title">{event.name}</h1>
              <p className="event-meta">
                {event.photos?.length || 0} photographs • 
                {event.members?.filter(m => m.status === 'approved').length || 0} members
              </p>
            </div>
            <div className="event-actions">
              <button 
                className="action-btn"
                onClick={() => setShowTag(!showTag)}
              >
                + Tag Someone
              </button>
              <button 
                className="action-btn primary"
                onClick={() => setShowUpload(!showUpload)}
              >
                + Upload Photo
              </button>
            </div>
          </div>

          {/* Upload Section */}
          {showUpload && (
            <div className="upload-section">
              <div className="upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="upload-input"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="upload-label">
                  {selectedFile ? (
                    <span>📷 {selectedFile.name}</span>
                  ) : (
                    <span>📸 Click to select a photo</span>
                  )}
                </label>
                <button 
                  className="upload-submit"
                  onClick={handleUpload}
                  disabled={!selectedFile}
                >
                  Upload Photo
                </button>
                <button 
                  className="upload-cancel"
                  onClick={() => {
                    setShowUpload(false);
                    setSelectedFile(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Tag Section */}
          {showTag && (
            <div className="tag-section">
              <div className="tag-area">
                <input
                  type="text"
                  placeholder="Search for someone to tag..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="tag-input"
                />
                <button 
                  className="tag-submit"
                  onClick={handleTag}
                  disabled={!searchUser.trim()}
                >
                  Tag Member
                </button>
                <button 
                  className="tag-cancel"
                  onClick={() => {
                    setShowTag(false);
                    setSearchUser('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Members Section */}
          <section className="members-section">
            <h2 className="section-title">Members</h2>
            <div className="members-grid">
              {event.members.map((member) => {
                const badge = getStatusBadge(member.status);
                return (
                  <div key={member.id} className="member-card">
                    <span className="member-avatar">
                      {member.username.charAt(0).toUpperCase()}
                    </span>
                    <span className="member-name">{member.username}</span>
                    <span className={`member-status ${badge.class}`}>
                      {badge.label}
                    </span>
                    {member.tagged_by && (
                      <span className="member-tagged-by">
                        tagged by {member.tagged_by}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Photo Grid Section */}
          <section className="photos-section">
            <h2 className="section-title">Photographs</h2>
            <PhotoGrid photos={event.photos} />
          </section>
        </div>
      </main>
    </div>
  );
}
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
    { id: '1', url: 'https://picsum.photos/seed/1/800/800', uploader: 'alice', created_at: '2026-08-10T16:00:00Z' },
    { id: '2', url: 'https://picsum.photos/seed/2/800/800', uploader: 'bob', created_at: '2026-08-10T16:30:00Z' },
    { id: '3', url: 'https://picsum.photos/seed/3/800/800', uploader: 'alice', created_at: '2026-08-10T17:00:00Z' },
    { id: '4', url: 'https://picsum.photos/seed/4/800/800', uploader: 'diana', created_at: '2026-08-10T18:00:00Z' },
    { id: '5', url: 'https://picsum.photos/seed/5/800/800', uploader: 'bob', created_at: '2026-08-10T19:00:00Z' }
  ]
};

// Mock users for tagging search
const MOCK_USERS = [
  { id: '10', username: 'frank' },
  { id: '11', username: 'grace' },
  { id: '12', username: 'henry' },
  { id: '13', username: 'iris' },
  { id: '14', username: 'jack' }
];

export default function Event() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [tagMessage, setTagMessage] = useState(null);

  useEffect(() => {
    const loadEvent = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEvent(MOCK_EVENT);
      setIsLoading(false);
    };

    loadEvent();
  }, [id]);

  // Search users for tagging
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    // Filter out users already in the event
    const existingMemberIds = event?.members.map(m => m.user_id) || [];
    const results = MOCK_USERS.filter(user => 
      user.username.toLowerCase().includes(query) &&
      !existingMemberIds.includes(user.id)
    );
    setSearchResults(results);
  }, [searchQuery, event]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(i);
    }

    // Simulate completion
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add mock photo to event
    const newPhoto = {
      id: Date.now().toString(),
      url: URL.createObjectURL(selectedFile),
      uploader: 'you',
      created_at: new Date().toISOString()
    };
    
    setEvent(prev => ({
      ...prev,
      photos: [...prev.photos, newPhoto]
    }));

    // Reset state
    setIsUploading(false);
    setUploadProgress(0);
    setSelectedFile(null);
    setShowUploadModal(false);
  };

  const handleTag = (userId) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) return;

    // Check if already a member
    const existingMember = event.members.find(m => m.user_id === userId);
    if (existingMember) {
      setTagMessage({ type: 'error', text: `${user.username} is already a member` });
      setTimeout(() => setTagMessage(null), 3000);
      return;
    }

    // Check if previously rejected
    const rejectedMember = event.members.find(m => m.user_id === userId && m.status === 'rejected');
    if (rejectedMember) {
      setTagMessage({ type: 'error', text: `${user.username} has previously declined the invitation` });
      setTimeout(() => setTagMessage(null), 3000);
      return;
    }

    // Add member
    const newMember = {
      id: Date.now().toString(),
      user_id: userId,
      username: user.username,
      status: 'invited',
      tagged_by: 'you'
    };

    setEvent(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));

    setTagMessage({ type: 'success', text: `${user.username} has been tagged!` });
    setTimeout(() => setTagMessage(null), 3000);
    
    setSearchQuery('');
    setSearchResults([]);
    setShowTagModal(false);
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
                onClick={() => setShowTagModal(true)}
              >
                + Tag Someone
              </button>
              <button 
                className="action-btn primary"
                onClick={() => setShowUploadModal(true)}
              >
                + Upload Photo
              </button>
            </div>
          </div>

          {/* Tag Message */}
          {tagMessage && (
            <div className={`tag-message ${tagMessage.type}`}>
              {tagMessage.text}
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowUploadModal(false)}>✕</button>
            <h3 className="modal-title">Upload Photograph</h3>
            
            {isUploading ? (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="progress-text">{uploadProgress}% uploaded</p>
              </div>
            ) : (
              <div className="upload-form">
                <div className="file-drop-zone">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="file-input"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="file-label">
                    {selectedFile ? (
                      <span className="file-selected">📷 {selectedFile.name}</span>
                    ) : (
                      <>
                        <span className="file-icon">📸</span>
                        <span className="file-text">Click to select a photo</span>
                        <span className="file-sub">JPG, PNG, or GIF (max 10MB)</span>
                      </>
                    )}
                  </label>
                </div>
                
                <div className="modal-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      setShowUploadModal(false);
                      setSelectedFile(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={handleUpload}
                    disabled={!selectedFile}
                  >
                    Upload Photo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tag Modal */}
      {showTagModal && (
        <div className="modal-overlay" onClick={() => setShowTagModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowTagModal(false)}>✕</button>
            <h3 className="modal-title">Tag Someone</h3>
            
            <div className="tag-form">
              <input
                type="text"
                placeholder="Search for a user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tag-search-input"
                autoFocus
              />
              
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map(user => (
                    <div 
                      key={user.id} 
                      className="search-result-item"
                      onClick={() => handleTag(user.id)}
                    >
                      <span className="result-avatar">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                      <span className="result-name">{user.username}</span>
                      <button className="result-tag-btn">Tag</button>
                    </div>
                  ))}
                </div>
              )}
              
              {searchQuery.trim() !== '' && searchResults.length === 0 && (
                <div className="search-empty">
                  <p>No users found</p>
                </div>
              )}
              
              {searchQuery.trim() === '' && (
                <div className="search-empty">
                  <p>Type to search for users to tag</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
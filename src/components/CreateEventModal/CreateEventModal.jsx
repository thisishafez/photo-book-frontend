import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import './CreateEventModal.css';

export default function CreateEventModal({ isOpen, onClose, onCreate }) {
  const [eventName, setEventName] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);
  const searchTimeout = useRef(null);

  // Log component state changes
  console.log('[CreateEventModal] Component state:', {
    isOpen,
    eventName,
    selectedPhotosCount: selectedPhotos.length,
    taggedUsersCount: taggedUsers.length,
    isUploading,
    uploadProgress,
    isSearchingUsers
  });

  // Search users for tagging with debounce and real API
  useEffect(() => {
    console.log('[CreateEventModal] Tag search query changed:', tagSearchQuery);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (tagSearchQuery.trim() === '') {
      setSearchResults([]);
      setIsSearchingUsers(false);
      return;
    }

    // Debounce search
    searchTimeout.current = setTimeout(async () => {
      try {
        setIsSearchingUsers(true);
        console.log(`[CreateEventModal] Searching for users with query: "${tagSearchQuery}"`);
        
        const response = await api.users.search(tagSearchQuery);
        console.log('[CreateEventModal] User search response:', response);
        
        const users = response.users || response.results || [];

        console.log(
          '[CreateEventModal] Normalized users:',
          users
        );
        console.log(`[CreateEventModal] Found ${users.length} users`);
        
        // Filter out already tagged users
        const existingUserIds = taggedUsers.map(u => u.id);
        const filteredUsers = users.filter(user => !existingUserIds.includes(user.id));
        console.log(`[CreateEventModal] ${filteredUsers.length} users available to tag`);
        
        setSearchResults(filteredUsers);
      } catch (error) {
        console.error('[CreateEventModal] Error searching users:', error);
        setSearchResults([]);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [tagSearchQuery, taggedUsers]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    console.log(`[CreateEventModal] ${files.length} files selected`);
    
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        console.warn('[CreateEventModal] Invalid file type:', file.type);
        setErrors(prev => ({
          ...prev,
          photos: 'Please select valid image files (JPG, PNG, GIF)'
        }));
      }
      return isValid;
    });

    if (validFiles.length > 0) {
      console.log(`[CreateEventModal] Adding ${validFiles.length} valid images`);
      setSelectedPhotos(prev => {
        const newPhotos = [...prev, ...validFiles];
        console.log(`[CreateEventModal] Total photos now: ${newPhotos.length}`);
        return newPhotos;
      });
      if (validFiles.length > 0) {
        setErrors(prev => ({ ...prev, photos: undefined }));
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    console.log('[CreateEventModal] Drag enter, counter:', dragCounter.current);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      console.log('[CreateEventModal] Drag leave, all drag events cleared');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    console.log('[CreateEventModal] Files dropped');
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length > 0) {
      console.log(`[CreateEventModal] Adding ${validFiles.length} dropped images`);
      setSelectedPhotos(prev => {
        const newPhotos = [...prev, ...validFiles];
        console.log(`[CreateEventModal] Total photos now: ${newPhotos.length}`);
        return newPhotos;
      });
      setErrors(prev => ({ ...prev, photos: undefined }));
    } else {
      setErrors(prev => ({
        ...prev,
        photos: 'Please drop valid image files'
      }));
    }
  };

  const handleRemovePhoto = (index) => {
    console.log(`[CreateEventModal] Removing photo at index ${index}`);
    setSelectedPhotos(prev => {
      const newPhotos = prev.filter((_, i) => i !== index);
      console.log(`[CreateEventModal] ${newPhotos.length} photos remaining`);
      return newPhotos;
    });
  };

  const handleTagUser = (user) => {
    console.log(`[CreateEventModal] Tagging user: ${user.username} (${user.id})`);
    setTaggedUsers(prev => {
      if (prev.find(u => u.id === user.id)) {
        console.warn('[CreateEventModal] User already tagged:', user.username);
        return prev;
      }
      const newTags = [...prev, user];
      console.log(`[CreateEventModal] ${newTags.length} users now tagged`);
      return newTags;
    });
    setTagSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveTag = (userId) => {
    console.log(`[CreateEventModal] Removing tag for user ID: ${userId}`);
    setTaggedUsers(prev => {
      const newTags = prev.filter(u => u.id !== userId);
      console.log(`[CreateEventModal] ${newTags.length} users remain tagged`);
      return newTags;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    console.log('[CreateEventModal] Validating form');
    
    if (!eventName.trim()) {
      console.warn('[CreateEventModal] Validation failed: Event name is required');
      newErrors.name = 'Event name is required';
    } else if (eventName.trim().length < 3) {
      console.warn('[CreateEventModal] Validation failed: Event name too short');
      newErrors.name = 'Event name must be at least 3 characters';
    }
    
    if (selectedPhotos.length === 0) {
      console.warn('[CreateEventModal] Validation failed: No photos selected');
      newErrors.photos = 'At least one photo is required';
    }
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log(`[CreateEventModal] Form validation ${isValid ? 'passed' : 'failed'}`);
    return isValid;
  };

  const handleSubmit = async () => {
    console.log('[CreateEventModal] Submit triggered');
    
    if (!validateForm()) {
      console.warn('[CreateEventModal] Form validation failed, aborting submit');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    console.log('[CreateEventModal] Starting upload process');

    try {
      // Step 1: Create the event
      console.log('[CreateEventModal] Step 1: Creating event');
      const eventResponse = await api.gallery.createEvent(eventName.trim());
      console.log('[CreateEventModal] Event created:', eventResponse);
      setUploadProgress(20);

      const eventId = eventResponse.id;

      // Step 2: Upload each photo
      console.log(`[CreateEventModal] Step 2: Uploading ${selectedPhotos.length} photos`);
      const uploadedPhotos = [];
      for (let i = 0; i < selectedPhotos.length; i++) {
        const photo = selectedPhotos[i];
        console.log(`[CreateEventModal] Uploading photo ${i + 1}/${selectedPhotos.length}: ${photo.name}`);
        
        try {
          const photoResponse = await api.gallery.uploadPhoto(eventId, photo);
          uploadedPhotos.push(photoResponse);
          console.log(`[CreateEventModal] Photo ${i + 1} uploaded:`, photoResponse);
        } catch (error) {
          console.error(
          `[CreateEventModal] Failed to upload photo ${i + 1}:`,
          error
         );

          throw error;
        }
        
        // Update progress (20% to 70%)
        const progress = 20 + ((i + 1) / selectedPhotos.length) * 50;
        setUploadProgress(Math.min(progress, 70));
      }
      console.log(`[CreateEventModal] Uploaded ${uploadedPhotos.length}/${selectedPhotos.length} photos`);
      setUploadProgress(70);

      // Step 3: Tag users
      console.log(`[CreateEventModal] Step 3: Tagging ${taggedUsers.length} users`);
      const taggedResults = [];
      for (let i = 0; i < taggedUsers.length; i++) {
        const user = taggedUsers[i];
        console.log(`[CreateEventModal] Tagging user ${i + 1}/${taggedUsers.length}: ${user.username}`);
        
        try {
          const tagResponse = await api.gallery.tagUser(eventId, user.id);
          taggedResults.push(tagResponse);
          console.log(`[CreateEventModal] User ${user.username} tagged:`, tagResponse);
        } catch (error) {
          console.error(`[CreateEventModal] Failed to tag user ${user.username}:`, error);
        }
      }
      console.log(`[CreateEventModal] Tagged ${taggedResults.length}/${taggedUsers.length} users`);
      setUploadProgress(100);

      // Prepare event data for the callback
      const eventData = {
        ...eventResponse,
        photos: uploadedPhotos,
        taggedUsers: taggedResults
      };
      console.log('[CreateEventModal] Event data prepared:', eventData);

      // Call the onCreate callback
      console.log('[CreateEventModal] Calling onCreate callback');
      await onCreate(eventData);
      console.log('[CreateEventModal] Event creation successful');
      
      // Reset form
      console.log('[CreateEventModal] Resetting form state');
      setEventName('');
      setSelectedPhotos([]);
      setTaggedUsers([]);
      setTagSearchQuery('');
      setSearchResults([]);
      setErrors({});
      
    } catch (error) {
      console.error('[CreateEventModal] Error during creation:', error);
      setErrors({
        submit: error.message || 'Failed to create event. Please try again.'
      });
      // Don't close the modal on error
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      console.log('[CreateEventModal] Upload process completed');
    }
  };

  const handleClose = () => {
    console.log('[CreateEventModal] Modal closing');
    if (!isUploading) {
      setEventName('');
      setSelectedPhotos([]);
      setTaggedUsers([]);
      setTagSearchQuery('');
      setSearchResults([]);
      setErrors({});
    }
    onClose();
  };

  if (!isOpen) {
    console.log('[CreateEventModal] Modal is not open, not rendering');
    return null;
  }

  console.log('[CreateEventModal] Rendering modal');

  return (
    <div className="create-event-modal-overlay" onClick={handleClose}>
      <div className="create-event-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose}>✕</button>
        
        <h2 className="modal-title">Create New Collection</h2>
        <p className="modal-subtitle">Start a new collection by adding photos and tagging friends</p>

        {errors.submit && (
          <div className="error-message submit-error">{errors.submit}</div>
        )}

        {/* Event Name */}
        <div className="form-group">
          <label className="form-label">Collection Name *</label>
          <input
            type="text"
            className={`form-input ${errors.name ? 'error' : ''}`}
            placeholder="e.g., Summer Vibes 2026"
            value={eventName}
            onChange={(e) => {
              console.log('[CreateEventModal] Event name changed:', e.target.value);
              setEventName(e.target.value);
              if (errors.name) {
                setErrors(prev => ({ ...prev, name: undefined }));
              }
            }}
            disabled={isUploading}
            maxLength={100}
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
          <span className="char-count">{eventName.length}/100</span>
        </div>

        {/* Photo Upload */}
        <div className="form-group">
          <label className="form-label">Photos * (at least 1)</label>
          <div 
            className={`photo-upload-zone ${errors.photos ? 'error' : ''}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="photo-file-input"
              disabled={isUploading}
              id="photo-upload-input"
            />
            <label htmlFor="photo-upload-input" className="photo-upload-label">
              <span className="upload-icon">📸</span>
              <span className="upload-text">Drop photos here or click to browse</span>
              <span className="upload-sub">Supports JPG, PNG, GIF (max 10MB each)</span>
            </label>
          </div>
          {errors.photos && <span className="field-error">{errors.photos}</span>}
          
          {/* Photo Preview Grid */}
          {selectedPhotos.length > 0 && (
            <div className="photo-preview-grid">
              {selectedPhotos.map((photo, index) => (
                <div key={index} className="photo-preview-item">
                  <img 
                    src={URL.createObjectURL(photo)} 
                    alt={`Upload ${index + 1}`}
                    className="photo-preview-image"
                  />
                  <button 
                    className="photo-remove-btn"
                    onClick={() => handleRemovePhoto(index)}
                    disabled={isUploading}
                  >
                    ✕
                  </button>
                  <span className="photo-filename">{photo.name}</span>
                </div>
              ))}
            </div>
          )}
          <span className="photo-count">
            {selectedPhotos.length} {selectedPhotos.length === 1 ? 'photo' : 'photos'} selected
          </span>
        </div>

        {/* Tag Users */}
        <div className="form-group">
          <label className="form-label">Tag People</label>
          <div className="tag-search-container">
            <input
              type="text"
              className="form-input tag-search-input"
              placeholder="Search for users to tag..."
              value={tagSearchQuery}
              onChange={(e) => {
                console.log('[CreateEventModal] Tag search changed:', e.target.value);
                setTagSearchQuery(e.target.value);
              }}
              disabled={isUploading || isSearchingUsers}
            />
            {isSearchingUsers && (
              <div className="tag-search-loading">Searching...</div>
            )}
            {tagSearchQuery.trim() !== '' && searchResults.length > 0 && (
              <div className="tag-search-results">
                {searchResults.map(user => (
                  <div 
                    key={user.id} 
                    className="tag-result-item"
                    onClick={() => handleTagUser(user)}
                  >
                    <span className="tag-result-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                    <span className="tag-result-name">{user.username}</span>
                    <button className="tag-result-btn">+ Tag</button>
                  </div>
                ))}
              </div>
            )}
            {tagSearchQuery.trim() !== '' && searchResults.length === 0 && !isSearchingUsers && (
              <div className="tag-search-empty">
                <p>No users found</p>
              </div>
            )}
          </div>

          {/* Tagged Users */}
          {taggedUsers.length > 0 && (
            <div className="tagged-users-list">
              {taggedUsers.map(user => (
                <div key={user.id} className="tagged-user-item">
                  <span className="tagged-user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                  <span className="tagged-user-name">{user.username}</span>
                  <button 
                    className="tagged-user-remove"
                    onClick={() => handleRemoveTag(user.id)}
                    disabled={isUploading}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <span className="tagged-count">
            {taggedUsers.length} {taggedUsers.length === 1 ? 'person' : 'people'} tagged
          </span>
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="upload-progress-container">
            <div className="upload-progress-bar">
              <div 
                className="upload-progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="upload-progress-text">
              {uploadProgress < 20 && 'Creating collection...'}
              {uploadProgress >= 20 && uploadProgress < 70 && `Uploading photos (${Math.round((uploadProgress - 20) / 50 * selectedPhotos.length)}/${selectedPhotos.length})...`}
              {uploadProgress >= 70 && uploadProgress < 100 && `Tagging users (${Math.round((uploadProgress - 70) / 30 * taggedUsers.length)}/${taggedUsers.length})...`}
              {uploadProgress >= 100 && 'Complete!'}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="modal-actions">
          <button 
            className="btn-cancel"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </button>
          <button 
            className="btn-create"
            onClick={handleSubmit}
            disabled={isUploading || !eventName.trim() || selectedPhotos.length === 0}
          >
            {isUploading ? 'Creating...' : '✨ Create Collection'}
          </button>
        </div>
      </div>
    </div>
  );
}
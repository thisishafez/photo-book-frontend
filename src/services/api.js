const API_BASE_URL = 'https://yadegar-api.duster.ir';

// Helper for logging API responses
const logResponse = (endpoint, method, response, data) => {
  console.log(`[API] ${method} ${endpoint} - Status: ${response.status} ${response.statusText}`);
  console.log(`[API] Response Data:`, data);
  console.log(`[API] Headers:`, Object.fromEntries(response.headers.entries()));
  console.log(`[API] Timestamp:`, new Date().toISOString());
  console.log('---');
};

// Helper for logging errors
const logError = (endpoint, method, error) => {
  console.error(`[API] Error ${method} ${endpoint}:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  console.error('---');
};

export const api = {
  // Auth endpoints
  auth: {
    register: async (username, password) => {
      console.log(`[API] Starting registration for user: ${username}`);
      const endpoint = '/register';
      
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
        
        console.log(`[API] Registration response status: ${response.status}`);
        
        if (!response.ok) {
          const error = await response.json();
          logError(endpoint, 'POST', new Error(error.message || 'Registration failed'));
          throw new Error(error.message || 'Registration failed');
        }
        
        const data = await response.json();
        logResponse(endpoint, 'POST', response, data);
        return data;
      } catch (error) {
        logError(endpoint, 'POST', error);
        throw error;
      }
    },
    
    login: async (username, password) => {
      console.log(`[API] Starting login for user: ${username}`);
      const endpoint = '/login';
      
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
        
        console.log(`[API] Login response status: ${response.status}`);
        
        if (!response.ok) {
          const error = await response.json();
          logError(endpoint, 'POST', new Error(error.message || 'Login failed'));
          throw new Error(error.message || 'Login failed');
        }
        
        const data = await response.json();
        logResponse(endpoint, 'POST', response, data);
        console.log(`[API] Login successful for user: ${data.user?.username || username}`);
        return data;
      } catch (error) {
        logError(endpoint, 'POST', error);
        throw error;
      }
    },
    
    logout: async () => {
      console.log('[API] Starting logout');
      const endpoint = '/logout';
      const token = localStorage.getItem('token');
      
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        console.log(`[API] Logout response status: ${response.status}`);
        logResponse(endpoint, 'POST', response, { message: 'Logout attempted' });
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('[API] Local storage cleared');
        
        if (!response.ok) {
          console.warn('[API] Logout API call failed, but local session cleared');
        }
      } catch (error) {
        logError(endpoint, 'POST', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('[API] Local storage cleared after error');
      }
    },
  },

  // Users endpoints
  users: {
    search: async (query) => {
      console.log(`[API] Searching users with query: "${query}"`);
      const endpoint = '/users/search';
      const token = localStorage.getItem('token');
      const url = new URL(`${API_BASE_URL}${endpoint}`);
      if (query) {
        url.searchParams.append('q', query);
        console.log(`[API] User search URL: ${url.toString()}`);
      }
      
      try {
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        
        console.log(`[API] User search response status: ${response.status}`);
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          logError(endpoint, 'GET', new Error(error.message || 'User search failed'));
          throw new Error(error.message || 'User search failed');
        }
        
        const data = await response.json();
        logResponse(endpoint, 'GET', response, data);
        console.log(`[API] User search found ${data.results?.length || 0} users for "${query}"`);
        return {
          users: data.results || []
        };
      } catch (error) {
        logError(endpoint, 'GET', error);
        throw error;
      }
    }
  },

  // Gallery endpoints
  gallery: {
    getEvents: async () => {
      console.log('[API] Starting gallery load');
      const endpoint = '/gallery';
      const token = localStorage.getItem('token');
      console.log(`[API] Token present: ${!!token}`);
      
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        
        console.log(`[API] Gallery response status: ${response.status}`);
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          logError(endpoint, 'GET', new Error(error.message || 'Failed to load gallery'));
          throw new Error(error.message || 'Failed to load gallery');
        }
        
        const data = await response.json();
        logResponse(endpoint, 'GET', response, data);
        console.log(`[API] Loaded ${data.events?.length || 0} events`);
        return data;
      } catch (error) {
        logError(endpoint, 'GET', error);
        throw error;
      }
    },

    getEvent: async (eventId) => {
      console.log(`[API] Getting event details for event ${eventId}`);
      const endpoint = `/events/${eventId}`;
      const token = localStorage.getItem('token');
      
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        
        console.log(`[API] Get event response status: ${response.status}`);
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          logError(endpoint, 'GET', new Error(error.message || 'Failed to get event details'));
          throw new Error(error.message || 'Failed to get event details');
        }
        
        const data = await response.json();
        logResponse(endpoint, 'GET', response, data);
        console.log(`[API] Event details loaded successfully`);
        return data;
      } catch (error) {
        logError(endpoint, 'GET', error);
        throw error;
      }
    },

    getEventPhotos: async (eventId) => {
      console.log(`[API] Loading photos for event ${eventId}`);
      const endpoint = `/events/${eventId}/photos`;
      const token = localStorage.getItem('token');
      
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          }
        });
        
        console.log(`[API] Get event photos response status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          logError(endpoint, 'GET', new Error(errorText || 'Failed to get event photos'));
          throw new Error(errorText || 'Failed to get event photos');
        }
        
        const data = await response.json();
        logResponse(endpoint, 'GET', response, data);
        console.log(`[API] Photos loaded successfully`);
        return data;
      } catch (error) {
        logError(endpoint, 'GET', error);
        throw error;
      }
    },

    searchEvents: async (searchTerm) => {
      console.log(`[API] Starting search for: "${searchTerm}"`);
      const endpoint = '/events';
      const token = localStorage.getItem('token');
      const url = new URL(`${API_BASE_URL}${endpoint}`);
      if (searchTerm) {
        url.searchParams.append('search', searchTerm);
        console.log(`[API] Search URL: ${url.toString()}`);
      }
      
      try {
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        
        console.log(`[API] Search response status: ${response.status}`);
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          logError(endpoint, 'GET', new Error(error.message || 'Search failed'));
          throw new Error(error.message || 'Search failed');
        }
        
        const data = await response.json();
        logResponse(endpoint, 'GET', response, data);
        console.log(`[API] Search found ${data.events?.length || 0} events for "${searchTerm}"`);
        return data;
      } catch (error) {
        logError(endpoint, 'GET', error);
        throw error;
      }
    },

    createEvent: async (eventName) => {
      console.log(`[API] Starting event creation: "${eventName}"`);
      const endpoint = '/events';
      const token = localStorage.getItem('token');
      const requestBody = { name: eventName };
      console.log(`[API] Request body:`, requestBody);
      
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(requestBody),
        });
        
        console.log(`[API] Create event response status: ${response.status}`);
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          logError(endpoint, 'POST', new Error(error.message || 'Failed to create event'));
          throw new Error(error.message || 'Failed to create event');
        }
        
        const data = await response.json();
        logResponse(endpoint, 'POST', response, data);
        console.log(`[API] Event created successfully with ID: ${data.id}`);
        return data;
      } catch (error) {
        logError(endpoint, 'POST', error);
        throw error;
      }
    },

    uploadPhoto: async (eventId, photoFile) => {
      console.log(`[API] Uploading photo to event ${eventId}`);
      const endpoint = `/events/${eventId}/photos`;
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', photoFile);

      console.log('[API] FormData entries:');
      for (const pair of formData.entries()) {
        console.log('[API] FormData field:', pair[0], pair[1]);
      }

      console.log('[API] FormData created');
      console.log('[API] File details:', {
        name: photoFile.name,
        type: photoFile.type,
        size: photoFile.size
      });

      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: formData,
        });

        console.log(`[API] Upload photo response status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[API] Upload failed response:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(errorText || 'Failed to upload photo');
        }

        const data = await response.json();
        logResponse(endpoint, 'POST', response, data);
        console.log(`[API] Photo uploaded successfully:`, data);
        return data;
      } catch (error) {
        logError(endpoint, 'POST', error);
        throw error;
      }
    },

    // Tag a user to an event
    tagUser: async (eventId, userId) => {
      console.log(`[API] Tagging user ${userId} to event ${eventId}`);
      const endpoint = `/events/${eventId}/members`;
      const token = localStorage.getItem('token');
      const requestBody = { user_id: userId };
      console.log(`[API] Request body:`, requestBody);
      
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(requestBody),
        });
        
        console.log(`[API] Tag user response status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[API] Tag user failed body:', errorText);
          logError(endpoint, 'POST', new Error(errorText || 'Failed to tag user'));
          throw new Error(errorText || 'Failed to tag user');
        }
        
        const data = await response.json();
        logResponse(endpoint, 'POST', response, data);
        console.log(`[API] User tagged successfully with ID: ${data.id}`);
        return data;
      } catch (error) {
        logError(endpoint, 'POST', error);
        throw error;
      }
    }
  },
};

// Helper to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
  console.log('[API] Auth headers generated:', {
    hasToken: !!token,
    headers: headers
  });
  return headers;
};
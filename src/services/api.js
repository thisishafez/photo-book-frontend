const API_BASE_URL = 'https://yadegar-api.duster.ir';

// ================================
// MOCK DATABASE (temporary)
// Replace with backend calls later
// ================================

const mockActivities = [
  {
    id: "activity-1",
    title: "Hiking Adventure",
    description: "Explore nature trails with friends.",
    source: "host",
    rating: 4.8,
    category: "outdoor",
    image: null
  },
  {
    id: "activity-2",
    title: "Board Game Night",
    description: "Relax and play games together.",
    source: "user",
    rating: 4.5,
    category: "indoor",
    image: null
  },
  {
    id: "activity-3",
    title: "Cooking Workshop",
    description: "Learn new recipes together.",
    source: "host",
    rating: 4.9,
    category: "food",
    image: null
  }
];


const mockCircle = [
  {
    id:"friend-1",
    username:"alex",
    status:"accepted"
  },
  {
    id:"friend-2",
    username:"sara",
    status:"accepted"
  }
];


const mockCircleRequests = [
  {
    id:"request-1",
    username:"john",
    status:"pending"
  }
];


const mockHangouts = [
  {
    id:"hangout-1",
    activity:"Hiking Adventure",
    date:"2026-09-15",
    status:"planned",
    participants:3
  }
];


const mockArchives = [
  {
    id:"archive-1",
    title:"Mountain Trip",
    date:"2026-08-20",
    photos:12,
    messages:35
  }
];


const mockBadges = [
  {
    id:"badge-1",
    title:"Mountain Explorer",
    description:"Completed a hiking activity",
    visible:true
  }
];

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
    register: async (username, email, password) => {
  console.log(`[API] Starting registration for user: ${username}`);

  const endpoint = '/register';

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password
      }),
    });

    console.log(`[API] Registration response status: ${response.status}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

  console.log("[REGISTER ERROR DATA]", error);

  const message =
    error.error?.message ||
    error.message ||
    error.detail ||
    'Registration failed';

  logError(endpoint, 'POST', new Error(message));

  throw new Error(message);
    }

    const data = await response.json();

    logResponse(endpoint, 'POST', response, data);

    return data;

  } catch(error) {
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
          body: JSON.stringify({
 identifier: username,
 password
}),
          
        });
        console.log("[LOGIN BODY]", {
    identifier: username,
    password
});
        console.log(`[API] Login response status: ${response.status}`);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));

  console.log("[LOGIN ERROR DATA]", error);

  const message =
    error.error?.message ||
    error.message ||
    error.detail ||
    'Login failed';

  throw new Error(message);
        }
        
        const data = await response.json();
        console.log("[LOGIN DATA]", data);
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

    createEvent: async (eventName, location) => {
      console.log(`[API] Starting event creation: "${eventName}"`);
      const endpoint = '/events';
      const token = localStorage.getItem('token');
      const requestBody = { name: eventName, location: location};
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
  notifications: {

  getNotifications: async () => {
    const endpoint = '/notifications';
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load notifications');
    }

    return await response.json();
  },


  markAsRead: async (notificationId) => {
    const endpoint = `/notifications/${notificationId}/read`;
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification read');
    }

    return true;
  },


  approveMember: async (memberId) => {

    const endpoint = `/event-members/${memberId}/approve`;
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method:'POST',
      headers:{
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type':'application/json'
      }
    });


    if(!response.ok){
      throw new Error('Approve failed');
    }


    return await response.json();
  },


  rejectMember: async (memberId) => {

    const endpoint = `/event-members/${memberId}/reject`;
    const token = localStorage.getItem('token');


    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method:'POST',
      headers:{
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type':'application/json'
      }
    });


    if(!response.ok){
      throw new Error('Reject failed');
    }


    return await response.json();
  },


  removeMember: async(memberId)=>{

    const endpoint=`/event-members/${memberId}`;
    const token=localStorage.getItem('token');


    const response=await fetch(`${API_BASE_URL}${endpoint}`,{
      method:'DELETE',
      headers:{
        'Authorization':token ? `Bearer ${token}` : ''
      }
    });


    if(!response.ok){
      throw new Error('Remove failed');
    }


    return true;
  }

}

,profile: {

  getProfile: async()=>{

    console.log("[MOCK] Getting profile");

    return {
      id:"user-1",
      username:"demo",
      display_name:"Demo User",
      bio:"Adventure lover"
    };

  },


  updateProfile: async(data)=>{

    console.log(
      "[MOCK] Updating profile",
      data
    );


    return {
      success:true,
      ...data
    };

  },


  getInterests: async()=>{

    return [
      "hiking",
      "movies",
      "cycling"
    ];

  },


  updateInterests: async(interests)=>{

    console.log(
      "[MOCK] Interests updated",
      interests
    );


    return {
      status:"ok"
    };

  }

},activities: {

  getRecommendations: async()=>{

    console.log(
      "[MOCK] Loading recommendations"
    );


    return {
      activities:mockActivities
    };

  },


  getActivity: async(id)=>{


    return mockActivities.find(
      activity=>activity.id===id
    );

  },


  createActivity: async(data)=>{


    const activity={

      id:
        `activity-${Date.now()}`,

      ...data,

      rating:0,

      source:"user"

    };


    mockActivities.push(activity);


    return activity;

  }

},
circle: {


getCircle: async()=>{

 console.log(
  "[MOCK] Loading circle"
 );

 return mockCircle;

},



getRequests: async()=>{

 return mockCircleRequests;

},



sendRequest: async(userId)=>{


 const request={

 id:
 `request-${Date.now()}`,

 username:userId,

 status:"pending"

 };


 mockCircleRequests.push(request);


 return request;

},



acceptRequest: async(id)=>{


 const request =
 mockCircleRequests.find(
  r=>r.id===id
 );


 if(request){

  request.status="accepted";

 }


 return request;

},



rejectRequest: async(id)=>{


 return {
  success:true,
  id
 };


},



removeFriend: async(id)=>{


 return {
  success:true,
  id
 };


}

},
hangouts:{


getHangouts:async()=>{


return mockHangouts;


},



createHangout:async(data)=>{


const hangout={

id:
`hangout-${Date.now()}`,

...data,

status:"planned"

};


mockHangouts.push(hangout);


return hangout;


},



inviteUser:async(hangoutId,userId)=>{


return {

success:true,

hangoutId,

userId

};


},



cancelHangout:async(id)=>{


return {

success:true,

id

};


}


},
archive:{


getArchives:async()=>{


return mockArchives;


},



getArchive:async(id)=>{


return mockArchives.find(
 a=>a.id===id
);


},



uploadMedia:async(id,file)=>{


console.log(
 "[MOCK] Upload",
 file
);


return {

success:true,

archive:id

};


}


},
badges:{


getBadges:async()=>{


return mockBadges;


},



toggleVisibility:async(id)=>{


const badge =
mockBadges.find(
 b=>b.id===id
);


if(badge){

 badge.visible =
 !badge.visible;

}


return badge;


}


}

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

export { API_BASE_URL };
export const API_BASE_URL = 'https://api.duster.ir';
export const MEDIA_BASE_URL =
  "https://media.duster.ir";
// Later:
// const API_BASE_URL = import.meta.env.VITE_API_URL;


// =================================
// CENTRAL REQUEST WRAPPER
// =================================

async function request(
  path,
  {
    method = "GET",
    body,
    headers = {},
    isRetry = false
  } = {}
) {

  const token = localStorage.getItem("access_token");


  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      method,

      headers: {
        ...(body
          ? {
              "Content-Type": "application/json"
            }
          : {}),

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`
            }
          : {}),

        ...headers
      },


      body:
        body
          ? JSON.stringify(body)
          : undefined
    }
  );



  if (response.status === 204) {
    return null;
  }




  if (
    response.status === 401 &&
    !isRetry &&
    !path.startsWith("/auth/")
  ) {

    const refreshed =
      await tryRefresh();


    if (refreshed) {

      return request(
        path,
        {
          method,
          body,
          headers,
          isRetry:true
        }
      );

    }

  }




  const data =
    await response
      .json()
      .catch(() => ({}));




  if (!response.ok) {

    const requestError = new Error(
      data.error ||
      `Request failed (${response.status})`
    );

    requestError.status = response.status;

    throw requestError;

  }



  return data;

}




// Same auth/refresh handling as request(), but for multipart/form-data
// bodies (file uploads) instead of JSON — the central request() helper
// always sets Content-Type: application/json when a body is present,
// which breaks the multipart boundary the browser needs to set itself.
async function requestMultipart(
  path,
  formData,
  { method = "POST", isRetry = false } = {}
) {

  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      method,

      headers: {
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {})
        // No Content-Type here on purpose — the browser sets
        // multipart/form-data with the right boundary itself.
      },

      body: formData
    }
  );

  if (
    response.status === 401 &&
    !isRetry
  ) {

    const refreshed = await tryRefresh();

    if (refreshed) {
      return requestMultipart(
        path,
        formData,
        { method, isRetry: true }
      );
    }

  }

  const data =
    await response
      .json()
      .catch(() => ({}));

  if (!response.ok) {

    const requestError = new Error(
      data.error ||
      `Request failed (${response.status})`
    );

    requestError.status = response.status;

    throw requestError;

  }

  return data;

}



async function tryRefresh() {


  const refreshToken =
    localStorage.getItem(
      "refresh_token"
    );



  if (!refreshToken) {
    return false;
  }



  try {


    const response =
      await fetch(
        `${API_BASE_URL}/auth/refresh`,
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({
            refresh_token:
              refreshToken
          })
        }
      );



    if (!response.ok) {

      throw new Error(
        "refresh failed"
      );

    }



    const data =
      await response.json();



    localStorage.setItem(
      "access_token",
      data.access_token
    );


    localStorage.setItem(
      "refresh_token",
      data.refresh_token
    );



    return true;



  } catch(error) {


    localStorage.removeItem(
      "access_token"
    );


    localStorage.removeItem(
      "refresh_token"
    );


    localStorage.removeItem(
      "user"
    );


    return false;

  }

}





// Backend media_type is "photo" | "gif" | "video" | "audio" (see
// archive/adapters/http/handler.go UploadMedia doc comment) — derive
// it from the browser File's MIME type rather than asking the caller
// to know the backend's vocabulary.
const mediaTypeFromFile = (file) => {

  const mime = file?.type || "";

  if (mime === "image/gif") return "gif";
  if (mime.startsWith("image/")) return "photo";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";

  return "photo";

};



// =================================
// API
// =================================

export const api = {


  // ===============================
  // AUTH
  // ===============================

  auth: {


    register:
      async (
        email,
        password,
        accountType
      ) => {


        return request(
          "/auth/register",
          {
            method:"POST",

            body:{
              email,

              password,

              account_type:
                accountType
            }
          }
        );


      },



    login:
      async (
        email,
        password
      ) => {


        return request(
          "/auth/login",
          {
            method:"POST",

            body:{
              email,

              password
            }
          }
        );


      },



    logout:
      async()=>{


        localStorage.removeItem(
          "access_token"
        );


        localStorage.removeItem(
          "refresh_token"
        );


        localStorage.removeItem(
          "user"
        );


      }


  },





  // ===============================
  // USER PROFILE
  // ===============================


  user:{


    createProfile:
      async(
        displayName,
        handle,
        bio
      )=>{


        return request(
          "/user/profile",
          {

            method:"POST",

            body:{

              display_name:
                displayName,

              handle,

              bio

            }

          }
        );


      },





    updateProfile:
      async(fields)=>{


        return request(
          "/user/profile",
          {

            method:"PATCH",

            body:fields

          }
        );


      },





    getInterestCatalog:
      async()=>{


        return request(
          "/user/interests/catalog"
        );


      },





    getInterests:
      async()=>{


        return request(
          "/user/interests"
        );


      },





    setInterests:
      async(
        interestIds
      )=>{


        return request(
          "/user/interests",
          {

            method:"PUT",

            body:{
              interest_ids:
                interestIds
            }

          }
        );


      }


  },
  // ===============================
  // HOST PROFILE
  // ===============================

  host: {

    createProfile:
      async(
        businessName,
        locationInfo
      ) => {

        return request(
          "/host/profile",
          {
            method:"POST",

            body:{
              business_name: businessName,
              location_info: locationInfo
            }
          }
        );

      }

  },



  // ===============================
  // MODERATOR PROFILE
  // ===============================

  moderator: {

    createProfile:
      async()=>{

        return request(
          "/moderator/profile",
          {
            method:"POST"
          }
        );

      }

  },





  // ===============================
  // GALLERY
  // ===============================


  gallery:{


    getEvents:
      async()=>{


        return null;


      },


    getEvent:
      async(id)=>{


        return null;


      },


    getEventPhotos:
      async(id)=>{


        return null;


      },


    createEvent:
      async(data)=>{


        return null;


      },


    uploadPhoto:
      async(eventId,file)=>{


        return null;


      },


    tagUser:
      async(eventId,userId)=>{


        return null;


      }


  },







  // ===============================
  // ACTIVITIES
  // ===============================


 activities: {
  // Public/Discovery feed — approved activities only
  list: async () => request("/activities"),

  // kept for backward compatibility with any existing callers
  getRecommendations: async () => ({ activities: await request("/activities") }),

  getActivity: async (id) => request(`/activities/${id}`),
  getActivityDetails: async (id) => request(`/activities/${id}`),

  createActivity: async (title, description) =>
    request("/activities", { method: "POST", body: { title, description: description || null } }),

  getModerationQueue: async () => request("/activities/moderation/queue"),
  approveActivity: async (id) => request(`/activities/${id}/approve`, { method: "POST" }),
  rejectActivity: async (id, reason) =>
    request(`/activities/${id}/reject`, { method: "POST", body: reason ? { reason } : undefined }),

  // Ratings — backed by internal/rating. Score is 0–5 in 0.5 steps;
  // POST upserts (a second call from the same user overwrites their score).
  getRatingSummary: async (id) => request(`/activities/${id}/rating`),
  submitRating: async (id, score) =>
    request(`/activities/${id}/rating`, { method: "POST", body: { score } }),

  // Comments — backed by internal/comment. ListComments only returns
  // approved comments (moderation-gated); a freshly-created comment
  // won't show up here until a moderator approves it.
  getComments: async (id) => request(`/activities/${id}/comment`),
  addComment: async (id, body) =>
    request(`/activities/${id}/comment`, { method: "POST", body: { body } }),

  // AI-generated aggregate summary of a activity's comments. 200 with
  // available:false until the first summary has been generated.
  getCommentSummary: async (id) => request(`/activities/${id}/comment/summary`),
},

  // ===============================
  // COMMENTS (voting + moderation)
  // ===============================
  //
  // Vote is its own top-level route (a vote targets a comment directly,
  // not an activity) — see comment/adapters/http/handler.go
  // RegisterVoteRoute / RegisterModerationRoutes.

  comments: {
    vote: async (commentId, value) =>
      request(`/comment/${commentId}/vote`, { method: "POST", body: { value } }),

    getModerationQueue: async () => request("/moderator/comment/queue"),
    approveComment: async (id) => request(`/moderator/comment/${id}/approve`, { method: "POST" }),
    rejectComment: async (id) => request(`/moderator/comment/${id}/reject`, { method: "POST" }),
  },







  // ===============================
  // CIRCLE
  // ===============================


  circle: {
  getCircle: async () => request("/circle"),
  getIncomingRequests: async () => request("/circle/requests/incoming"),
  getOutgoingRequests: async () => request("/circle/requests/outgoing"),

  sendRequestByHandle: async (handle) =>
    request("/circle/requests", { method: "POST", body: { handle } }),
  sendRequestByUserId: async (userId) =>
    request("/circle/requests", { method: "POST", body: { user_id: userId } }),

  acceptRequest: async (requestId) =>
    request(`/circle/requests/${requestId}/accept`, { method: "POST" }),
  declineRequest: async (requestId) =>
    request(`/circle/requests/${requestId}/decline`, { method: "POST" }),

  severConnection: async (connectionId) =>
    request(`/circle/connections/${connectionId}`, { method: "DELETE" }),

  blockUser: async (userId) =>
    request("/circle/blocks", { method: "POST", body: { user_id: userId } }),
  unblockUser: async (userId) =>
    request(`/circle/blocks/${userId}`, { method: "DELETE" }),
  getBlocks: async () => request("/circle/blocks"),
},

users: {
  getById: async (id) => request(`/users/${id}`), // needs the backend addition above
},







 // ===============================
// HANGOUTS
// ===============================

hangouts: {

  // GET /hangouts
  // Optional status: planned | completed | cancelled
  getHangouts: async (status = null) => {

    const query = status
      ? `?status=${encodeURIComponent(status)}`
      : "";

    return request(`/hangouts${query}`);
  },


  // GET /hangouts/:id
  getHangout: async (id) => {

    return request(`/hangouts/${id}`);

  },


  // POST /hangouts
  createHangout: async (data) => {

    return request(
      "/hangouts",
      {
        method: "POST",

        body: {
          title: data.title,
          description:
            data.description || null,

          scheduled_at:
            data.scheduledAt || null,

          activity_id:
            data.activityId || null
        }
      }
    );

  },


  // POST /hangouts/:id/invites
  inviteParticipants: async (
    hangoutId,
    userIds
  ) => {

    return request(
      `/hangouts/${hangoutId}/invites`,
      {
        method: "POST",

        body: {
          user_ids: userIds
        }
      }
    );

  },


  // POST /hangouts/:id/invites/respond
  respondToInvite: async (
    hangoutId,
    accept,
    reason = null
  ) => {

    return request(
      `/hangouts/${hangoutId}/invites/respond`,
      {
        method: "POST",

        body: {
          accept,
          reason
        }
      }
    );

  },


  // POST /hangouts/:id/cancel
  cancelHangout: async (id) => {

    return request(
      `/hangouts/${id}/cancel`,
      {
        method: "POST"
      }
    );

  },


  // POST /hangouts/:id/status
  updateStatus: async (
    id,
    status
  ) => {

    return request(
      `/hangouts/${id}/status`,
      {
        method: "POST",

        body: {
          status
        }
      }
    );

  },


  // GET /hangouts/:id/messages
  getMessages: async (
    id,
    {
      before = null,
      limit = 50
    } = {}
  ) => {

    const params =
      new URLSearchParams();

    if (before) {
      params.set(
        "before",
        before
      );
    }

    if (limit) {
      params.set(
        "limit",
        limit
      );
    }

    const query =
      params.toString();

    return request(
      `/hangouts/${id}/messages${
        query ? `?${query}` : ""
      }`
    );

  },


  // POST /hangouts/:id/messages
  sendMessage: async (
    id,
    content
  ) => {

    return request(
      `/hangouts/${id}/messages`,
      {
        method: "POST",

        body: {
          content
        }
      }
    );

  },


  // GET /hangouts/:id/pin
  getMeetupPin: async (id) => {

    return request(
      `/hangouts/${id}/pin`
    );

  },


  // POST /hangouts/:id/pin
  proposeMeetupPin: async (
    id,
    data
  ) => {

    return request(
      `/hangouts/${id}/pin`,
      {
        method: "POST",

        body: {
          place_name:
            data.place_name,

          address:
            data.address || null,

          latitude:
            data.latitude,

          longitude:
            data.longitude,

          scheduled_at:
            data.scheduled_at || null
        }
      }
    );

  },


  // POST /hangouts/:id/pin/respond
  respondToMeetupPin: async (
    id,
    confirm
  ) => {

    return request(
      `/hangouts/${id}/pin/respond`,
      {
        method: "POST",

        body: {
          confirm
        }
      }
    );

  },


  // GET /hangouts/pending-upload-prompt
  // The logic (ListPendingUploadPromptsUseCase) lives in the archive
  // module, but it's mounted onto the hangout route group — see
  // RegisterUploadPromptRoute in archive/adapters/http/handler.go.
  getPendingUploadPrompts: async () => {

    return request(
      "/hangouts/pending-upload-prompt"
    );

  }

},







  // ===============================
  // ARCHIVE
  // ===============================


  archive:{


    // GET /archives
    getArchives:
      async()=>{

        return request(
          "/archives"
        );

      },


    // GET /archives/:id
    getArchive:
      async(id)=>{

        return request(
          `/archives/${id}`
        );

      },


    // POST /archives/:id/media (multipart/form-data: file, media_type,
    // duration_seconds). durationSeconds is required by the backend
    // for video/audio and ignored otherwise.
    uploadMedia:
      async(
        archiveId,
        file,
        durationSeconds = null
      )=>{

        const formData = new FormData();

        formData.append("file", file);
        formData.append(
          "media_type",
          mediaTypeFromFile(file)
        );

        if (durationSeconds != null) {
          formData.append(
            "duration_seconds",
            String(Math.round(durationSeconds))
          );
        }

        return requestMultipart(
          `/archives/${archiveId}/media`,
          formData
        );

      },


    // NOTE: archive/adapters/http/handler.go only exposes archive-level
    // personal delete (POST /:id/delete) — there is no per-media
    // delete route yet, so this stays unimplemented until the backend
    // adds one. ArchiveDetail.jsx doesn't offer a "hide this media"
    // action for the same reason.
    deleteMediaForMe:
      async(
        archiveId,
        mediaId
      )=>{

        throw new Error(
          "Hiding individual media isn't available yet."
        );

      },


    // POST /archives/:id/delete — sets the caller's personal-delete
    // flag. Once every participant has done this the backend purges
    // the archive server-side; the response's `purged` flag reflects
    // whether that just happened.
    deleteArchiveForMe:
      async(
        archiveId
      )=>{

        return request(
          `/archives/${archiveId}/delete`,
          { method: "POST" }
        );

      }


  },







  // ===============================
  // BADGES
  // ===============================


  badges:{


    getBadges:
      async()=>{


        return null;


      },


    toggleVisibility:
      async(id)=>{


        return null;


      }


  }



};






export const getAuthHeaders = () => {


  const token =
    localStorage.getItem(
      "access_token"
    );



  return {


    "Content-Type":
      "application/json",


    Authorization:
      token
        ? `Bearer ${token}`
        : ""

  };


};
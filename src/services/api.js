const API_BASE_URL = 'https://api.duster.ir';
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

    throw new Error(
      data.error ||
      `Request failed (${response.status})`
    );

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


  activities:{


    getRecommendations:
      async()=>{


        return null;


      },


    getActivity:
      async(id)=>{


        return null;


      },


    getActivityDetails:
      async(id)=>{


        return null;


      },


    getComments:
      async(id)=>{


        return null;


      },


    addComment:
      async(
        activityId,
        comment
      )=>{


        return null;


      },


    addRating:
      async(
        activityId,
        rating
      )=>{


        return null;


      },


    createActivity:
      async(data)=>{


        return null;


      }


  },







  // ===============================
  // CIRCLE
  // ===============================


  circle:{


    getCircle:
      async()=>{


        return null;


      },


    getRequests:
      async()=>{


        return null;


      },


    sendRequest:
      async(userId)=>{


        return null;


      },


    acceptRequest:
      async(id)=>{


        return null;


      },


    rejectRequest:
      async(id)=>{


        return null;


      },


    removeFriend:
      async(id)=>{


        return null;


      }


  },







  // ===============================
  // HANGOUTS
  // ===============================


  hangouts:{


    getHangouts:
      async()=>{


        return null;


      },


    createHangout:
      async(data)=>{


        return null;


      },


    inviteUser:
      async(
        hangoutId,
        userId
      )=>{


        return null;


      },


    cancelHangout:
      async(id)=>{


        return null;


      }


  },








  // ===============================
  // ARCHIVE
  // ===============================


  archive:{


    getArchives:
      async()=>{


        return null;


      },


    getArchive:
      async(id)=>{


        return null;


      },


    uploadMedia:
      async(
        archiveId,
        file
      )=>{


        return null;


      },


    deleteMediaForMe:
      async(
        archiveId,
        mediaId
      )=>{


        return null;


      },


    deleteArchiveForMe:
      async(
        archiveId
      )=>{


        return null;


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





export {
  API_BASE_URL
};
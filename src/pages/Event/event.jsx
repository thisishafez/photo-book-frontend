import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Event.css';
import Navbar from '../../components/Navbar/Navbar';
import PhotoGrid from '../../components/PhotoGrid/PhotoGrid';
import { useNotifications } from '../../contexts/NotificationContext';
import { api } from '../../services/api';

const API_BASE_URL = 'https://yadegar-api.duster.ir';


export default function Event() {

  const { id } = useParams();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();


  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);


  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);


  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);


  const [tagMessage, setTagMessage] = useState(null);


  let currentUser = {};

try {
  const storedUser = localStorage.getItem('user');

  if (storedUser && storedUser !== 'undefined') {
    currentUser = JSON.parse(storedUser);
  }
} catch (error) {
  console.warn('[Event] Invalid user data in localStorage:', error);
}



  /*
    Load Event
    GET /events/{id}
  */

  useEffect(() => {

    const loadEvent = async () => {

      try {

        setIsLoading(true);

        console.log(
          '[Event] Loading event:',
          id
        );


        const response = await api.gallery.getEvent(id);


        console.log(
          '[Event] Raw response:',
          response
        );



        const fixedPhotos =
          (response.photos || []).map(photo => ({

            ...photo,

            url:
              photo.url.startsWith('http')
                ? photo.url
                :
                `${API_BASE_URL}${photo.url}`

          }));



        setEvent({

          ...response.event,

          members:
            response.members || [],


          photos:
            fixedPhotos

        });



      } catch(error) {


        console.error(
          '[Event] Failed loading event:',
          error
        );


        setEvent(null);



      } finally {

        setIsLoading(false);

      }

    };


    loadEvent();


  }, [id]);





  /*
    Search users for tagging

    GET /users/search?q=text
  */

  useEffect(() => {


    if (!searchQuery.trim()) {

      setSearchResults([]);
      return;

    }



    const timer = setTimeout(async () => {


      try {


        setIsSearching(true);



        console.log(
          '[Event] Searching users:',
          searchQuery
        );



        const response =
          await api.users.search(searchQuery);



        console.log(
          '[Event] User search response:',
          response
        );



        /*
          API documentation says:
          {
             results:[
                {id, username}
             ]
          }

          Previous code expected users[]
        */


        const users =
          response.results ||
          response.users ||
          [];




        const existingMembers =
          event?.members?.map(
            member => member.user_id
          ) || [];




        const filteredUsers =
          users.filter(
            user =>
              !existingMembers.includes(user.id)
          );




        setSearchResults(
          filteredUsers
        );



      } catch(error) {


        console.error(
          '[Event] Search failed:',
          error
        );


        setSearchResults([]);



      } finally {


        setIsSearching(false);


      }



    }, 400);



    return () =>
      clearTimeout(timer);



  }, [
    searchQuery,
    event
  ]);





  const handleLogout = () => {

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/login');

  };





  const handleFileSelect = (e) => {


    if (e.target.files.length > 0) {

      setSelectedFile(
        e.target.files[0]
      );

    }

  };
    /*
    Upload photo

    POST /events/{id}/photos
    multipart/form-data
    field: file
  */

  const handleUpload = async () => {


    if (!selectedFile) {
      return;
    }



    try {


      setIsUploading(true);



      console.log(
        '[Event] Uploading photo:',
        selectedFile.name
      );



      const uploaded =
        await api.gallery.uploadPhoto(
          id,
          selectedFile
        );



      console.log(
        '[Event] Upload response:',
        uploaded
      );



      const photo = {

        ...uploaded,

        url:
          uploaded.url.startsWith('http')
            ?
            uploaded.url
            :
            `${API_BASE_URL}${uploaded.url}`

      };




      setEvent(prev => ({

        ...prev,

        photos:[
          ...(prev.photos || []),
          photo
        ]

      }));




      setSelectedFile(null);

      setShowUploadModal(false);



    } catch(error) {



      console.error(
        '[Event] Upload failed:',
        error
      );



      if (
        error.message.includes(
          'EVENT_PHOTO_LIMIT_REACHED'
        )
      ) {


        setTagMessage({

          type:'error',

          text:
            'This event is full. Maximum 10 photos allowed.'

        });


      } else {


        setTagMessage({

          type:'error',

          text:
            'Photo upload failed.'

        });


      }




    } finally {


      setIsUploading(false);


    }


  };







  /*
    Tag user

    POST /events/{id}/members

    body:
    {
      user_id
    }

  */


  const handleTag = async (userId) => {



    const selectedUser =
      searchResults.find(
        user =>
          user.id === userId
      );



    if (!selectedUser) {
      return;
    }





    try {


      console.log(
        '[Event] Tagging user:',
        selectedUser
      );



      const member =
        await api.gallery.tagUser(
          id,
          userId
        );




      console.log(
        '[Event] Tag response:',
        member
      );




      setEvent(prev => ({

        ...prev,

        members:[

          ...(prev.members || []),

          {

            ...member,

            username:
              selectedUser.username

          }

        ]

      }));





      setTagMessage({

        type:'success',

        text:
          `${selectedUser.username} invited`

      });




      setSearchQuery('');

      setSearchResults([]);

      setShowTagModal(false);





    } catch(error) {



      console.error(
        '[Event] Tag failed:',
        error
      );



      let message =
        'Failed to tag user';



      if (
        error.message.includes(
          'ALREADY_MEMBER'
        )
      ) {


        message =
          'This user is already in the event';


      }



      if (
        error.message.includes(
          'TAG_REJECTED'
        )
      ) {


        message =
          'This user previously rejected the invitation';


      }




      setTagMessage({

        type:'error',

        text:message

      });



    }


  };








  /*
    Member approval

    NOTE:
    Backend docs mention status changes
    but do not provide endpoint names.

    Keep temporary UI update until
    backend endpoint is confirmed.

  */


  const handleApprove = async (memberId) => {

  try {

    await api.notifications.approveMember(memberId);


    // reload event data
    loadEvent();


  } catch(error) {

    console.error(
      "Approve failed",
      error
    );

  }

};

  const handleRejectMember = async (memberId) => {


    console.log(
      '[Event] Rejecting member:',
      memberId
    );



    setEvent(prev => ({

      ...prev,

      members:
        prev.members.map(member =>

          member.id === memberId

          ?
          {
            ...member,
            status:'rejected'
          }

          :
          member

        )

    }));



    setTagMessage({

      type:'error',

      text:
        'Invitation rejected'

    });



  };








  const getStatusBadge = (status) => {


    const badges = {


      approved: {

        label:'✓ Approved',

        class:'status-approved'

      },


      invited: {

        label:'⏳ Pending',

        class:'status-invited'

      },


      rejected: {

        label:'✕ Declined',

        class:'status-rejected'

      }


    };



    return (
      badges[status]
      ||
      {
        label:status,
        class:''
      }
    );


  };







  if (isLoading) {


    return (

      <div className="event-page">

        <Navbar
          onLogout={handleLogout}
          unreadCount={unreadCount}
        />


        <main className="event-main">

          <div className="event-container">


            <div className="event-loading">

              <div className="loading-spinner"></div>

              <p>
                Opening collection...
              </p>

            </div>


          </div>

        </main>


      </div>

    );


  }





  if (!event) {


    return (

      <div className="event-page">


        <Navbar
          onLogout={handleLogout}
          unreadCount={unreadCount}
        />


        <main className="event-main">


          <div className="event-container">


            <div className="event-not-found">


              <span className="not-found-icon">
                📔
              </span>


              <h2>
                Collection not found
              </h2>


              <p>
                This collection may have been removed or you don't have access.
              </p>


              <button
                onClick={() => navigate('/')}
                className="back-btn"
              >

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


      <Navbar
        onLogout={handleLogout}
        unreadCount={unreadCount}
      />



      <main className="event-main">


        <div className="event-container">


          <button
            onClick={() => navigate('/')}
            className="back-btn"
          >
            ← Back to Gallery
          </button>




          <div className="event-header">


            <div className="event-header-left">


              <h1 className="event-title">
                {event.name}
              </h1>



              <p className="event-meta">

                {event.photos?.length || 0}
                {' '}
                photographs
                {' • '}
                {
                  event.members?.filter(
                    m => m.status === 'approved'
                  ).length || 0
                }
                {' '}
                members

              </p>


            </div>




            <div className="event-actions">


              <button

                className="action-btn"

                onClick={() =>
                  setShowTagModal(true)
                }

              >

                + Tag Someone

              </button>




              <button

                className="action-btn primary"

                onClick={() =>
                  setShowUploadModal(true)
                }

              >

                + Upload Photo

              </button>


            </div>


          </div>





          {tagMessage && (

            <div
              className={
                `tag-message ${tagMessage.type}`
              }
            >

              {tagMessage.text}

            </div>

          )}






          <section className="members-section">


            <h2 className="section-title">
              Members
            </h2>



            <div className="members-grid">


              {
                event.members?.map(member => {


                  const badge =
                    getStatusBadge(
                      member.status
                    );



                  const isCurrentUser =
                    member.user_id === currentUser.id;



                  const showActions =
                    isCurrentUser &&
                    member.status === 'invited';





                  return (

                    <div

                      key={member.id}

                      className="member-card"

                    >


                      <span className="member-avatar">

                        {
                          member.username
                            ?
                            member.username
                              .charAt(0)
                              .toUpperCase()
                            :
                            '?'
                        }

                      </span>




                      <span className="member-name">

                        {
                          member.username ||
                          member.user_id
                        }

                      </span>





                      <span

                        className={
                          `member-status ${badge.class}`
                        }

                      >

                        {badge.label}

                      </span>






                      {
                        member.tagged_by && (

                          <span className="member-tagged-by">

                            tagged by {member.tagged_by}

                          </span>

                        )
                      }





                      {
                        showActions && (

                          <div className="member-actions">


                            <button

                              className="member-action approve"

                              onClick={() =>
                                handleApproveMember(
                                  member.id
                                )
                              }

                            >

                              ✓ Approve

                            </button>




                            <button

                              className="member-action reject"

                              onClick={() =>
                                handleRejectMember(
                                  member.id
                                )
                              }

                            >

                              ✕ Decline

                            </button>


                          </div>

                        )
                      }



                    </div>

                  );


                })

              }



            </div>


          </section>






          <section className="photos-section">


            <h2 className="section-title">
              Photographs
            </h2>



            <PhotoGrid
              photos={
                event.photos || []
              }
            />


          </section>



        </div>


      </main>







      {
        showUploadModal && (


          <div

            className="modal-overlay"

            onClick={() =>
              setShowUploadModal(false)
            }

          >


            <div

              className="modal-content"

              onClick={
                e => e.stopPropagation()
              }

            >



              <button

                className="modal-close"

                onClick={() =>
                  setShowUploadModal(false)
                }

              >

                ✕

              </button>




              <h3 className="modal-title">

                Upload Photograph

              </h3>






              {
                isUploading

                ?

                (

                  <div className="upload-progress">

                    <div className="progress-text">

                      Uploading...

                    </div>


                  </div>

                )


                :

                (

                  <div className="upload-form">


                    <div className="file-drop-zone">


                      <input

                        type="file"

                        accept="image/*"

                        onChange={handleFileSelect}

                        className="file-input"

                        id="photo-upload"

                      />



                      <label

                        htmlFor="photo-upload"

                        className="file-label"

                      >


                        {
                          selectedFile

                          ?

                          `📷 ${selectedFile.name}`

                          :

                          '📸 Select photo'

                        }


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

                        disabled={!selectedFile}

                        onClick={handleUpload}

                      >

                        Upload Photo

                      </button>


                    </div>


                  </div>


                )

              }



            </div>


          </div>


        )

      }








      {
        showTagModal && (


          <div

            className="modal-overlay"

            onClick={() =>
              setShowTagModal(false)
            }

          >


            <div

              className="modal-content"

              onClick={
                e => e.stopPropagation()
              }

            >



              <button

                className="modal-close"

                onClick={() =>
                  setShowTagModal(false)
                }

              >

                ✕

              </button>





              <h3 className="modal-title">

                Tag Someone

              </h3>






              <input

                type="text"

                placeholder="Search username..."

                value={searchQuery}

                onChange={
                  e =>
                    setSearchQuery(
                      e.target.value
                    )
                }

                className="tag-search-input"

                autoFocus

              />








              {
                isSearching && (

                  <p>
                    Searching...
                  </p>

                )
              }








              {
                !isSearching &&
                searchResults.length > 0 && (


                  <div className="search-results">


                    {
                      searchResults.map(user => (


                        <div

                          key={user.id}

                          className="search-result-item"

                          onClick={() =>
                            handleTag(user.id)
                          }

                        >


                          <span>

                            {user.username}

                          </span>



                          <button>

                            Tag

                          </button>



                        </div>


                      ))

                    }


                  </div>


                )
              }






              {
                !isSearching &&
                searchQuery &&
                searchResults.length === 0 && (

                  <p>
                    No users found
                  </p>

                )
              }



            </div>


          </div>


        )

      }



    </div>


  );


}
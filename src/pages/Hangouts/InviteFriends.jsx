import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useNotifications } from "../../contexts/NotificationContext";

import Navbar from "../../components/Navbar/Navbar";

import { getUserProfile } from "../../utils/userCache";

import "./InviteFriends.css";


// The backend serializes Go structs without json tags
const getId = (obj) => obj?.id ?? obj?.ID;


const getUserName = (user) =>
  user?.display_name ||
  user?.displayName ||
  user?.username ||
  user?.name ||
  "User";



export default function InviteFriends() {

  const { id: hangoutId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();

  const { darkMode } = useTheme();
  const { unreadCount } = useNotifications();


  const [friends, setFriends] = useState([]);
  const [selected, setSelected] = useState([]);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");



  useEffect(() => {

    const loadFriends = async () => {

      try {

        setLoading(true);


        const data = await api.circle.getCircle();


        const connections = Array.isArray(data)
          ? data
          : data?.connections ||
            data?.friends ||
            data?.users ||
            data?.data ||
            [];



        const myId = getId(user);



        const enriched = await Promise.all(

          connections.map(async (conn) => {


            const requesterId =
              conn.RequesterID ||
              conn.requester_id;


            const addresseeId =
              conn.AddresseeID ||
              conn.addressee_id;



            const otherId =
              String(requesterId) === String(myId)
                ? addresseeId
                : requesterId;



            const profile =
              await getUserProfile(otherId);



            return {

              id: otherId,

              display_name:
                profile?.display_name,

              username:
                profile?.handle,

            };

          })

        );


        setFriends(enriched);



      } catch (err) {


        setError(
          err.message ||
          "Unable to load your friends."
        );


      } finally {

        setLoading(false);

      }

    };


    loadFriends();


  }, [user]);





  const toggleUser = (userId) => {

    setSelected((previous) =>

      previous.includes(userId)

        ? previous.filter(
            (id) => id !== userId
          )

        : [
            ...previous,
            userId
          ]

    );

  };





  const handleSubmit = async (event) => {

    event.preventDefault();



    if (selected.length === 0) {

      setError(
        "Select at least one friend."
      );

      return;

    }



    try {

      setSending(true);
      setError("");



      await api.hangouts.inviteParticipants(
        hangoutId,
        selected
      );



      navigate(`/hangout/${hangoutId}`);



    } catch (err) {


      setError(
        err.message ||
        "Unable to send invitations."
      );


    } finally {

      setSending(false);

    }

  };





  return (

    <>

      <Navbar unreadCount={unreadCount} />



      <div
        className={`invite-friends-page ${darkMode ? "invite-friends-page-dark kh-dark" : ""}`}
      >


        <main className="invite-friends-container">


          <h1>
            Invite Friends
          </h1>



          {error && (

            <div className="invite-error">

              {error}

            </div>

          )}





          {loading ? (

            <p>
              Loading friends...
            </p>



          ) : friends.length === 0 ? (


            <p>
              You don't have any friends to invite.
            </p>



          ) : (


            <form
              onSubmit={handleSubmit}
              className="invite-form"
            >



              <div className="friend-list">


                {friends.map((friend) => {


                  const userId = friend.id;



                  return (

                    <label
                      key={userId}
                      className="friend-list-item"
                    >


                      <input

                        type="checkbox"

                        checked={
                          selected.includes(userId)
                        }

                        onChange={() =>
                          toggleUser(userId)
                        }

                      />


                      <span>
                        {getUserName(friend)}
                      </span>


                    </label>

                  );


                })}


              </div>




              <button

                type="submit"

                disabled={
                  sending ||
                  selected.length === 0
                }

                className="invite-submit"

              >

                {sending

                  ? "Sending..."

                  : `Invite ${selected.length} friend${
                      selected.length === 1
                        ? ""
                        : "s"
                    }`

                }


              </button>



            </form>


          )}



        </main>


      </div>


    </>

  );

}
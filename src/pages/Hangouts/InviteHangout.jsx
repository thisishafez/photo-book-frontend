import {
  useEffect,
  useState
} from "react";


import {
  useParams,
  useNavigate
} from "react-router-dom";


import {
  api
} from "../../services/api";


import {
  useTheme
} from "../../contexts/ThemeContext";

import {
  useAuth
} from "../../contexts/AuthContext";

import {
  getUserProfile
} from "../../utils/userCache";


import "./InviteHangout.css";


// The backend serializes Go structs without json tags, so responses
// come back with capitalized field names (ID, not id). Read both so
// this keeps working whether or not that ever gets fixed server-side.
const getId = (obj) => obj?.id ?? obj?.ID;


export default function InviteHangout() {

  const {
    id: activityId
  } = useParams();


  const navigate =
    useNavigate();


  const { darkMode } =
    useTheme();


  const { user } =
    useAuth();


  const [
    friends,
    setFriends
  ] = useState([]);


  const [
    selected,
    setSelected
  ] = useState([]);


  const [
    title,
    setTitle
  ] = useState("");


  const [
    scheduledAt,
    setScheduledAt
  ] = useState("");


  const [
    description,
    setDescription
  ] = useState("");


  const [
    loading,
    setLoading
  ] = useState(false);


  const [
    error,
    setError
  ] = useState(null);


  useEffect(() => {

    loadFriends();

  }, []);


  const loadFriends = async () => {

    try {

      const data =
        await api.circle.getCircle();

      const connections =
        Array.isArray(data)
          ? data
          : (
              data.connections ||
              data.users ||
              []
            );

      // getCircle() returns raw connection records
      // ({ID, RequesterID, AddresseeID, ...}), not friend
      // profiles. Resolve the other side of each connection and
      // look up their profile, same as CircleList.jsx does.
      const myId = getId(user);

      const enriched = await Promise.all(
        connections.map(async (conn) => {

          const requesterId =
            conn.RequesterID || conn.requester_id;

          const addresseeId =
            conn.AddresseeID || conn.addressee_id;

          const otherId =
            requesterId === myId
              ? addresseeId
              : requesterId;

          const profile =
            await getUserProfile(otherId);

          return {
            id: otherId,
            username: profile.handle,
            display_name: profile.display_name
          };

        })
      );

      setFriends(enriched);

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Failed to load friends."
      );

    }

  };


  const toggle = (friend) => {

    setSelected(
      (current) => {

        if (
          current.includes(
            friend.id
          )
        ) {

          return current.filter(
            id => id !== friend.id
          );

        }


        return [
          ...current,
          friend.id
        ];

      }
    );

  };


  const create = async () => {

    if (!title.trim()) {

      setError(
        "Please enter a hangout title."
      );

      return;

    }


    setLoading(true);
    setError(null);


    try {

      const hangout =
        await api.hangouts.createHangout({

          activityId,

          title:
            title.trim(),

          description:
            description.trim() ||
            null,

          scheduledAt:
            scheduledAt
              ? new Date(
                  scheduledAt
                ).toISOString()
              : null

        });


      const hangoutId =
        getId(hangout);


      if (
        selected.length > 0
      ) {

        const results =
          await api.hangouts
            .inviteParticipants(
              hangoutId,
              selected
            );


        console.log(
          "Invite results:",
          results
        );

      }


      navigate(
        `/hangout/${hangoutId}`
      );

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Failed to create hangout."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className={`invite-hangout-page ${darkMode ? "kh-dark" : ""}`}>

      <main
        className="invite-hangout-container"
      >

        <button
          className="invite-hangout-back"
          onClick={() =>
            navigate(
              `/activity/${activityId}`
            )
          }
        >
          ← Back to Activity
        </button>


        <header
          className="invite-hangout-header"
        >

          <h1>
            Create Hangout
          </h1>

          <p>
            Plan your hangout and invite
            friends.
          </p>

        </header>


        {error && (

          <div className="invite-error">
            {error}
          </div>

        )}


        <div className="invite-form">

          <label>

            <span>
              Hangout title
            </span>

            <input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Friday hiking"
            />

          </label>


          <label>

            <span>
              Date and time
            </span>

            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) =>
                setScheduledAt(
                  event.target.value
                )
              }
            />

          </label>


          <label>

            <span>
              Description
            </span>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Optional details..."
            />

          </label>

        </div>


        <h2>
          Invite Friends
        </h2>


        <div
          className="invite-friends-list"
        >

          {friends.map(
            (friend) => (

              <label
                key={friend.id}
                className={
                  `invite-friend-row ${
                    selected.includes(
                      friend.id
                    )
                      ? "selected"
                      : ""
                  }`
                }
              >

                <div
                  className="invite-friend-info"
                >

                  <div
                    className="invite-friend-avatar"
                  >
                    {(
                      friend.username ||
                      friend.display_name ||
                      "?"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>


                  <span
                    className="invite-friend-name"
                  >
                    {
                      friend.username ||
                      friend.display_name ||
                      "Unknown user"
                    }
                  </span>

                </div>


                <input
                  className="invite-checkbox"
                  type="checkbox"
                  checked={
                    selected.includes(
                      friend.id
                    )
                  }
                  onChange={() =>
                    toggle(friend)
                  }
                />

              </label>

            )
          )}

        </div>


        <div className="invite-summary">

          {selected.length === 0

            ? "No friends selected. This will create a solo hangout."

            : `${selected.length} friend(s) selected`

          }

        </div>


        <div className="invite-actions">

          <button
            className="invite-create-btn"
            disabled={loading}
            onClick={create}
          >

            {loading
              ? "Creating..."
              : "Create Hangout"
            }

          </button>

        </div>

      </main>

    </div>

  );

}
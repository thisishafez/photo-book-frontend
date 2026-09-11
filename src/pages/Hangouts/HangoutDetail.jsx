import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../../services/api";
import { getUserProfile } from "../../utils/userCache";
import { normalizeHangout } from "../../utils/normalizeHangout";
import { useTheme } from "../../contexts/ThemeContext";

import Navbar from "../../components/Navbar/Navbar";
import ChatBox from "../../components/ChatBox/ChatBox.jsx";
import MeetupPin from "../../components/MeetupPin/MeetupPin";
import ParticipantList from "../../components/ParticipantList/ParticipantList";
import InviteResponse from "../../components/InviteResponse/InviteResponse";

import "./HangoutDetail.css";

const getCurrentUserId = () => {
  try {
    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    return (
      user?.id ||
      user?.user_id ||
      user?.account_id ||
      null
    );
  } catch {
    return null;
  }
};

const getParticipants = (hangout) =>
  hangout?.participants || [];

const getParticipantUserId = (participant) =>
  participant?.user_id;

const getParticipantStatus = (participant) =>
  participant?.status || "pending";

// The participant records only carry a user_id (no embedded
// profile), so ParticipantList would otherwise show "Participant"
// for everyone. Resolve real names the same way InviteHangout.jsx
// resolves friends.
const enrichParticipants = async (participants) =>
  Promise.all(
    participants.map(async (participant) => {
      if (!participant.user_id) return participant;

      const profile = await getUserProfile(
        participant.user_id
      );

      return {
        ...participant,
        display_name: profile?.display_name,
        username: profile?.handle,
      };
    })
  );

const getActivityName = (hangout) => {
  if (!hangout?.activity) {
    return null;
  }

  if (typeof hangout.activity === "string") {
    return hangout.activity;
  }

  return (
    hangout.activity.title ||
    hangout.activity.name ||
    hangout.activity_type ||
    null
  );
};

const formatStatus = (status) => {
  switch (status) {
    case "planned":
      return "Planned";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    case "ongoing":
      return "Ongoing";

    default:
      return status || "Unknown";
  }
};

export default function HangoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const currentUserId = getCurrentUserId();

  const [hangout, setHangout] = useState(null);
  const [pin, setPin] = useState(null);

  const [loading, setLoading] = useState(true);
  const [pinLoading, setPinLoading] = useState(true);

  const [error, setError] = useState("");
  const [pinError, setPinError] = useState("");

  const [cancelling, setCancelling] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [starting, setStarting] = useState(false);

  const loadHangout = async () => {
    try {
      const response =
        await api.hangouts.getHangout(id);

      // GetHangoutUseCase returns a detail object that nests the
      // actual hangout fields (Title, Status, OrganizerID, ...)
      // under a "Hangout" key, with Participants sitting alongside
      // it at the top level — unlike the list endpoint, which
      // returns domain.Hangout structs flat. Checking only
      // response?.hangout (lowercase) missed the capitalized
      // "Hangout" key entirely, so normalizeHangout ended up
      // running on an object with no title/status/organizer_id at
      // all (participants happened to still work because they're
      // top-level on the response either way). Merge both levels
      // so every field is reachable regardless of shape.
      const hangoutContainer =
        response?.hangout ||
        response?.Hangout ||
        response?.data ||
        response;

      const normalized = normalizeHangout({
        ...response,
        ...hangoutContainer,
      });

      const enrichedParticipants =
        await enrichParticipants(
          normalized?.participants || []
        );

      setHangout(
        normalized && {
          ...normalized,
          participants: enrichedParticipants,
        }
      );

      setError("");
    } catch (err) {
      setError(
        err.message ||
          "Unable to load this hangout."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadPin = async (isInitial = false) => {
    try {
      // Only show the "Loading meetup pin..." placeholder on the
      // very first fetch. This function also runs every 5s as a
      // polling substitute for real-time updates (see below) — if
      // we flipped pinLoading back to true on every poll, the
      // MeetupPin component would unmount/remount each time and
      // appear to flicker in and out.
      if (isInitial) {
        setPinLoading(true);
      }

      const response =
        await api.hangouts.getMeetupPin(id);

      if (!response) {
        setPin(null);
        setPinError("");
        return;
      }

      // Same shape issue as loadHangout: the pin endpoint nests the
      // actual pin fields under a "Pin" key, with Confirmations
      // alongside it at the top level. response?.pin (lowercase)
      // never matched, so place_name/address/lat/long always came
      // back empty even though confirmations displayed fine.
      const pinContainer =
        response?.pin ||
        response?.Pin ||
        response?.data ||
        response;

      setPin({
        ...response,
        ...pinContainer,
      });

      setPinError("");
    } catch (err) {
      // 404 means that no pin exists yet.
      if (err.status === 404) {
        setPin(null);
        setPinError("");
      } else {
        setPinError(
          err.message ||
            "Unable to load meetup pin."
        );
      }
    } finally {
      setPinLoading(false);
    }
  };

  useEffect(() => {
    loadHangout();
    loadPin(true);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    // Temporary real-time substitute until
    // a WebSocket backend is implemented.
    const interval = setInterval(() => {
      loadPin();
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  const participants = useMemo(
    () => getParticipants(hangout),
    [hangout]
  );

  const currentParticipant = useMemo(() => {
    if (!currentUserId) return null;

    return participants.find(
      (participant) =>
        String(
          getParticipantUserId(participant)
        ) === String(currentUserId)
    );
  }, [
    participants,
    currentUserId,
  ]);

  const inviteStatus =
    currentParticipant
      ? getParticipantStatus(
          currentParticipant
        ).toLowerCase()
      : null;

  const isOrganizer =
    !!currentUserId &&
    String(hangout?.organizer_id) ===
      String(currentUserId);

  const isFinal =
    hangout?.status === "completed" ||
    hangout?.status === "cancelled";

  const handleCancel = async () => {
    if (
      cancelling ||
      !window.confirm(
        "Are you sure you want to cancel this hangout?"
      )
    ) {
      return;
    }

    try {
      setCancelling(true);
      setError("");

      await api.hangouts.cancelHangout(id);

      await loadHangout();
    } catch (err) {
      setError(
        err.message ||
          "Unable to cancel hangout."
      );
    } finally {
      setCancelling(false);
    }
  };

  // POST /hangouts/:id/status { status: "ongoing" }. Nothing in this
  // app ever moved a hangout out of "planned" before, which meant
  // handleComplete's target state ("ongoing") was unreachable and its
  // button never showed. The /status endpoint validates "the correct
  // next step" generically, so it's the same call as handleComplete
  // with a different target status.
  const handleStart = async () => {
    if (starting) {
      return;
    }

    try {
      setStarting(true);
      setError("");

      await api.hangouts.updateStatus(id, "ongoing");

      await loadHangout();
    } catch (err) {
      setError(
        err.message ||
          "Unable to start hangout."
      );
    } finally {
      setStarting(false);
    }
  };

  // POST /hangouts/:id/status { status: "completed" }. Backend only
  // allows this from "ongoing" — planned can't jump straight to
  // completed — so the button only shows in that state. Organizer-only,
  // same as cancel; 403/409/400 come back with a human-readable
  // `error` string from the backend's shared error handler, so surfacing
  // err.message as-is (same as handleCancel) is enough.
  const handleComplete = async () => {
    if (completing) {
      return;
    }

    try {
      setCompleting(true);
      setError("");

      await api.hangouts.updateStatus(id, "completed");

      await loadHangout();
    } catch (err) {
      setError(
        err.message ||
          "Unable to mark hangout as completed."
      );
    } finally {
      setCompleting(false);
    }
  };

  const handleInviteResponded = async () => {
    await loadHangout();
    await loadPin();
  };

  if (loading) {
    return (
      <div
        className={`hangout-detail-page ${
          darkMode ? "kh-dark" : ""
        }`}
      >
        <Navbar />

        <main>
          <p>Loading hangout...</p>
        </main>
      </div>
    );
  }

  if (error && !hangout) {
    return (
      <div
        className={`hangout-detail-page ${
          darkMode ? "kh-dark" : ""
        }`}
      >
        <Navbar />

        <main>
          <p>{error}</p>

          <button
            className="hangout-back-btn"
            type="button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </main>
      </div>
    );
  }

  if (!hangout) {
    return null;
  }

  return (
    <div
      className={`hangout-detail-page ${
        darkMode ? "kh-dark" : ""
      }`}
    >
      <Navbar />

      <main className="hangout-detail-container">
        <button
          className="hangout-back-btn"
          type="button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <header className="hangout-detail-header">
          <div>
            <h1>{hangout.title}</h1>

            {getActivityName(hangout) && (
              <p>
                Activity:{" "}
                {getActivityName(hangout)}
              </p>
            )}

            {hangout.description && (
              <p>{hangout.description}</p>
            )}
          </div>

          <div className="hangout-detail-meta">
            <strong
              className={`hangout-status-badge status-${hangout.status}`}
            >
              {formatStatus(hangout.status)}
            </strong>

            {hangout.scheduled_at && (
              <div>
                Scheduled:{" "}
                {new Date(
                  hangout.scheduled_at
                ).toLocaleString()}
              </div>
            )}
          </div>
        </header>

        {inviteStatus === "pending" && (
          <InviteResponse
            hangoutId={id}
            onResponded={
              handleInviteResponded
            }
          />
        )}

        {isOrganizer && !isFinal && (
          <button
            className="hangout-invite-btn"
            type="button"
            onClick={() =>
              navigate(
                `/hangout/${id}/invite-friends`
              )
            }
          >
            Invite Friends
          </button>
        )}

        <section>
          <ParticipantList
            participants={participants}
            currentUserId={currentUserId}
          />
        </section>

        <section>
          {pinLoading ? (
            <p>Loading meetup pin...</p>
          ) : pinError ? (
            <p>{pinError}</p>
          ) : (
            <MeetupPin
              hangoutId={id}
              pin={pin}
              isOrganizer={isOrganizer}
              currentUserId={currentUserId}
              onPinChanged={async () => {
                await loadPin();
                await loadHangout();
              }}
            />
          )}
        </section>

        {!isFinal && (
          <ChatBox hangoutId={id} />
        )}

        {isOrganizer && hangout.status === "planned" && (
          <button
            className="start-hangout-btn"
            type="button"
            disabled={starting}
            onClick={handleStart}
          >
            {starting
              ? "Starting..."
              : "Start Hangout"}
          </button>
        )}

        {isOrganizer && hangout.status === "ongoing" && (
          <button
            className="complete-hangout-btn"
            type="button"
            disabled={completing}
            onClick={handleComplete}
          >
            {completing
              ? "Marking Completed..."
              : "Mark as Completed"}
          </button>
        )}

        {isOrganizer && !isFinal && (
          <div className="hangout-danger-zone">
            <button
              className="cancel-hangout-btn"
              type="button"
              disabled={cancelling}
              onClick={handleCancel}
            >
              {cancelling
                ? "Cancelling..."
                : "Cancel Hangout"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
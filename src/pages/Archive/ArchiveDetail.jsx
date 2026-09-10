import {
  useEffect,
  useState
}
from "react";

import {
  useNavigate,
  useParams
}
from "react-router-dom";

import Navbar
from "../../components/Navbar/Navbar";

import MediaGrid
from "../../components/MediaGrid/MediaGrid";

import ChatHistory
from "../../components/ChatHistory/ChatHistory";

import UploadMedia
from "../../components/UploadMedia/UploadMedia";

import {
  api
}
from "../../services/api";

import {
  useTheme
}
from "../../contexts/ThemeContext";

import {
  getUserProfile
}
from "../../utils/userCache";

import {
  normalizeHangout
}
from "../../utils/normalizeHangout";

import {
  normalizeArchiveDetail,
  normalizeMedia,
  getChatSnapshotSenderIds
}
from "../../utils/normalizeArchive";

import "./ArchiveDetail.css";


// Same pattern used in HangoutDetail.jsx / ChatBox.jsx.
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
    null
  );

};


// 1 week after the hangout's scheduled end, per the Phase 5 spec.
// The archive record itself doesn't carry this (confirmed against a
// real response) — it's derived client-side from the linked
// hangout's ScheduledEndAt.
const computeUploadWindowEnds = (hangout) => {

  if (!hangout?.scheduled_end_at) {
    return null;
  }

  const end = new Date(hangout.scheduled_end_at).getTime();

  return new Date(
    end + 7 * 24 * 60 * 60 * 1000
  ).toISOString();

};


export default function ArchiveDetail() {


  const {
    id
  } =
    useParams();


  const navigate =
    useNavigate();


  const {
    darkMode
  } =
    useTheme();


  const [
    archive,
    setArchive
  ] =
    useState(null);


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    activeTab,
    setActiveTab
  ] =
    useState("media");


  const [
    deleting,
    setDeleting
  ] =
    useState(false);


  const currentUserId =
    getCurrentUserId();



  useEffect(
  () => {

    loadArchive();

  },
  [id]
);


useEffect(
  () => {

    if (
      archive?.status ===
      "cancelled"
    ) {

      setActiveTab(
        "chat"
      );

    }

  },
  [archive?.status]
);



  const loadArchive =
    async () => {

      try {

        setLoading(
          true
        );


        const raw =
          await api.archive
            .getArchive(
              id
            );


        // First pass: just enough to know the linked hangout id and
        // which sender ids the archived chat references. Confirmed
        // against a real response — GET /archives/:id does NOT embed
        // title/activity/date/location/participants at all, only
        // {Archive: {ID, HangoutID, ChatSnapshot, Status, ...},
        // Media: [...]}. Everything hangout-shaped has to come from
        // a separate hangout fetch.
        const preview =
          normalizeArchiveDetail(
            raw,
            { currentUserId }
          );

        if (!preview) {
          throw new Error("Archive not found.");
        }

        // Same nested-under-a-capitalized-key shape as
        // GetHangoutUseCase (see HangoutDetail.jsx's loadHangout).
        const hangoutRaw =
          await api.hangouts
            .getHangout(preview.hangoutId)
            .catch(() => null);

        const hangoutContainer =
          hangoutRaw?.hangout ||
          hangoutRaw?.Hangout ||
          hangoutRaw?.data ||
          hangoutRaw;

        const hangout =
          hangoutRaw &&
          normalizeHangout({
            ...hangoutRaw,
            ...hangoutContainer,
          });

        // Best-effort — the meetup pin is a separate endpoint and a
        // hangout may never have had one confirmed.
        const pinRaw =
          await api.hangouts
            .getMeetupPin(preview.hangoutId)
            .catch(() => null);

        const pinContainer =
          pinRaw?.pin ||
          pinRaw?.Pin ||
          pinRaw?.data ||
          pinRaw;

        const pin =
          pinRaw && {
            ...pinRaw,
            ...pinContainer,
          };

        // Resolve display names for anyone the archived chat or the
        // hangout's participant list mentions.
        const idsNeedingProfiles = [
          ...new Set(
            [
              ...(hangout?.participants || []).map(
                participant => participant.user_id
              ),
              ...getChatSnapshotSenderIds(
                preview.chatSnapshot
              )
            ].filter(Boolean)
          )
        ];

        const profiles =
          await Promise.all(
            idsNeedingProfiles.map(
              userId =>
                getUserProfile(userId)
                  .then(profile => [userId, profile])
            )
          );

        const senderNames =
          Object.fromEntries(
            profiles.map(
              ([userId, profile]) => [
                userId,
                profile?.display_name ||
                  profile?.handle ||
                  "Participant"
              ]
            )
          );


        const detail =
          normalizeArchiveDetail(
            raw,
            { currentUserId, senderNames }
          );

        const participants =
          (hangout?.participants || []).map(
            participant => ({
              id: participant.user_id,
              userId: participant.user_id,
              displayName:
                senderNames[participant.user_id] ||
                "Participant",
            })
          );

        setArchive({
          ...detail,
          // These all come from the linked hangout, not the archive
          // record itself (see normalizeArchive.js).
          title: hangout?.title || "Hangout",
          activity: getActivityName(hangout),
          date: hangout?.scheduled_at || detail.createdAt,
          location: pin?.place_name || pin?.PlaceName || null,
          uploadWindowEnds: computeUploadWindowEnds(hangout),
          // "Didn't happen" is a property of the HANGOUT's status,
          // not the archive's own active/purged lifecycle flag.
          status: hangout?.status === "cancelled" ? "cancelled" : "completed",
          participants,
        });

      }

      catch (
        error
      ) {

        console.error(
          "Failed to load archive",
          error
        );

      }

      finally {

        setLoading(
          false
        );

      }

    };



  const handleUpload =
    async (file, duration) => {


      const rawMedia =
        await api.archive
          .uploadMedia(
            id,
            file,
            duration
          );


      const media =
        normalizeMedia(
          rawMedia
        );


      setArchive(
        previous => ({

          ...previous,

          media: [
            ...previous.media,
            media
          ],

          mediaCount:
            previous.mediaCount + 1

        })
      );

  };


  // The backend doesn't yet expose a per-media personal-delete route
  // (see services/api.js archive.deleteMediaForMe) — only whole-archive
  // delete exists in Phase 5, so MediaGrid is rendered below without
  // an onDelete handler and its "Hide" button never appears.



  const handleDeleteArchive =
    async () => {


      const confirmed =
        window.confirm(
          "Hide this archive from your account? This will not delete it for the other participants."
        );


      if (!confirmed) {
        return;
      }


      try {

        setDeleting(
          true
        );


        const result =
          await api.archive
            .deleteArchiveForMe(
              id
            );


        if (result?.purged) {

          window.alert(
            "Every participant had hidden this memory, so it's now been permanently deleted for everyone."
          );

        }


        navigate(
          "/archives"
        );

      }

      catch (
        error
      ) {

        console.error(
          "Failed to delete archive",
          error
        );


        setDeleting(
          false
        );

      }

    };



  const formatDate =
    value => {

      if (!value) {
        return "";
      }


      return new Date(
        value
      ).toLocaleString(
        undefined,
        {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }
      );

    };



  const getUploadWindowState =
    () => {


      if (
        !archive?.uploadWindowEnds
      ) {

        return null;

      }


      const end =
        new Date(
          archive.uploadWindowEnds
        );


      const now =
        new Date();


      if (
        now <= end
      ) {

        const milliseconds =
          end - now;


        const daysLeft =
          Math.max(
            1,
            Math.ceil(
              milliseconds /
              (
                1000 *
                60 *
                60 *
                24
              )
            )
          );


        return {
          open: true,
          daysLeft
        };

      }


      return {
        open: false,
        daysLeft: 0
      };

  };



  if (
    loading
  ) {

    return (

      <div
        className={
          `archive-detail-page ${
            darkMode
            ?
            "archive-detail-dark"
            :
            ""
          }`
        }
      >

        <Navbar />

        <div className="archive-detail-state">
          Loading memory...
        </div>

      </div>

    );

  }



  if (
    !archive
  ) {

    return (

      <div
        className={
          `archive-detail-page ${
            darkMode
            ?
            "archive-detail-dark"
            :
            ""
          }`
        }
      >

        <Navbar />

        <div className="archive-detail-state">

          <h2>
            Archive not found
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/archives"
              )
            }
          >
            Back to Archives
          </button>

        </div>

      </div>

    );

  }



  const uploadWindow =
    getUploadWindowState();


  const cancelled =
    archive.status ===
    "cancelled";



  return (

    <div
      className={
        `archive-detail-page ${
          darkMode
          ?
          "archive-detail-dark"
          :
          ""
        }`
      }
    >

      <Navbar />


      <main className="archive-detail-container">


        <button
          type="button"
          className="archive-back-button"
          onClick={() =>
            navigate(
              "/archives"
            )
          }
        >
          ← Back to memories
        </button>



        <section className="archive-detail-hero">

          <div>

            <span className="archive-detail-eyebrow">

              {
                cancelled
                ?
                "Didn't Happen"
                :
                archive.activity
              }

            </span>


            <h1>
              {archive.title}
            </h1>


            <div className="archive-detail-meta">

              <span>
                🗓 {
                  formatDate(
                    archive.date
                  )
                }
              </span>


              {
                archive.location && (

                  <span>
                    📍 {
                      archive.location
                    }
                  </span>

                )
              }


              <span>
                👥 {
                  archive.participants.length
                } participants
              </span>

            </div>

          </div>



          <div className="archive-participants">

            {
              archive.participants
                .slice(
                  0,
                  5
                )
                .map(
                  participant => (

                    <div
                      key={
                        participant.id
                      }
                      className="archive-participant-avatar"
                      title={
                        participant.displayName
                      }
                    >

                      {
                        participant
                          .displayName
                          .charAt(0)
                          .toUpperCase()
                      }

                    </div>

                  )
                )
            }

          </div>

        </section>



        {
          cancelled
          ?
          (

            <div className="archive-cancelled-notice">

              <div>
                ☁️
              </div>

              <div>

                <strong>
                  This hangout didn't happen
                </strong>

                <p>
                  The planning conversation has
                  still been preserved as a
                  memory.
                </p>

              </div>

            </div>

          )
          :
          uploadWindow?.open
          ?
          (

            <div className="archive-upload-prompt">

              <div className="archive-upload-prompt-icon">
                ✨
              </div>

              <div>

                <strong>
                  Add your memories
                </strong>

                <p>
                  The post-hangout upload
                  window is open for about {
                    uploadWindow.daysLeft
                  } more day{
                    uploadWindow.daysLeft === 1
                    ?
                    ""
                    :
                    "s"
                  }.
                </p>

              </div>

              <UploadMedia
                onUpload={
                  handleUpload
                }
              />

            </div>

          )
          :
          !cancelled
          ?
          (

            <div className="archive-later-upload">

              <div>

                <strong>
                  Remember something later?
                </strong>

                <p>
                  You can still add media to
                  an attended hangout after
                  the initial upload window.
                </p>

              </div>


              <UploadMedia
                onUpload={
                  handleUpload
                }
              />

            </div>

          )
          :
          null
        }



        <div className="archive-detail-tabs">

          {
            !cancelled && (

              <button
                type="button"
                className={
                  activeTab ===
                  "media"
                  ?
                  "active"
                  :
                  ""
                }
                onClick={() =>
                  setActiveTab(
                    "media"
                  )
                }
              >
                Media {
                  archive.media.length
                }
              </button>

            )
          }


          <button
            type="button"
            className={
              activeTab ===
              "chat"
              ||
              cancelled
              ?
              "active"
              :
              ""
            }
            onClick={() =>
              setActiveTab(
                "chat"
              )
            }
          >
            Chat {
              archive.messages.length
            }
          </button>

        </div>



        <section className="archive-detail-content">


          {
            !cancelled &&
            activeTab ===
            "media"
            ? (

              <MediaGrid
                media={
                  archive.media
                }
              />

            )
            :
            (

              <ChatHistory
                messages={
                  archive.messages
                }
              />

            )
          }

        </section>



        <section className="archive-danger-zone">

          <div>

            <strong>
              Hide this memory
            </strong>

            <p>
              This only removes the archive
              from your own view. Other
              participants keep their copy.
            </p>

          </div>


          <button
            type="button"
            disabled={
              deleting
            }
            onClick={
              handleDeleteArchive
            }
          >

            {
              deleting
              ?
              "Hiding..."
              :
              "Hide Archive"
            }

          </button>

        </section>


      </main>

    </div>

  );

}
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

import "./ArchiveDetail.css";


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


        const data =
          await api.archive
            .getArchive(
              id
            );


        setArchive(
          data
        );

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
    async file => {


      const media =
        await api.archive
          .uploadMedia(
            id,
            file
          );


      setArchive(
        previous => ({

          ...previous,

          media: [
            ...previous.media,
            media
          ]

        })
      );

  };



  const handleDeleteMedia =
    async mediaId => {


      const confirmed =
        window.confirm(
          "Hide this media from your archive? Other participants will still be able to see it."
        );


      if (!confirmed) {
        return;
      }


      try {

        await api.archive
          .deleteMediaForMe(
            id,
            mediaId
          );


        setArchive(
          previous => ({

            ...previous,

            media:
              previous.media.filter(
                item =>
                  item.id !==
                  mediaId
              )

          })
        );

      }

      catch (
        error
      ) {

        console.error(
          "Failed to hide media",
          error
        );

      }

    };



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


        await api.archive
          .deleteArchiveForMe(
            id
          );


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
                onDelete={
                  handleDeleteMedia
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
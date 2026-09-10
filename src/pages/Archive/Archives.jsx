import {
  useEffect,
  useMemo,
  useState
}
from "react";

import {
  useNavigate
}
from "react-router-dom";

import Navbar
from "../../components/Navbar/Navbar";

import {
  api
}
from "../../services/api";

import {
  useTheme
}
from "../../contexts/ThemeContext";

import {
  normalizeHangout
}
from "../../utils/normalizeHangout";

import {
  normalizeArchiveSummary
}
from "../../utils/normalizeArchive";

import "./Archives.css";


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


export default function Archives() {


  const navigate =
    useNavigate();


  const {
    darkMode
  } =
    useTheme();


  const [
    archives,
    setArchives
  ] =
    useState([]);


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    filter,
    setFilter
  ] =
    useState(
      "completed"
    );



  useEffect(
    () => {

      loadArchives();

    },
    []
  );



  const loadArchives =
    async () => {

      try {

        setLoading(
          true
        );


        const data =
          await api.archive
            .getArchives();


        const list =
          Array.isArray(data)
            ? data
            : (
                data?.archives ||
                data?.data ||
                []
              );


        const summaries =
          list.map(
            normalizeArchiveSummary
          );

        // GET /archives only returns the archive's own record — no
        // title/activity/date/participants (confirmed against a real
        // response). Those live on the linked hangout, so fetch each
        // one and merge it in. N+1, but this mirrors the same
        // pattern ArchiveDetail.jsx / HangoutDetail.jsx already use
        // for resolving participant names.
        const enriched =
          await Promise.all(
            summaries.map(
              async summary => {

                const hangoutRaw =
                  await api.hangouts
                    .getHangout(summary.hangoutId)
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

                return {
                  ...summary,
                  title: hangout?.title || "Hangout",
                  activity: getActivityName(hangout),
                  date: hangout?.scheduled_at || summary.createdAt,
                  location: null,
                  // "Didn't happen" reads off the hangout's status,
                  // not the archive's own active/purged lifecycle
                  // flag (archiveStatus).
                  status:
                    hangout?.status === "cancelled"
                      ? "cancelled"
                      : "completed",
                };

              }
            )
          );

        setArchives(
          enriched
        );

      }

      catch (
        error
      ) {

        console.error(
          "Failed to load archives",
          error
        );

      }

      finally {

        setLoading(
          false
        );

      }

    };



  const filteredArchives =
    useMemo(
      () => {

        return archives.filter(
          archive => {

            if (
              filter ===
              "cancelled"
            ) {

              return (
                archive.status ===
                "cancelled"
              );

            }


            return (
              archive.status !==
              "cancelled"
            );

          }
        );

      },
      [
        archives,
        filter
      ]
    );



  const formatDate =
    value => {

      return new Date(
        value
      ).toLocaleDateString(
        undefined,
        {
          year: "numeric",
          month: "long",
          day: "numeric"
        }
      );

    };



  return (

    <div
      className={
        `archives-page ${
          darkMode
          ?
          "archives-dark"
          :
          ""
        }`
      }
    >

      <Navbar />


      <main className="archives-container">


        <header className="archives-header">

          <div>

            <span className="archives-eyebrow">
              Khātere Archive
            </span>

            <h1>
              My Memories
            </h1>

            <p>
              Revisit the moments,
              conversations and media
              from your hangouts.
            </p>

          </div>

        </header>



        <div className="archive-tabs">

          <button
            type="button"
            className={
              filter === "completed"
              ?
              "active"
              :
              ""
            }
            onClick={() =>
              setFilter(
                "completed"
              )
            }
          >
            Memories
          </button>


          <button
            type="button"
            className={
              filter === "cancelled"
              ?
              "active"
              :
              ""
            }
            onClick={() =>
              setFilter(
                "cancelled"
              )
            }
          >
            Didn't Happen
          </button>

        </div>



        {
          loading
          ?
          (

            <div className="archives-state">
              Loading memories...
            </div>

          )
          :
          filteredArchives.length === 0
          ?
          (

            <div className="archives-state">

              <div>
                🗂️
              </div>

              <h2>
                Nothing here yet
              </h2>

              <p>
                Your past hangouts
                will appear here.
              </p>

            </div>

          )
          :
          (

            <div className="archive-list">

              {
                filteredArchives.map(
                  archive => (

                    <button
                      type="button"
                      key={archive.id}
                      className="archive-card"
                      onClick={() =>
                        navigate(
                          `/archive/${archive.id}`
                        )
                      }
                    >

                      <div className="archive-card-preview">

                        {
                          archive.status ===
                          "cancelled"
                          ?
                          "☁️"
                          :
                          "📸"
                        }

                      </div>


                      <div className="archive-card-content">

                        <div className="archive-card-top">

                          <div>

                            <span className="archive-card-activity">
                              {archive.activity}
                            </span>

                            <h2>
                              {archive.title}
                            </h2>

                          </div>


                          <span className="archive-arrow">
                            →
                          </span>

                        </div>


                        <p className="archive-card-date">
                          {
                            formatDate(
                              archive.date
                            )
                          }
                        </p>


                        {
                          archive.location && (

                            <p className="archive-card-location">
                              📍 {archive.location}
                            </p>

                          )
                        }


                        <div className="archive-card-stats">

                          {
                            archive.status ===
                            "cancelled"
                            ?
                            (

                              <span>
                                💬 {
                                  archive.messagesCount
                                } saved messages
                              </span>

                            )
                            :
                            (
                              // GET /archives doesn't include a media
                              // count — only the full archive detail
                              // does — so this list view just shows
                              // messages; media count shows up once
                              // you open the archive.
                              <span>
                                💬 {
                                  archive.messagesCount
                                } messages
                              </span>
                            )
                          }

                        </div>

                      </div>

                    </button>

                  )
                )
              }

            </div>

          )
        }

      </main>

    </div>

  );

}
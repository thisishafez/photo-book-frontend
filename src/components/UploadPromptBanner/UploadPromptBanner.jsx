import {
  useEffect,
  useState
}
from "react";

import {
  Link
}
from "react-router-dom";

import {
  api
}
from "../../services/api";

import {
  normalizeUploadPrompt
}
from "../../utils/normalizeArchive";

import {
  useTheme
}
from "../../contexts/ThemeContext";

import "./UploadPromptBanner.css";


// Surfaces hangouts whose 1-week post-hangout upload window
// (GET /hangouts/pending-upload-prompt) is still open. There's no
// dismiss-persistence endpoint on the backend, so "dismiss" just
// hides a card locally for the rest of this session.
export default function UploadPromptBanner() {


  const {
    darkMode
  } =
    useTheme();


  const [
    prompts,
    setPrompts
  ] =
    useState([]);


  const [
    dismissed,
    setDismissed
  ] =
    useState(
      () => new Set()
    );


  const [
    loading,
    setLoading
  ] =
    useState(true);



  useEffect(
    () => {

      let cancelled = false;


      const load =
        async () => {

          try {

            const data =
              await api.hangouts
                .getPendingUploadPrompts();


            const list =
              Array.isArray(data)
                ? data
                : (
                    data?.prompts ||
                    data?.data ||
                    []
                  );


            if (!cancelled) {

              setPrompts(
                list.map(
                  normalizeUploadPrompt
                )
              );

            }

          }

          catch (error) {

            console.error(
              "Failed to load upload prompts",
              error
            );


            if (!cancelled) {
              setPrompts([]);
            }

          }

          finally {

            if (!cancelled) {
              setLoading(false);
            }

          }

        };


      load();


      // No push channel yet — poll infrequently, this is a low-
      // urgency reminder rather than live chat/pin data.
      const interval =
        setInterval(
          load,
          60000
        );


      return () => {

        cancelled = true;

        clearInterval(
          interval
        );

      };

    },
    []
  );



  const daysLeft =
    endsAt => {

      if (!endsAt) {
        return null;
      }


      const milliseconds =
        new Date(endsAt) -
        new Date();


      if (
        milliseconds <= 0
      ) {
        return 0;
      }


      return Math.max(
        1,
        Math.ceil(
          milliseconds /
          (
            1000 * 60 * 60 * 24
          )
        )
      );

    };



  const visiblePrompts =
    prompts.filter(
      prompt =>
        !dismissed.has(
          prompt.archiveId
        )
    );



  if (
    loading ||
    visiblePrompts.length === 0
  ) {

    return null;

  }



  return (

    <div
      className={
        `upload-prompt-banner ${
          darkMode
          ?
          "upload-prompt-banner-dark"
          :
          ""
        }`
      }
    >

      {
        visiblePrompts.map(
          prompt => {

            const remaining =
              daysLeft(
                prompt.uploadWindowEnds
              );


            return (

              <div
                className="upload-prompt-card"
                key={
                  prompt.archiveId
                }
              >

                <div className="upload-prompt-icon">
                  📸
                </div>


                <div className="upload-prompt-body">

                  <strong>
                    Add your memories from
                    "{prompt.title}"
                  </strong>

                  <p>
                    {
                      remaining
                      ?
                      `Upload window closes in about ${remaining} day${
                        remaining === 1
                        ?
                        ""
                        :
                        "s"
                      }.`
                      :
                      "The upload window is closing soon."
                    }
                  </p>

                </div>


                <div className="upload-prompt-actions">

                  <Link
                    to={
                      `/archive/${prompt.archiveId}`
                    }
                    className="upload-prompt-cta"
                  >
                    Add photos
                  </Link>


                  <button
                    type="button"
                    className="upload-prompt-dismiss"
                    aria-label="Dismiss"
                    onClick={() =>
                      setDismissed(
                        previous => {

                          const next =
                            new Set(previous);


                          next.add(
                            prompt.archiveId
                          );


                          return next;

                        }
                      )
                    }
                  >
                    ✕
                  </button>

                </div>

              </div>

            );

          }
        )
      }

    </div>

  );

}

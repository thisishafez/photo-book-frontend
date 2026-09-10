import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { useTheme } from "../../contexts/ThemeContext";

import Navbar from "../../components/Navbar/Navbar";

import { api } from "../../services/api";
import { getUserProfile } from "../../utils/userCache";
import { normalizeComments } from "../../utils/normalizeComment";

import "./CommentModeration.css";


export default function CommentModeration() {

  const { user } = useAuth();
  const navigate = useNavigate();

  const { darkMode } = useTheme();
  const { unreadCount } = useNotifications();


  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);



  useEffect(() => {
    if (user?.accountType !== "moderator") return;

    loadQueue();

  }, [user]);



  const loadQueue = async () => {

    setIsLoading(true);
    setError("");

    try {

      const raw = await api.comments.getModerationQueue();

      const normalized = normalizeComments(raw);

      const enriched = await Promise.all(
        normalized.map(async (c) => {

          const profile = c.user_id
            ? await getUserProfile(c.user_id)
            : null;


          return {
            ...c,
            authorLabel:
              profile?.display_name ||
              profile?.handle ||
              "a member"
          };

        })
      );


      setQueue(enriched);


    } catch (err) {

      setError(
        err.message || "Failed to load moderation queue."
      );

    } finally {

      setIsLoading(false);

    }

  };



  const approve = async (id) => {

    setProcessingId(id);

    try {

      await api.comments.approveComment(id);

      setQueue((prev) =>
        prev.filter((c) => c.id !== id)
      );


    } catch (err) {

      alert(err.message);

    } finally {

      setProcessingId(null);

    }

  };



  const reject = async (id) => {

    setProcessingId(id);

    try {

      await api.comments.rejectComment(id);

      setQueue((prev) =>
        prev.filter((c) => c.id !== id)
      );


    } catch (err) {

      alert(err.message);

    } finally {

      setProcessingId(null);

    }

  };



  if (user?.accountType !== "moderator") {

    return (
      <>
        <Navbar unreadCount={unreadCount} />

        <div
          className={`comment-moderation-page${
            darkMode
              ? " comment-moderation-page-dark"
              : ""
          }`}
        >

          <main>

            <h1>
              Moderators only
            </h1>

            <p>
              You don't have access to this page.
            </p>

            <button
              onClick={() => navigate("/")}
            >
              ← Home
            </button>

          </main>

        </div>
      </>
    );

  }



  return (

    <>

      <Navbar unreadCount={unreadCount} />


      <div
        className={`comment-moderation-page${
          darkMode
            ? " comment-moderation-page-dark"
            : ""
        }`}
      >


        <main className="comment-moderation-main">


          <h1>
            Comment Moderation Queue
          </h1>



          {error && (
            <div className="api-error">
              {error}
            </div>
          )}



          {isLoading ? (

            <p>
              Loading...
            </p>


          ) : queue.length === 0 ? (

            <p>
              No comments pending review.
            </p>


          ) : (

            queue.map((comment) => (

              <div
                key={comment.id}
                className="moderation-item"
              >

                <p className="moderation-body">
                  {comment.body}
                </p>


                <p className="moderation-meta">
                  Submitted by {comment.authorLabel}
                </p>


                <div className="moderation-actions">


                  <button
                    onClick={() => approve(comment.id)}
                    disabled={processingId === comment.id}
                  >
                    Approve
                  </button>



                  <button
                    onClick={() => reject(comment.id)}
                    disabled={processingId === comment.id}
                  >
                    Reject
                  </button>


                </div>


              </div>

            ))

          )}


        </main>


      </div>


    </>

  );

}
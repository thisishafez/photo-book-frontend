import {
  useEffect,
  useState
} from "react";


import {
  useNavigate
} from "react-router-dom";


import Navbar
  from "../../components/Navbar/Navbar";


import HangoutCard
  from "../../components/HangoutCard/ HangoutCard.jsx";


import {
  api
} from "../../services/api";


import {
  useTheme
} from "../../contexts/ThemeContext";

import {
  normalizeHangout
} from "../../utils/normalizeHangout";


import "./Hangouts.css";


export default function Hangouts() {

  const navigate =
    useNavigate();


  const { darkMode } =
    useTheme();


  const [
    hangouts,
    setHangouts
  ] = useState([]);


  const [
    tab,
    setTab
  ] = useState("upcoming");


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    error,
    setError
  ] = useState(null);


  useEffect(() => {

    load();

  }, [tab]);


  const load = async () => {

    setLoading(true);
    setError(null);

    try {

      // "Upcoming" needs to cover both "planned" and "ongoing" —
      // a hangout that has started but isn't completed/cancelled yet
      // still belongs here, not in limbo with no tab that shows it.
      // getHangouts only takes a single status value, so for this tab
      // we fetch everything and filter client-side instead.
      let status = null;

      if (tab === "completed") {
        status = "completed";
      }

      if (tab === "cancelled") {
        status = "cancelled";
      }


      const data =
        await api.hangouts.getHangouts(
          status
        );


      const list =
        Array.isArray(data)
          ? data
          : (
              data.hangouts || []
            );

      const normalized =
        list.map(normalizeHangout);

      setHangouts(
        tab === "upcoming"
          ? normalized.filter(
              (hangout) =>
                hangout.status === "planned" ||
                hangout.status === "ongoing"
            )
          : normalized
      );

    } catch (err) {

      console.error(
        "Failed to load hangouts:",
        err
      );

      setError(
        err.message ||
        "Failed to load hangouts."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div
      className={
        `hangouts-page ${
          darkMode ? "dark" : ""
        }`
      }
    >

      <Navbar />


      <main
        className="hangouts-container"
      >

        <h1>
          Hangouts
        </h1>


        <div
          className="hangout-tabs"
        >

          <button
            className={
              tab === "upcoming"
                ? "active"
                : ""
            }
            onClick={() =>
              setTab("upcoming")
            }
          >
            Upcoming
          </button>


          <button
            className={
              tab === "completed"
                ? "active"
                : ""
            }
            onClick={() =>
              setTab("completed")
            }
          >
            Completed
          </button>


          <button
            className={
              tab === "cancelled"
                ? "active"
                : ""
            }
            onClick={() =>
              setTab("cancelled")
            }
          >
            Didn't Happen
          </button>

        </div>


        {loading && (

          <div className="hangouts-loading">
            Loading hangouts...
          </div>

        )}


        {!loading && error && (

          <div className="hangouts-error">

            <p>
              {error}
            </p>

            <button
              onClick={load}
            >
              Try Again
            </button>

          </div>

        )}


        {!loading &&
          !error &&
          hangouts.length === 0 && (

          <div className="hangouts-empty">

            <p>
              No hangouts here yet.
            </p>

          </div>

        )}


        {!loading &&
          !error &&
          hangouts.map(
            (hangout) => (

              <HangoutCard
                key={hangout.id}
                hangout={hangout}
                onClick={() =>
                  navigate(
                    `/hangout/${hangout.id}`
                  )
                }
              />

            )
          )}

      </main>

    </div>

  );

}
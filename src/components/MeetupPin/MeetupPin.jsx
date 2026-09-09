import "./MeetupPin.css";

export default function MeetupPin({
  location,
  time
}) {

  const openMaps = () => {

    const query =
      encodeURIComponent(location);

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank"
    );

  };


  return (

    <section className="meetup-pin">

      <div className="meetup-pin-header">

        <h2>
          📍 Meetup Pin
        </h2>

        <span className="meetup-required">
          Confirmation required
        </span>

      </div>


      <div className="meetup-pin-details">

        <div className="meetup-detail">

          <span className="meetup-detail-label">
            Time
          </span>

          <strong>
            {time}
          </strong>

        </div>


        <div className="meetup-detail">

          <span className="meetup-detail-label">
            Place
          </span>

          <strong>
            {location}
          </strong>

        </div>

      </div>


      <div className="meetup-pin-actions">

        <button className="meetup-confirm-btn">
          Confirm Meetup
        </button>

        <button
          className="meetup-map-btn"
          onClick={openMaps}
        >
          Open in Maps
        </button>

      </div>

    </section>
  );
}
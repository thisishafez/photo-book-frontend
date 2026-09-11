import "./HangoutCard.css";


export default function HangoutCard({
  hangout,
  onClick
}) {

  const participantCount =
    Array.isArray(hangout.participants)
      ? hangout.participants.length
      : (
          hangout.participant_count ??
          hangout.participants ??
          0
        );


  const date =
    hangout.scheduled_at
      ? new Date(
          hangout.scheduled_at
        ).toLocaleString()
      : "Time not set";


  return (

    <div
      className="hangout-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {

        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          onClick();
        }

      }}
    >

      <h3>
        {hangout.title ||
          hangout.activity?.title ||
          "Hangout"}
      </h3>


      <p>
        📅 {date}
      </p>


      <p>
        👥 {participantCount} participants
      </p>


      <span
        className={
          `hangout-status ${hangout.status}`
        }
      >
        {formatStatus(hangout.status)}
      </span>

    </div>

  );
}


function formatStatus(status) {

  switch (status) {

    case "planned":
      return "Upcoming";

    case "ongoing":
      return "Happening Now";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Didn't Happen";

    default:
      return status || "Unknown";

  }

}
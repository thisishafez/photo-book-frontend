export default function ParticipantList({ participants }) {

  return (
    <section className="participant-list">

      <h2>Participants</h2>

      <div className="participant-items">

        {participants.map((participant) => (

          <div
            className="participant-item"
            key={participant.name}
          >

            <div className="participant-user">

              <span className="participant-avatar">
                {participant.name.charAt(0).toUpperCase()}
              </span>

              <span>
                {participant.name}
              </span>

            </div>

            <span
              className={
                `participant-status ${
                  participant.confirmed
                    ? "confirmed"
                    : "pending"
                }`
              }
            >
              {participant.confirmed
                ? "✓ Confirmed"
                : "Pending"}
            </span>

          </div>

        ))}

      </div>

    </section>
  );
}
import "./ParticipantList.css";

const getUserId = (participant) =>
  participant?.user_id ||
  participant?.userId ||
  participant?.user?.id ||
  participant?.user?.user_id ||
  participant?.id;

const getName = (participant) =>
  participant?.user?.display_name ||
  participant?.user?.username ||
  participant?.user?.name ||
  participant?.display_name ||
  participant?.username ||
  participant?.name ||
  "Participant";

const getInviteStatus = (participant) =>
  (
    participant?.invite_status ||
    participant?.inviteStatus ||
    participant?.status ||
    "pending"
  ).toLowerCase();

export default function ParticipantList({
  participants = [],
  currentUserId,
}) {
  return (
    <section className="participant-list">
      <h2>
        Participants ({participants.length})
      </h2>

      {participants.length === 0 ? (
        <p>No participants yet.</p>
      ) : (
        <div>
          {participants.map((participant, index) => {
            const userId =
              getUserId(participant);

            const status =
              getInviteStatus(participant);

            const isCurrentUser =
              currentUserId &&
              userId &&
              String(currentUserId) ===
                String(userId);

            return (
              <div
                key={userId || index}
                className="participant-list__item"
              >
                <span>
                  {getName(participant)}

                  {isCurrentUser && (
                    <span> (You)</span>
                  )}
                </span>

                <span>
                  {status === "accepted" &&
                    "Accepted"}

                  {status === "pending" &&
                    "Invitation pending"}

                  {status === "rejected" &&
                    "Declined"}

                  {![
                    "accepted",
                    "pending",
                    "rejected",
                  ].includes(status) &&
                    status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
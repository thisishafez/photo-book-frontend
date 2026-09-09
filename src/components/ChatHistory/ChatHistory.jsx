import "./ChatHistory.css";


export default function ChatHistory({
  messages = []
}) {


  const formatTime = (
    value
  ) => {

    if (!value) {
      return "";
    }


    return new Date(
      value
    ).toLocaleString(
      undefined,
      {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  };



  if (
    !messages.length
  ) {

    return (

      <div className="chat-history-empty">

        No chat was saved for this hangout.

      </div>

    );

  }



  return (

    <div className="chat-history">

      {
        messages.map(
          message => {

            const ownMessage =
              message.sender === "You";


            return (

              <div
                key={message.id}
                className={
                  `chat-history-row ${
                    ownMessage
                      ? "own"
                      : ""
                  }`
                }
              >

                <div className="chat-history-bubble">

                  <div className="chat-history-meta">

                    <strong>
                      {message.sender}
                    </strong>

                    <span>
                      {
                        formatTime(
                          message.timestamp
                        )
                      }
                    </span>

                  </div>


                  <p>
                    {message.text}
                  </p>

                </div>

              </div>

            );

          }
        )
      }

    </div>

  );

}
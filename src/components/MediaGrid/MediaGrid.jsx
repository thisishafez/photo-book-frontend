import "./MediaGrid.css";


export default function MediaGrid({
  media = [],
  onDelete
}) {


  const formatDate = (
    value
  ) => {

    if (!value) {
      return "";
    }


    return new Date(
      value
    ).toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric"
      }
    );

  };



  if (
    !media.length
  ) {

    return (

      <div className="media-empty">

        <div className="media-empty-icon">
          📷
        </div>

        <h3>
          No memories uploaded yet
        </h3>

        <p>
          Add photos, GIFs, videos or audio from this hangout.
        </p>

      </div>

    );

  }



  return (

    <div className="media-grid">

      {
        media.map(
          item => (

            <article
              className="media-card"
              key={item.id}
            >

              <div className="media-preview">


                {
                  (
                    item.type === "image" ||
                    item.type === "gif"
                  ) &&
                  item.url
                  ? (

                    <img
                      src={item.url}
                      alt={item.name}
                    />

                  )
                  :
                  (
                    item.type === "image" ||
                    item.type === "gif"
                  )
                  ? (

                    <div className="media-placeholder">

                      <span>
                        🖼️
                      </span>

                      <small>
                        {item.name}
                      </small>

                    </div>

                  )
                  :
                  null
                }



                {
                  item.type === "video" &&
                  item.url
                  ? (

                    <video
                      src={item.url}
                      controls
                    />

                  )
                  :
                  item.type === "video"
                  ? (

                    <div className="media-placeholder">

                      <span>
                        🎥
                      </span>

                      <small>
                        {item.name}
                      </small>

                    </div>

                  )
                  :
                  null
                }



                {
                  item.type === "audio" && (

                    <div className="media-audio">

                      <div className="media-audio-icon">
                        🎵
                      </div>

                      <strong>
                        {item.name}
                      </strong>


                      {
                        item.url && (

                          <audio
                            controls
                            src={item.url}
                          />

                        )
                      }

                    </div>

                  )
                }

              </div>



              <div className="media-card-footer">

                <div>

                  <strong>
                    {item.uploader}
                  </strong>

                  <span>
                    {formatDate(
                      item.createdAt
                    )}
                  </span>

                </div>


                {
                  onDelete && (

                    <button
                      type="button"
                      className="media-delete-button"
                      onClick={() =>
                        onDelete(
                          item.id
                        )
                      }
                    >
                      Hide
                    </button>

                  )
                }

              </div>

            </article>

          )
        )
      }

    </div>

  );

}
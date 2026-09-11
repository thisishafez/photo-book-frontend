import './ActivityCard.css';

export default function ActivityCard({
  title,
  description,
  rating,
  category,
  image,
  reason,
  onClick
}) {

  return (

    <div 
      className="activity-card"
      onClick={onClick}
    >

      <div className="activity-image kh-grain">

        {
          image
          ?
          <img 
            src={image}
            alt={title}
          />
          :
          <div className="activity-placeholder">
            📸
          </div>
        }

      </div>


      <div className="activity-content">


        <h3>
          {title}
        </h3>


        <p className="activity-description">
          {description}
        </p>



        <div className="activity-meta">


          <span className="activity-category">
            {category}
          </span>


          <span className="activity-rating">
            ⭐ {rating}
          </span>


        </div>



        {
          reason &&
          <p className="activity-reason">

            Based on:
            <br />

            {reason}

          </p>
        }



        <button className="activity-view-btn">

          View

        </button>


      </div>


    </div>

  );

}
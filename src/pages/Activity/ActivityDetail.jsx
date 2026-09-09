import {
useEffect,
useState
} from "react";


import {
useParams,
useNavigate
}
from "react-router-dom";


import Navbar from "../../components/Navbar/Navbar";

import RatingStars from "../../components/RatingStars/RatingStars";

import CommentCard from "../../components/CommentCard/CommentCard";

import InviteButton from "../../components/InviteButton/InviteButton";


import {
useNotifications
}
from "../../contexts/NotificationContext";


import {
useTheme
}
from "../../contexts/ThemeContext";


import {
api
}
from "../../services/api";


import "./ActivityDetail.css";



export default function ActivityDetail(){


const {
id
}
=
useParams();


const navigate =
useNavigate();



const {
unreadCount
}
=
useNotifications();



const {
darkMode
}
=
useTheme();



const [activity,setActivity]
=
useState(null);


const [loading,setLoading]
=
useState(true);

const [comment,setComment]=useState("");

const [comments,setComments]=useState(
[]
);


const [rating,setRating]=useState(0);



useEffect(()=>{


loadActivity();


},[id]);



const loadActivity=async()=>{


try{


setLoading(true);



const data =
await api.activities.getActivityDetails(id);



setActivity(data);



}
catch(error){


console.error(
error
);


}
finally{


setLoading(false);


}


};




const handleInvite = () => {

  navigate(
    `/hangout/${id}/invite`
  );

};




if(loading){


return (

<div>

<Navbar
unreadCount={unreadCount}
/>


<h2>
Loading activity...
</h2>


</div>

);


}



if(!activity){


return (

<div>


<Navbar
unreadCount={unreadCount}
/>


<h2>
Activity not found
</h2>


</div>

);


}

const handleCommentSubmit = async()=>{


if(!comment.trim())
return;



const result =
await api.activities.addComment(
id,
comment
);



setComments(prev=>[
...prev,
result
]);



setComment("");

};

const handleRatingSubmit = async()=>{


await api.activities.addRating(
id,
rating
);


alert(
"Rating submitted"
);


};

return (

<div

className={
`activity-detail-page ${
darkMode
?
"activity-detail-page-dark"
:
""
}`
}

>


<Navbar
unreadCount={unreadCount}
/>




<main className="activity-detail-container">
    <button

className="back-btn"

onClick={()=>
navigate("/")
}

>

← Back to Home

</button>



<div className="activity-cover">


{
activity.image

?

<img
src={activity.image}
/>

:

<div>
📸
</div>

}


</div>

<h1>

{activity.title}

</h1>



<p className="creator">

Created by:

<strong>

{" "}
{activity.creator.name}

</strong>

</p>



<p className="description">

{activity.description}

</p>




<div className="rating-section">


<RatingStars
rating={
activity.ratings.average
}
/>


<span>

{activity.ratings.average}

(
{activity.ratings.count}
ratings)

</span>


</div>





<InviteButton
onClick={handleInvite}
/>


<section className="user-rating-box">

<h2>
Your Rating
</h2>



<div className="stars">


{
[1,2,3,4,5].map(star=>(


<button

key={star}

className={
rating>=star
?
"selected-star"
:
""
}


onClick={()=>
setRating(star)
}


>

★

</button>


))
}



</div>


<button
onClick={handleRatingSubmit}
disabled={rating < 1}
>

Submit Rating

</button>


</section>




<section className="comments-section">


<h2>
Comments
</h2>



<div className="comments-list">

{

activity.comments.map(comment=>(


<CommentCard

key={comment.id}

comment={comment}

/>


))

}

</div>


</section>

<section className="comment-box">


<h2>
Leave a Comment
</h2>



<textarea

value={comment}

onChange={
e=>setComment(e.target.value)
}

placeholder="Share your experience"

>



</textarea>



<button
onClick={handleCommentSubmit}
>

Post Comment

</button>



</section>



</main>


</div>



);


}
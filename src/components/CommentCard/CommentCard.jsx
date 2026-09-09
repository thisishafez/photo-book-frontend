import RatingStars from '../RatingStars/RatingStars';

import './CommentCard.css';



export default function CommentCard({
comment
}){


return (

<div className="comment-card">


<div className="comment-header">


<strong>

{comment.username}

</strong>


<RatingStars
rating={comment.rating}
/>


</div>



<p>

{comment.text}

</p>



</div>

);


}
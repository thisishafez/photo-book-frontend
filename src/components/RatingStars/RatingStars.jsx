import './RatingStars.css';


export default function RatingStars({
rating
}){


return (

<div className="rating-stars">


{
[1,2,3,4,5].map(star=>(


<span
key={star}
className={
star <= Math.round(rating)
?
"filled"
:
"empty"
}
>

★


</span>


))
}


</div>

);


}
import "./BadgeDisplay.css";


export default function BadgeDisplay({

badge

}){


return (

<div className="badge-display">


<div className="badge-display-icon">

{badge.emoji}

</div>



<div className="badge-display-content">


<h1>

{badge.title}

</h1>


<p>

{badge.description}

</p>



</div>


</div>

);


}
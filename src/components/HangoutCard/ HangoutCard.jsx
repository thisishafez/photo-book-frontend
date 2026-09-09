import "./HangoutCard.css";


export default function HangoutCard({
hangout,
onClick
}){


return (

<div

className="hangout-card"

onClick={onClick}

>


<h3>
{hangout.activity}
</h3>



<p>
📅 {hangout.date}
</p>



<p>
👥 {hangout.participants} participants
</p>



<span className={`hangout-status ${hangout.status}`}>

{hangout.status}

</span>



</div>

);


}
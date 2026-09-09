import "./BadgeCard.css";

import {
useNavigate
}
from "react-router-dom";


export default function BadgeCard({

badge,

onToggle

}) {


const navigate = useNavigate(); // ✅ inside component



return (

<div

onClick={() =>
navigate(
`/badge/${badge.id}`
)
}

className={
 `badge-card clickable ${
 badge.visible
 ?
 ""
 :
 "hidden"
 }`
}

>


<div className="badge-icon">

{
badge.emoji
}

</div>



<div className="badge-content">


<h3>

{badge.title}

</h3>



<p>

{badge.description}

</p>



<span>

Earned:

{
new Date(
badge.earnedAt
)
.toLocaleDateString()

}

</span>


</div>



<button

type="button"

onClick={(e) => {

e.stopPropagation();

onToggle(
badge.id
);

}}

>

{
badge.visible
?
"Hide"
:
"Show"
}

</button>



</div>

);


}
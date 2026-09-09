import {
useEffect,
useState
}
from "react";


import {
useParams,
useNavigate
}
from "react-router-dom";


import Navbar
from "../../components/Navbar/Navbar";


import BadgeDisplay
from "../../components/BadgeDisplay/BadgeDisplay";


import {
api
}
from "../../services/api";


import {
useTheme
}
from "../../contexts/ThemeContext";


import "./BadgeDetail.css";



export default function BadgeDetail(){


const {

id

}
=
useParams();



const navigate =
useNavigate();



const {
darkMode
}
=
useTheme();



const [
badge,
setBadge
]
=
useState(null);



const [
loading,
setLoading
]
=
useState(true);



useEffect(()=>{


loadBadge();


},[id]);



const loadBadge =
async()=>{


try{


const data =
await api.badges
.getBadge(id);



setBadge(
data
);



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




const formatDate =
date=>{


return new Date(
date
)
.toLocaleDateString(
undefined,
{
year:"numeric",
month:"long",
day:"numeric"
}
);


};





if(loading){


return (

<div>

<Navbar/>

<div className="badge-state">

Loading badge...

</div>

</div>

);

}




if(!badge){


return (

<div>

<Navbar/>

<div className="badge-state">


<h2>

Badge not found

</h2>


<button

onClick={()=>
navigate("/profile")
}

>

Back to Profile

</button>


</div>

</div>

);


}





return (


<div

className={

`badge-page ${
darkMode
?
"badge-dark"
:
""
}`

}

>


<Navbar/>



<main className="badge-container">



<button

className="badge-back"

onClick={()=>
navigate("/profile")
}

>

← Back to Profile

</button>




<BadgeDisplay

badge={badge}

/>





<section className="badge-info">



<div className="badge-info-card">


<h3>

Issued By

</h3>


<p>

🏢 {badge.host}

</p>


</div>





<div className="badge-info-card">


<h3>

Activity

</h3>


<p>

🎯 {badge.activity}

</p>


</div>





<div className="badge-info-card">


<h3>

Category

</h3>


<p>

{badge.category}

</p>


</div>



<div className="badge-info-card">


<h3>

Earned

</h3>


<p>

{
formatDate(
badge.earnedAt
)
}

</p>


</div>




</section>






<section className="badge-section">


<h2>

How to earn this badge

</h2>


<p>

{badge.criteria}

</p>


</section>






<section className="badge-section">


<h2>

About this achievement

</h2>


<p>

This badge proves that you participated
in this activity and created a memory
with your circle.

</p>


</section>




</main>


</div>


);


}
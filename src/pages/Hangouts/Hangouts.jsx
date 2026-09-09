import {
useEffect,
useState
}
from "react";


import {
useNavigate
}
from "react-router-dom";


import Navbar from "../../components/Navbar/Navbar";

import HangoutCard from "../../components/HangoutCard/ HangoutCard.jsx";


import {
api
}
from "../../services/api";


import {
useTheme
}
from "../../contexts/ThemeContext";


import "./Hangouts.css";



export default function Hangouts(){


const navigate =
useNavigate();


const {
darkMode
}
=
useTheme();



const [hangouts,setHangouts]
=
useState([]);



const [tab,setTab]
=
useState("upcoming");



useEffect(()=>{

load();

},[]);



const load=async()=>{

const data =
await api.hangouts.getHangouts();

setHangouts(data);

};



const filtered =
hangouts.filter(
h=>{


if(tab==="upcoming")
return h.status==="planned";


if(tab==="completed")
return h.status==="completed";


if(tab==="failed")
return h.status==="failed";


return true;


}
);



return (

<div

className={`hangouts-page ${
darkMode?"dark":""
}`}

>


<Navbar/>



<main className="hangouts-container">


<h1>
Hangouts
</h1>



<div className="hangout-tabs">


<button
onClick={()=>setTab("upcoming")}
>
Upcoming
</button>


<button
onClick={()=>setTab("completed")}
>
Completed
</button>


<button
onClick={()=>setTab("failed")}
>
Didn't Happen
</button>



</div>



{

filtered.map(

hangout=>(


<HangoutCard

key={hangout.id}

hangout={hangout}

onClick={()=>navigate(
`/hangout/${hangout.id}`
)}

/>


)

)

}



</main>


</div>

);


}
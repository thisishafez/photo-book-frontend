import {
useEffect,
useState
}
from "react";


import Navbar
from "../../components/Navbar/Navbar";


import BadgeCard
from "../../components/BadgeCard/BadgeCard";


import ActivityHistory
from "../../components/ActivityHistory/ActivityHistory";


import {
api
}
from "../../services/api";


import {
useTheme
}
from "../../contexts/ThemeContext";


import "./Profile.css";



export default function Profile(){


const {

darkMode

}
=
useTheme();



const [
profile,
setProfile
]
=
useState(null);



const [
badges,
setBadges
]
=
useState([]);



const [
loading,
setLoading
]
=
useState(true);



useEffect(()=>{


loadProfile();


},[]);



const loadProfile =
async()=>{


try{


const profileData =
await api.profile
.getProfile();



const badgeData =
await api.badges
.getBadges();



setProfile(
profileData
);



setBadges(
badgeData
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




const toggleBadge =
async(id)=>{


const updated =
await api.badges
.toggleVisibility(
id
);



setBadges(
previous=>

previous.map(
badge=>

badge.id===id
?
updated
:
badge

)

);


};




if(loading){


return (

<div>

<Navbar/>

<div className="profile-loading">

Loading profile...

</div>

</div>

);


}




return (


<div

className={

`profile-page ${
darkMode
?
"profile-dark"
:
""
}`

}

>


<Navbar/>



<main className="profile-container">



<section className="profile-header">



<div className="profile-avatar">


{
profile.avatar
?
<img
src={profile.avatar}
/>
:
profile.display_name
.charAt(0)
}

</div>



<div>


<h1>

{profile.display_name}

</h1>



<p>

{profile.handle}

</p>



<p className="bio">

{profile.bio}

</p>


</div>



</section>




<section className="profile-section">


<h2>

Enjoyed

</h2>



<div className="badges">


{

badges.map(

badge=>(


<BadgeCard

key={
badge.id
}

badge={
badge
}

onToggle={
toggleBadge
}

/>


)


)


}


</div>


</section>





<section className="profile-section">


<h2>

Interests

</h2>



<div className="interest-list">


{

profile.interests.map(

interest=>(


<span
key={interest}
>

{interest}

</span>


)


)


}


</div>


</section>





<section className="profile-section">


<h2>

History

</h2>


<ActivityHistory

history={
profile.history
}

/>


</section>




</main>


</div>


);


}
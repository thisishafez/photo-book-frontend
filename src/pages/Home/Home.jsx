import {
  useEffect,
  useState
} from 'react';

import {
  useNavigate
} from 'react-router-dom';


import Navbar from '../../components/Navbar/Navbar';

import ActivityCard from '../../components/ActivityCard/ActivityCard';

import {
 useNotifications
} from '../../contexts/NotificationContext';


import {
 useTheme
} from '../../contexts/ThemeContext';


import {
 api
} from '../../services/api';


import './Home.css';



export default function Home(){


const navigate = useNavigate();


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



const [activities,setActivities]
=
useState([]);



const [loading,setLoading]
=
useState(true);




const user =
JSON.parse(
localStorage.getItem('user')
)
||
{
username:"User"
};




useEffect(()=>{


loadActivities();


},[]);




const loadActivities = async()=>{


try{


setLoading(true);



const response =
await api.activities.getRecommendations();



setActivities(
response.activities || []
);



}
catch(error){


console.error(
"[Home] Failed loading activities",
error
);



}
finally{


setLoading(false);


}


};





const handleLogout = ()=>{


localStorage.removeItem('token');

localStorage.removeItem('user');


navigate('/login');


};




return (

<div
className={
`home-page ${
darkMode
?
'home-dark'
:
''
}`
}
>


<Navbar

onLogout={handleLogout}

unreadCount={unreadCount}

/>



<main className="home-main">


<div className="home-container">



<h1>

Hello, {user.username} 👋

</h1>



<p className="home-subtitle">

Discover activities you'll enjoy

</p>






<section>


<h2>

Recommended for you

</h2>



{
loading

?

<p>
Loading recommendations...
</p>


:

<div className="activity-grid">


{
activities.map(activity=>(


<ActivityCard

key={activity.id}

title={activity.title}

description={
activity.description
}

rating={
activity.rating
}

category={
activity.category
}

image={
activity.image
}

reason={
"You liked similar activities"
}

onClick={()=>
navigate(
`/activity/${activity.id}`
)
}


/>


))

}



</div>


}


</section>







<section className="recurring-section">


<h2>

Recurring suggestions

</h2>



<div className="activity-grid">


<ActivityCard

title="Gaming Night"

description="Your weekly gaming meetup"

rating="4.7"

category="Indoor"

reason="You regularly join gaming activities"


/>



<ActivityCard

title="Photography Walk"

description="Explore the city and capture memories"

rating="4.6"

category="Creative"

reason="You enjoyed photography before"


/>



</div>


</section>







<button

className="create-activity-btn"

onClick={()=>navigate('/activity/create')}

>

+ Create Activity

</button>





</div>


</main>


</div>

);


}
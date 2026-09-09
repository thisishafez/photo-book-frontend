import {
useEffect,
useState
}
from "react";

import FindFriendsModal from "../../components/FindFriendsModal/FindFriendsModal";


import {
useNavigate
}
from "react-router-dom";


import Navbar from "../../components/Navbar/Navbar";

import FriendCard from "../../components/FriendCard/FriendCard";


import {
api
}
from "../../services/api";


import {
useTheme
}
from "../../contexts/ThemeContext";


import "./CircleList.css";



export default function CircleList(){


const navigate =
useNavigate();


const {
darkMode
}
=
useTheme();

const [showFindFriends,setShowFindFriends]
=
useState(false);

const [friends,setFriends]
=
useState([]);



useEffect(()=>{


loadCircle();


},[]);



const loadCircle=async()=>{


const data =
await api.circle.getCircle();


setFriends(data);


};



const removeFriend=async(id)=>{


await api.circle.removeFriend(id);


setFriends(
friends.filter(
friend=>friend.id!==id
)
);


};



return (

<div

className={
`circle-page ${
darkMode?"dark":""
}`
}

>


<Navbar/>



<main className="circle-container">


<button
className="home-btn"

onClick={()=>
navigate("/")
}

>

← Home

</button>



<h1>
My Circle
</h1>



<button
className="find-friends-btn"
onClick={() =>
setShowFindFriends(true)
}
>
Find Friends
</button>




{
friends.map(
friend=>(

<FriendCard

key={friend.id}

friend={friend}

onRemove={removeFriend}

/>

)

)

}

{
showFindFriends &&
(
<FindFriendsModal

close={()=>
setShowFindFriends(false)
}

/>
)
}

</main>


</div>


);


}
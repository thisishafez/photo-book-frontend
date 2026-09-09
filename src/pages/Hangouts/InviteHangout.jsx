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


import {
api
}
from "../../services/api";

import Navbar from "../../components/Navbar/Navbar";
import { useTheme } from "../../contexts/ThemeContext";
import "./InviteHangout.css";


export default function InviteHangout(){


const {
id
}
=
useParams();


const navigate =
useNavigate();

const { darkMode } = useTheme();

const [friends,setFriends]
=
useState([]);


const [selected,setSelected]
=
useState([]);



useEffect(()=>{


loadFriends();


},[]);



const loadFriends=async()=>{


const data =
await api.circle.getCircle();


setFriends(data);


};



const toggle=(friend)=>{


if(selected.includes(friend.id)){


setSelected(
selected.filter(
id=>id!==friend.id
)
);


}
else{


setSelected(
[
...selected,
friend.id
]
);


}


};



const create=async()=>{


const hangout =
await api.hangouts.createHangout({

activityId:id,

participants:selected


});



navigate(
`/hangout/${hangout.id}`
);


};



return (

<div className={`invite-hangout-page ${darkMode ? "dark" : ""}`}>

  <main className="invite-hangout-container">


    <button
      className="invite-hangout-back"
      onClick={() => navigate(`/activity/${id}`)}
    >
      ← Back to Activity
    </button>


    <header className="invite-hangout-header">

      <h1>
        Invite Friends
      </h1>

      <p>
        Choose who you want to invite. 
        You can also create a solo hangout.
      </p>

    </header>



    <div className="invite-friends-list">


      {
      friends.map(friend => (

        <label
          key={friend.id}
          className={
            `invite-friend-row ${
              selected.includes(friend.id)
              ? "selected"
              : ""
            }`
          }
        >


          <div className="invite-friend-info">

            <div className="invite-friend-avatar">

              {friend.username
                .charAt(0)
                .toUpperCase()
              }

            </div>


            <span className="invite-friend-name">

              {friend.username}

            </span>


          </div>



          <input

            className="invite-checkbox"

            type="checkbox"

            checked={
              selected.includes(friend.id)
            }

            onChange={() =>
              toggle(friend)
            }

          />


        </label>

      ))

      }


    </div>



    <div className="invite-summary">

      {
        selected.length === 0

        ?

        "No friends selected. This will create a solo hangout."

        :

        `${selected.length} friend(s) selected`

      }

    </div>



    <div className="invite-actions">


      <button

        className="invite-create-btn"

        onClick={create}

      >

        Create Hangout

      </button>


    </div>


  </main>

</div>

);}
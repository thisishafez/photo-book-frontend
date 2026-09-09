import {
useState
}
from "react";


import {
api
}
from "../../services/api";


import "./FindFriendsModal.css";



export default function FindFriendsModal({
close
}){


const [query,setQuery]=useState("");

const [users,setUsers]=useState([]);



const search=async()=>{


const result =
await api.users.search(query);


setUsers(
result.users
);


};



const sendRequest=async(id)=>{


await api.circle.sendRequest(id);


alert("Request sent");


};



return (

<div className="modal-overlay">


<div className="find-modal">


<button

className="close"

onClick={close}

>

✕

</button>



<h2>
Find Friends
</h2>



<div className="search-row">
  <input
    className="search-input"
    value={query}
    onChange={e=>setQuery(e.target.value)}
    placeholder="Search users"
  />
  <button className="search-btn" onClick={search}>Search</button>
</div>



{
users.map(
user=>(


<div

className="user-result"

key={user.id}

>


<span>
{user.username}
</span>



<button

onClick={()=>
sendRequest(user.id)
}

>

Add

</button>


</div>


)

)

}


</div>


</div>


);


}
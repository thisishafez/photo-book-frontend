import "./FriendCard.css";


export default function FriendCard({
friend,
onRemove
}){


return (

<div className="friend-card">


<div>

<h3>
{friend.username}
</h3>


<p>
Connected
</p>

</div>



<button

onClick={()=>
onRemove(friend.id)
}

>

Remove

</button>


</div>

);


}
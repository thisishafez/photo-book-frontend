import "./RequestCard.css";


export default function RequestCard({

request,

onAccept,

onReject

}){


return (

<div className="request-card">


<div>

<h3>
{request.username}
</h3>


<p>
wants to connect
</p>


</div>



<div className="request-actions">


<button

className="accept"

onClick={()=>
onAccept(request.id)
}

>

Accept

</button>



<button

className="reject"

onClick={()=>
onReject(request.id)
}

>

Reject

</button>


</div>



</div>

);


}
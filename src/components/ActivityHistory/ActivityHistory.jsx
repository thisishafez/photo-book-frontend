import "./ActivityHistory.css";


export default function ActivityHistory({

history=[]

}){


return (


<div className="history-list">


{

history.map(
item=>(


<div
key={item.id}
className="history-item"
>


<div>


<h3>

{item.title}

</h3>


<p>

{item.category}

</p>


</div>



<div>


<span>

{
new Date(
item.date
)
.toLocaleDateString()
}

</span>



<strong>

{item.status}

</strong>


</div>



</div>


)

)

}


</div>


);


}
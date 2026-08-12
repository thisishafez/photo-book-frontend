import { useParams } from 'react-router-dom'

const Event = () => {
  const { id } = useParams()
  
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Event Page</h1>
      <p>This is the event page placeholder for event ID: {id}</p>
    </div>
  )
}

export default Event
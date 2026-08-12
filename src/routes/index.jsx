import { createBrowserRouter } from 'react-router-dom'
import App from '../App'

//placeholder component
const PlaceholderPage = ({ name }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>{name} Page</h1>
    <p>This is the {name} page placeholder</p>
  </div>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <PlaceholderPage name="Gallery" />,
  },
  {
    path: '/login',
    element: <PlaceholderPage name="Login" />,
  },
  {
    path: '/register',
    element: <PlaceholderPage name="Register" />,
  },
  {
    path: '/event/:id',
    element: <PlaceholderPage name="Event" />,
  },
  {
    path: '/notifications',
    element: <PlaceholderPage name="Notifications" />,
  },
])

export default router
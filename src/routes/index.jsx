import { createBrowserRouter } from 'react-router-dom'
import Login from '../pages/Login/login'
import Register from '../pages/Register/register'
import Gallery from '../pages/Gallery/gallery'
import Event from '../pages/Event/event'
import Notifications from '../pages/Notifications/notifications'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Gallery />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/event/:id',
    element: <Event />,
  },
  {
    path: '/notifications',
    element: <Notifications />,
  },
])

export default router
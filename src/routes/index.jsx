import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Login from '../pages/Login/login';
import Register from '../pages/Register/register';
import Gallery from '../pages/Gallery/gallery';
import Event from '../pages/Event/event';
import Notifications from '../pages/Notifications/notifications';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Gallery />
      </ProtectedRoute>
    ),
  },
  {
    path: '/event/:id',
    element: (
      <ProtectedRoute>
        <Event />
      </ProtectedRoute>
    ),
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <Notifications />
      </ProtectedRoute>
    ),
  },
]);

export default router;
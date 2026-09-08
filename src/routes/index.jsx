import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';


// Auth
import Login from '../pages/Auth/Login/login';
import Register from '../pages/Auth/Register/register';
import ProfileSetup from '../pages/Auth/ProfileSetup/ProfileSetup';


// Discovery / Activities
import Home from '../pages/Home/Home';
import ActivityDetail from '../pages/Activity/ActivityDetail';
import CreateActivity from '../pages/Activity/CreateActivity';


// Circle
import CircleList from '../pages/Circle/CircleList';
import FindFriends from '../pages/Circle/FindFriends';
import CircleRequests from '../pages/Circle/CircleRequests';


// Hangouts
import Hangouts from '../pages/Hangouts/Hangouts';
import HangoutDetail from '../pages/Hangouts/HangoutDetail';
import InviteHangout from '../pages/Hangouts/InviteHangout';


// Archive
import Archives from '../pages/Archive/Archives';
import ArchiveDetail from '../pages/Archive/ArchiveDetail';


// Profile
import Profile from '../pages/Profile/Profile';
import Settings from '../pages/Profile/Settings.jsx';


// Notifications
import Notifications from '../pages/Notifications/notifications';


// Host
import HostDashboard from '../pages/Host/HostDashboard';


// Moderator
import ActivityModeration from '../pages/Moderator/ActivityModeration';
import CommentModeration from '../pages/Moderator/CommentModeration';


// Attendance / Badge
import QRScanner from '../pages/QR/QRScanner';
import BadgeDetail from '../pages/Badge/BadgeDetail';



// Old pages (keep temporarily)
import Gallery from '../pages/Gallery/gallery';
import Event from '../pages/Event/event';



const router = createBrowserRouter([


  /*
  =========================
  AUTH
  =========================
  */


  {
    path: '/login',
    element: <Login />,
  },


  {
    path: '/register',
    element: <Register />,
  },


  {
    path: '/profile-setup',
    element: (
      <ProtectedRoute>
        <ProfileSetup />
      </ProtectedRoute>
    ),
  },



  /*
  =========================
  DISCOVERY
  =========================
  */


  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },


  {
    path: '/activity/:id',
    element: (
      <ProtectedRoute>
        <ActivityDetail />
      </ProtectedRoute>
    ),
  },


  {
    path: '/create-activity',
    element: (
      <ProtectedRoute>
        <CreateActivity />
      </ProtectedRoute>
    ),
  },



  /*
  =========================
  CIRCLE
  =========================
  */


  {
    path: '/circle',
    element: (
      <ProtectedRoute>
        <CircleList />
      </ProtectedRoute>
    ),
  },


  {
    path: '/circle/search',
    element: (
      <ProtectedRoute>
        <FindFriends />
      </ProtectedRoute>
    ),
  },


  {
    path: '/circle/requests',
    element: (
      <ProtectedRoute>
        <CircleRequests />
      </ProtectedRoute>
    ),
  },



  /*
  =========================
  HANGOUTS
  =========================
  */


  {
    path: '/hangouts',
    element: (
      <ProtectedRoute>
        <Hangouts />
      </ProtectedRoute>
    ),
  },


  {
    path: '/hangout/:id',
    element: (
      <ProtectedRoute>
        <HangoutDetail />
      </ProtectedRoute>
    ),
  },


  {
    path: '/hangout/:id/invite',
    element: (
      <ProtectedRoute>
        <InviteHangout />
      </ProtectedRoute>
    ),
  },



  /*
  =========================
  ARCHIVES
  =========================
  */


  {
    path: '/archives',
    element: (
      <ProtectedRoute>
        <Archives />
      </ProtectedRoute>
    ),
  },


  {
    path: '/archive/:id',
    element: (
      <ProtectedRoute>
        <ArchiveDetail />
      </ProtectedRoute>
    ),
  },



  /*
  =========================
  PROFILE
  =========================
  */


  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },


  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },



  /*
  =========================
  NOTIFICATIONS
  =========================
  */


  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <Notifications />
      </ProtectedRoute>
    ),
  },



  /*
  =========================
  HOST
  =========================
  */


  {
    path: '/host/dashboard',
    element: (
      <ProtectedRoute>
        <HostDashboard />
      </ProtectedRoute>
    ),
  },



  /*
  =========================
  MODERATOR
  =========================
  */


  {
    path: '/moderation/activities',
    element: (
      <ProtectedRoute>
        <ActivityModeration />
      </ProtectedRoute>
    ),
  },


  {
    path: '/moderation/comments',
    element: (
      <ProtectedRoute>
        <CommentModeration />
      </ProtectedRoute>
    ),
  },



  /*
  =========================
  QR + BADGES
  =========================
  */


  {
    path: '/qr-scan',
    element: (
      <ProtectedRoute>
        <QRScanner />
      </ProtectedRoute>
    ),
  },


  {
    path: '/badge/:id',
    element: (
      <ProtectedRoute>
        <BadgeDetail />
      </ProtectedRoute>
    ),
  },



  /*
  =========================
  OLD PHOTO BOOK ROUTES
  Keep until migration finishes
  =========================
  */


  {
    path: '/gallery',
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


]);


export default router;
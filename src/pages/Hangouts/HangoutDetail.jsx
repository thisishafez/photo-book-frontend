import {
  useParams,
  useNavigate
} from "react-router-dom";


import Navbar from "../../components/Navbar/Navbar";

import ParticipantList from "../../components/ParticipantList/ParticipantList";

import MeetupPin from "../../components/MeetupPin/MeetupPin";

import ChatBox from "../../components/ChatBox/ChatBox";


import {
  useTheme
} from "../../contexts/ThemeContext";


import {
  useNotifications
} from "../../contexts/NotificationContext";


import "./HangoutDetail.css";


export default function HangoutDetail(){

  const { id } =
    useParams();


  const navigate =
    useNavigate();


  const { darkMode } =
    useTheme();


  const { unreadCount } =
    useNotifications();


  const hangout = {

    id,

    title:
      "Hiking Meetup",

    activity:
      "Hiking Adventure",

    status:
      "planned",

    participants:[
      {
        name:"Ali",
        confirmed:true
      },
      {
        name:"Sara",
        confirmed:true
      },
      {
        name:"Amir",
        confirmed:false
      }
    ],

    location:
      "Mellat Park, Tehran",

    time:
      "Friday, 18:00"

  };


  return (

    <div
      className={
        `hangout-detail-page ${
          darkMode ? "dark" : ""
        }`
      }
    >

      <Navbar
        unreadCount={unreadCount}
      />


      <main className="hangout-detail-container">

        <button
          className="hangout-back-btn"
          onClick={
            ()=>navigate("/hangouts")
          }
        >
          ← Back to Hangouts
        </button>


        <header className="hangout-detail-header">

          <h1>
            {hangout.title}
          </h1>

          <p className="hangout-detail-meta">
            Based on {hangout.activity}
          </p>

        </header>


        <MeetupPin
          location={hangout.location}
          time={hangout.time}
        />


        <ParticipantList
          participants={
            hangout.participants
          }
        />


        <ChatBox />


        <div className="hangout-danger-zone">

          <button className="cancel-hangout-btn">
            Cancel Hangout
          </button>

        </div>


      </main>

    </div>

  );
}
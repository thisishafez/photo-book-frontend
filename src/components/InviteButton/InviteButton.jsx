import './InviteButton.css';
import { useTheme } from '../../contexts/ThemeContext';


export default function InviteButton({
  onClick
}){

  const { darkMode } = useTheme();


  return (

    <button

      className={`invite-button ${darkMode ? "dark" : ""}`}

      onClick={onClick}

    >

      Invite to Hangout

    </button>

  );


}
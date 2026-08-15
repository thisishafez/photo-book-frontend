import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../../assets/Group 3 (1).svg';

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="Shared Event Photo Book" className="navbar-logo" />
          <span className="navbar-title">Photo Book</span>
        </Link>

        <button onClick={handleLogout} className="navbar-logout">
          Leave
        </button>
      </div>
    </nav>
  );
}
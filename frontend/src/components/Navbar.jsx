import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={isAuthenticated ? '/home' : '/login'} className="navbar-logo">
          FlyEasy <span>✈</span>
        </Link>

        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              <span className="navbar-greeting">Hi, {user?.name}</span>
              <Link to="/my-bookings" className="btn-nav btn-my-bookings">
                My Bookings
              </Link>
              <button type="button" className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-nav">
                Login
              </Link>
              <Link to="/signup" className="btn-nav btn-nav-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getUser, removeToken, getRefreshToken } from '../../utils/auth';
import { authAPI } from '../../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      navigate('/login');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Document Portal
        </Link>

        <div className="navbar-nav ms-auto">
          {isAuthenticated() ? (
            <>
              <span className="navbar-text me-3">
                Welcome, {user?.username || 'User'}
              </span>
              <Link className="nav-link" to="/dashboard">
                Dashboard
              </Link>
              <button
                className="btn btn-outline-light btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/login">
                Login
              </Link>
              <Link className="nav-link" to="/signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
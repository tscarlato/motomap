import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserMenu from './UserMenu';
import AuthModal from '../auth/AuthModal';
import './NavBar.css';

const NavBar = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
  };

  const handleBrandClick = () => {
    navigate('/');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand" onClick={handleBrandClick}>
          <span className="navbar-logo">🏍️</span>
          <span className="navbar-title">MotoMap</span>
        </div>

        <div className="navbar-actions">
          {user && (
            <button className="navbar-trips-button" onClick={() => navigate('/trips')}>
              My Trips
            </button>
          )}
          
          {loading ? (
            <div className="navbar-loading">
              <div className="navbar-spinner"></div>
            </div>
          ) : user ? (
            <UserMenu user={user} />
          ) : (
            <button className="navbar-login-button" onClick={handleAuthClick}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="login"
      />
    </>
  );
};

export default NavBar;
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UserMenu from './UserMenu';
import AuthModal from '../auth/AuthModal';
import './NavBar.css';

const NavBar = () => {
  const { user, loading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="navbar-logo">🏍️</span>
          <span className="navbar-title">MotoMap</span>
        </div>

        <div className="navbar-actions">
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
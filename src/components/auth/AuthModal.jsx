import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="auth-modal-content">
          {mode === 'login' ? (
            <>
              <LoginForm onSuccess={handleSuccess} />
              <div className="auth-modal-footer">
                <p>
                  Don't have an account?{' '}
                  <button className="auth-link-button" onClick={toggleMode}>
                    Sign up
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <SignupForm onSuccess={handleSuccess} />
              <div className="auth-modal-footer">
                <p>
                  Already have an account?{' '}
                  <button className="auth-link-button" onClick={toggleMode}>
                    Log in
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
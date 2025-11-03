import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import GoogleAuthButton from './GoogleAuthButton';
import toast from 'react-hot-toast';
import './AuthForms.css';

const SignupForm = ({ onSuccess }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!displayName || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await signup(email, password, displayName);
      toast.success('Account created! Welcome to MotoMap 🏍️');
      onSuccess && onSuccess();
    } catch (error) {
      console.error('Signup error:', error);
      
      // User-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        toast.error('An account with this email already exists');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak. Use at least 6 characters');
      } else {
        toast.error('Failed to create account. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2 className="auth-form-title">Create Account</h2>
      <p className="auth-form-subtitle">Start saving and sharing your routes</p>

      <GoogleAuthButton onSuccess={onSuccess} />

      <div className="auth-divider">
        <span>or sign up with email</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="displayName">Name</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            disabled={isLoading}
            autoComplete="name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={isLoading}
            autoComplete="email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            disabled={isLoading}
            autoComplete="new-password"
            required
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            disabled={isLoading}
            autoComplete="new-password"
            required
          />
        </div>

        <button
          type="submit"
          className="auth-submit-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="button-spinner"></span>
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>

        <p className="auth-terms">
          By signing up, you agree to save your trips on our servers
        </p>
      </form>
    </div>
  );
};

export default SignupForm;
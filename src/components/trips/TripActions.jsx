import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTrips } from '../../contexts/TripContext';
import SaveTripModal from './SaveTripModal';
import AuthModal from '../auth/AuthModal';
import { createTripFromMapState } from '../../services/tripService';
import toast from 'react-hot-toast';
import './TripActions.css';

const TripActions = ({ waypoints, settings, route }) => {
  const { user } = useAuth();
  const { currentTrip, saveTrip, updateCurrentTrip, loading } = useTrips();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const canSave = waypoints && waypoints.length >= 2;

  const handleSaveClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsSaveModalOpen(true);
  };

  const handleSave = async (metadata) => {
    try {
      const tripData = createTripFromMapState(waypoints, settings, route);
      const fullTripData = {
        ...tripData,
        name: metadata.name,
        description: metadata.description
      };

      await saveTrip(fullTripData);
      toast.success('Trip saved! 🏍️');
    } catch (error) {
      toast.error('Failed to save trip');
      throw error;
    }
  };

  const handleUpdate = async (metadata) => {
    try {
      const tripData = createTripFromMapState(waypoints, settings, route);
      const updates = {
        ...tripData,
        name: metadata.name,
        description: metadata.description
      };

      await updateCurrentTrip(updates);
      toast.success('Trip updated!');
    } catch (error) {
      toast.error('Failed to update trip');
      throw error;
    }
  };

  // Don't show if not logged in or no waypoints
  if (!canSave) return null;

  return (
    <>
      <div className="trip-actions">
        {currentTrip ? (
          <button
            className="trip-action-btn primary"
            onClick={handleSaveClick}
            disabled={loading}
          >
            <span className="btn-icon">💾</span>
            Save Changes
          </button>
        ) : (
          <button
            className="trip-action-btn primary"
            onClick={handleSaveClick}
            disabled={loading || !user}
          >
            <span className="btn-icon">💾</span>
            {user ? 'Save Trip' : 'Sign in to Save'}
          </button>
        )}
      </div>

      <SaveTripModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={currentTrip ? handleUpdate : handleSave}
        isLoading={loading}
        existingTrip={currentTrip}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signup"
      />
    </>
  );
};

export default TripActions;
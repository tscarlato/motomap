
/**
 * Trip Context Provider
 * Manages saved trips and current trip state
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  saveTrip as saveTripToDb,
  updateTrip as updateTripInDb,
  deleteTrip as deleteTripFromDb,
  getUserTrips,
  getTrip
} from '../services/tripService';

const TripContext = createContext({});

export const useTrips = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrips must be used within TripProvider');
  }
  return context;
};

export const TripProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentTrip, setCurrentTrip] = useState(null);
  const [savedTrips, setSavedTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user's trips when they log in
  useEffect(() => {
    if (user) {
      loadUserTrips();
    } else {
      // Clear trips when user logs out
      setSavedTrips([]);
      setCurrentTrip(null);
    }
  }, [user]);

  // Load all trips for current user
  const loadUserTrips = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const trips = await getUserTrips(user.uid);
      setSavedTrips(trips);
    } catch (err) {
      console.error('Error loading trips:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save a new trip
  const saveTrip = async (tripData) => {
    if (!user) {
      throw new Error('Must be logged in to save trips');
    }

    setLoading(true);
    setError(null);

    try {
      const tripId = await saveTripToDb(user.uid, tripData);
      
      // Reload trips to get the new one
      await loadUserTrips();

      // Set as current trip
      setCurrentTrip({
        id: tripId,
        ...tripData,
        userId: user.uid
      });

      return tripId;
    } catch (err) {
      console.error('Error saving trip:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load a specific trip
  const loadTrip = async (tripId) => {
    setLoading(true);
    setError(null);

    try {
      const trip = await getTrip(tripId);
      setCurrentTrip(trip);
      return trip;
    } catch (err) {
      console.error('Error loading trip:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update current trip
  const updateCurrentTrip = async (updates) => {
    if (!currentTrip || !currentTrip.id) {
      throw new Error('No trip loaded to update');
    }

    setLoading(true);
    setError(null);

    try {
      await updateTripInDb(currentTrip.id, updates);
      
      // Update local state
      setCurrentTrip(prev => ({
        ...prev,
        ...updates
      }));

      // Reload trips list
      await loadUserTrips();
    } catch (err) {
      console.error('Error updating trip:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a trip
  const deleteTrip = async (tripId) => {
    setLoading(true);
    setError(null);

    try {
      await deleteTripFromDb(tripId);
      
      // Remove from local state
      setSavedTrips(prev => prev.filter(t => t.id !== tripId));

      // Clear current trip if it was deleted
      if (currentTrip && currentTrip.id === tripId) {
        setCurrentTrip(null);
      }
    } catch (err) {
      console.error('Error deleting trip:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear current trip (start fresh)
  const clearCurrentTrip = useCallback(() => {
    setCurrentTrip(null);
  }, []);

  // Set current trip (for loading from list)
  const setCurrentTripById = useCallback(async (tripId) => {
    await loadTrip(tripId);
  }, []);

  const value = {
    currentTrip,
    savedTrips,
    loading,
    error,
    saveTrip,
    loadTrip,
    updateCurrentTrip,
    deleteTrip,
    clearCurrentTrip,
    setCurrentTripById,
    refreshTrips: loadUserTrips
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};
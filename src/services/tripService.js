/**
 * Trip Service - Firestore CRUD operations for trips
 */
import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
  } from 'firebase/firestore';
  import { db } from './firebase';
  
  /**
   * Save a new trip to Firestore
   * @param {string} userId - User ID
   * @param {Object} tripData - Trip data (name, description, waypoints, settings, metrics)
   * @returns {Promise<string>} - The created trip ID
   */
  export const saveTrip = async (userId, tripData) => {
    try {
      const tripsRef = collection(db, 'trips');
      
      const tripDoc = {
        userId,
        name: tripData.name,
        description: tripData.description || '',
        waypoints: tripData.waypoints,
        settings: tripData.settings,
        metrics: tripData.metrics || null,
        isShared: false,
        shareToken: null,
        waypointCount: tripData.waypoints.length,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
  
      const docRef = await addDoc(tripsRef, tripDoc);
      console.log('Trip saved with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving trip:', error);
      throw new Error('Failed to save trip');
    }
  };
  
  /**
   * Update an existing trip
   * @param {string} tripId - Trip ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<void>}
   */
  export const updateTrip = async (tripId, updates) => {
    try {
      const tripRef = doc(db, 'trips', tripId);
      
      const updateData = {
        ...updates,
        waypointCount: updates.waypoints ? updates.waypoints.length : undefined,
        updatedAt: serverTimestamp()
      };
  
      await updateDoc(tripRef, updateData);
      console.log('Trip updated:', tripId);
    } catch (error) {
      console.error('Error updating trip:', error);
      throw new Error('Failed to update trip');
    }
  };
  
  /**
   * Delete a trip
   * @param {string} tripId - Trip ID
   * @returns {Promise<void>}
   */
  export const deleteTrip = async (tripId) => {
    try {
      const tripRef = doc(db, 'trips', tripId);
      await deleteDoc(tripRef);
      console.log('Trip deleted:', tripId);
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw new Error('Failed to delete trip');
    }
  };
  
  /**
   * Get a single trip by ID
   * @param {string} tripId - Trip ID
   * @returns {Promise<Object>} - Trip data with ID
   */
  export const getTrip = async (tripId) => {
    try {
      const tripRef = doc(db, 'trips', tripId);
      const tripSnap = await getDoc(tripRef);
  
      if (!tripSnap.exists()) {
        throw new Error('Trip not found');
      }
  
      return {
        id: tripSnap.id,
        ...tripSnap.data()
      };
    } catch (error) {
      console.error('Error getting trip:', error);
      throw new Error('Failed to load trip');
    }
  };
  
  /**
   * Get all trips for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of trips
   */
  export const getUserTrips = async (userId) => {
    try {
      const tripsRef = collection(db, 'trips');
      const q = query(
        tripsRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
  
      const querySnapshot = await getDocs(q);
      const trips = [];
  
      querySnapshot.forEach((doc) => {
        trips.push({
          id: doc.id,
          ...doc.data()
        });
      });
  
      console.log(`Loaded ${trips.length} trips for user ${userId}`);
      return trips;
    } catch (error) {
      console.error('Error getting user trips:', error);
      throw new Error('Failed to load trips');
    }
  };
  
  /**
   * Create a trip object from current map state
   * @param {Array} waypoints - Current waypoints
   * @param {Object} settings - Current map settings
   * @param {Object} route - Current route (optional)
   * @returns {Object} - Trip data ready for saving
   */
  export const createTripFromMapState = (waypoints, settings, route = null) => {
    const tripData = {
      waypoints: waypoints.map(wp => ({
        order: wp.order,
        lat: wp.position.lat,
        lng: wp.position.lng,
        address: wp.address
      })),
      settings: {
        avoidHighways: settings.avoidHighways
      }
    };
  
    // Add cached metrics if route is available
    if (route && route.totals) {
      tripData.metrics = {
        totalDistance: parseFloat(route.totals.distance.miles),
        totalDuration: route.totals.duration.minutes,
        legCount: route.totals.legCount
      };
    }
  
    return tripData;
  };
/**
 * Share Service - Trip sharing functionality
 */
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { nanoid } from 'nanoid';

/**
 * Generate a secure share token
 * @returns {string} - Random 21-character token
 */
const generateShareToken = () => {
  return nanoid(21); // 21 chars = ~149 bits entropy
};

/**
 * Enable sharing for a trip
 * @param {string} tripId - Trip ID
 * @returns {Promise<string>} - The share token
 */
export const enableTripSharing = async (tripId) => {
  try {
    // Generate unique token
    const shareToken = generateShareToken();
    
    // Update trip with share token
    const tripRef = doc(db, 'trips', tripId);
    await updateDoc(tripRef, {
      isShared: true,
      shareToken
    });

    // Create sharedTrips document for fast lookup
    const sharedTripRef = doc(db, 'sharedTrips', shareToken);
    await setDoc(sharedTripRef, {
      tripId,
      createdAt: new Date(),
      expiresAt: null // null = never expires
    });

    console.log('Trip sharing enabled:', shareToken);
    return shareToken;
  } catch (error) {
    console.error('Error enabling trip sharing:', error);
    throw new Error('Failed to enable sharing');
  }
};

/**
 * Disable sharing for a trip
 * @param {string} tripId - Trip ID
 * @param {string} shareToken - Current share token
 * @returns {Promise<void>}
 */
export const disableTripSharing = async (tripId, shareToken) => {
  try {
    // Update trip to remove sharing
    const tripRef = doc(db, 'trips', tripId);
    await updateDoc(tripRef, {
      isShared: false,
      shareToken: null
    });

    // Note: We don't delete the sharedTrips document
    // This prevents token reuse and maintains audit trail
    // Old links will just show "Trip not found"

    console.log('Trip sharing disabled');
  } catch (error) {
    console.error('Error disabling trip sharing:', error);
    throw new Error('Failed to disable sharing');
  }
};

/**
 * Get a shared trip by token (public access)
 * @param {string} shareToken - Share token from URL
 * @returns {Promise<Object>} - Trip data
 */
export const getSharedTrip = async (shareToken) => {
  try {
    // First, look up the trip ID from the share token
    const sharedTripRef = doc(db, 'sharedTrips', shareToken);
    const sharedTripSnap = await getDoc(sharedTripRef);

    if (!sharedTripSnap.exists()) {
      throw new Error('Share link not found or expired');
    }

    const { tripId } = sharedTripSnap.data();

    // Get the actual trip data
    const tripRef = doc(db, 'trips', tripId);
    const tripSnap = await getDoc(tripRef);

    if (!tripSnap.exists()) {
      throw new Error('Trip not found');
    }

    const tripData = tripSnap.data();

    // Verify trip is still shared
    if (!tripData.isShared) {
      throw new Error('This trip is no longer shared');
    }

    console.log('Loaded shared trip:', tripId);
    return {
      id: tripSnap.id,
      ...tripData
    };
  } catch (error) {
    console.error('Error getting shared trip:', error);
    throw error;
  }
};

/**
 * Copy a shared trip to user's account
 * @param {string} userId - User ID
 * @param {Object} sharedTrip - Shared trip data
 * @returns {Promise<string>} - New trip ID
 */
export const copySharedTripToAccount = async (userId, sharedTrip) => {
  try {
    const { saveTrip } = await import('./tripService');
    
    // Create a copy of the trip for the user
    const tripData = {
      name: `${sharedTrip.name} (Copy)`,
      description: sharedTrip.description || '',
      waypoints: sharedTrip.waypoints,
      settings: sharedTrip.settings,
      metrics: sharedTrip.metrics
    };

    const newTripId = await saveTrip(userId, tripData);
    console.log('Shared trip copied to user account:', newTripId);
    return newTripId;
  } catch (error) {
    console.error('Error copying shared trip:', error);
    throw new Error('Failed to copy trip');
  }
};

/**
 * Generate shareable URL
 * @param {string} shareToken - Share token
 * @returns {string} - Full shareable URL
 */
export const generateShareURL = (shareToken) => {
  return `${window.location.origin}/shared/${shareToken}`;
};
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '../../contexts/TripContext';
import TripCard from './TripCard';
import DeleteConfirmModal from './DeleteConfirmModal';
import ShareTripModal from './ShareTripModal';
import { enableTripSharing, disableTripSharing, generateShareURL } from '../../services/shareService';
import toast from 'react-hot-toast';
import './MyTripsView.css';

const MyTripsView = () => {
  const navigate = useNavigate();
  const { savedTrips, loading, deleteTrip, setCurrentTripById, refreshTrips } = useTrips();
  const [tripToDelete, setTripToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shareModalState, setShareModalState] = useState({ isOpen: false, trip: null, shareURL: null });
  const [isTogglingShare, setIsTogglingShare] = useState(false);

  console.log('MyTripsView - savedTrips:', savedTrips);
  console.log('MyTripsView - loading:', loading);

  const handleLoadTrip = async (tripId) => {
    try {
      await setCurrentTripById(tripId);
      navigate('/');
      toast.success('Trip loaded!');
    } catch (error) {
      toast.error('Failed to load trip');
    }
  };

  const handleDeleteClick = (trip) => {
    setTripToDelete(trip);
  };

  const handleConfirmDelete = async () => {
    if (!tripToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTrip(tripToDelete.id);
      toast.success('Trip deleted');
      setTripToDelete(null);
    } catch (error) {
      toast.error('Failed to delete trip');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShareClick = async (trip) => {
    console.log('Share button clicked!', trip);
    
    if (trip.isShared && trip.shareToken) {
      console.log('Trip already shared, showing existing link');
      const shareURL = generateShareURL(trip.shareToken);
      setShareModalState({ isOpen: true, trip, shareURL });
    } else {
      console.log('Enabling sharing for trip:', trip.id);
      try {
        const shareToken = await enableTripSharing(trip.id);
        console.log('Share token generated:', shareToken);
        const shareURL = generateShareURL(shareToken);
        await refreshTrips();
        setShareModalState({ isOpen: true, trip, shareURL });
        toast.success('Sharing enabled!');
      } catch (error) {
        console.error('Share error:', error);
        toast.error('Failed to enable sharing');
      }
    }
  };

  const handleDisableSharing = async () => {
    if (!shareModalState.trip) return;

    setIsTogglingShare(true);
    try {
      await disableTripSharing(shareModalState.trip.id, shareModalState.trip.shareToken);
      await refreshTrips();
      toast.success('Sharing disabled');
      setShareModalState({ isOpen: false, trip: null, shareURL: null });
    } catch (error) {
      toast.error('Failed to disable sharing');
    } finally {
      setIsTogglingShare(false);
    }
  };

  if (loading && savedTrips.length === 0) {
    return (
      <div className="my-trips-view">
        <div className="trips-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Map
          </button>
          <h1>My Trips</h1>
        </div>
        <div className="trips-loading">
          <div className="loading-spinner-large"></div>
          <p>Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="my-trips-view">
        <div className="trips-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Map
          </button>
          <h1>My Trips</h1>
          <p className="trips-count">{savedTrips.length} saved trip{savedTrips.length !== 1 ? 's' : ''}</p>
        </div>

        {savedTrips.length === 0 ? (
          <div className="trips-empty">
            <div className="empty-icon">🗺️</div>
            <h2>No Trips Yet</h2>
            <p>Plan a route on the map and save it to get started!</p>
            <button className="primary-button" onClick={() => navigate('/')}>
              Start Planning
            </button>
          </div>
        ) : (
          <div className="trips-grid">
            {savedTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onLoad={() => handleLoadTrip(trip.id)}
                onDelete={() => handleDeleteClick(trip)}
                onShare={() => handleShareClick(trip)}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={!!tripToDelete}
        tripName={tripToDelete?.name}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTripToDelete(null)}
        isDeleting={isDeleting}
      />

      <ShareTripModal
        isOpen={shareModalState.isOpen}
        onClose={() => setShareModalState({ isOpen: false, trip: null, shareURL: null })}
        shareURL={shareModalState.shareURL}
        onDisableSharing={handleDisableSharing}
        isDisabling={isTogglingShare}
      />
    </>
  );
};

export default MyTripsView;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '../../contexts/TripContext';
import TripCard from './TripCard';
import DeleteConfirmModal from './DeleteConfirmModal';
import toast from 'react-hot-toast';
import './MyTripsView.css';

const MyTripsView = () => {
  const navigate = useNavigate();
  const { savedTrips, loading, deleteTrip, setCurrentTripById } = useTrips();
  const [tripToDelete, setTripToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
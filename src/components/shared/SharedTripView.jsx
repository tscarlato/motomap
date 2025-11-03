import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTrips } from '../../contexts/TripContext';
import MapContainer from '../MapContainer';
import WaypointList from '../WaypointList';
import RouteMetrics from '../RouteMetrics';
import AuthModal from '../auth/AuthModal';
import { getSharedTrip, copySharedTripToAccount } from '../../services/shareService';
import { calculateRoute } from '../../utils/routeCalculator';
import { GOOGLE_MAPS_LIBRARIES } from '../../utils/mapConfig';
import toast from 'react-hot-toast';
import './SharedTripView.css';

const SharedTripView = () => {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshTrips } = useTrips();
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  const [trip, setTrip] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load shared trip
  useEffect(() => {
    const loadTrip = async () => {
      try {
        const sharedTrip = await getSharedTrip(shareToken);
        setTrip(sharedTrip);

        // Convert trip waypoints to map format
        const waypointsFromTrip = sharedTrip.waypoints.map(wp => ({
          id: `shared-${wp.order}`,
          position: { lat: wp.lat, lng: wp.lng },
          address: wp.address,
          order: wp.order
        }));
        
        setWaypoints(waypointsFromTrip);
        setLoading(false);
      } catch (err) {
        console.error('Error loading shared trip:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadTrip();
  }, [shareToken]);

  // Calculate route when waypoints are loaded
  useEffect(() => {
    if (!isLoaded || waypoints.length < 2 || !trip) return;

    const calcRoute = async () => {
      setIsCalculating(true);
      try {
        const calculatedRoute = await calculateRoute(
          waypoints,
          trip.settings?.avoidHighways || true
        );
        setRoute(calculatedRoute);
      } catch (error) {
        console.error('Error calculating route:', error);
      } finally {
        setIsCalculating(false);
      }
    };

    calcRoute();
  }, [waypoints, isLoaded, trip]);

  const handleCopyToMyTrips = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsCopying(true);
    try {
      await copySharedTripToAccount(user.uid, trip);
      await refreshTrips();
      toast.success('Trip copied to your account!');
      navigate('/trips');
    } catch (error) {
      toast.error('Failed to copy trip');
    } finally {
      setIsCopying(false);
    }
  };

  if (loading) {
    return (
      <div className="shared-trip-view">
        <div className="shared-loading">
          <div className="loading-spinner-large"></div>
          <p>Loading shared trip...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-trip-view">
        <div className="shared-error">
          <h2>⚠️ Trip Not Found</h2>
          <p>{error}</p>
          <button className="btn-go-home" onClick={() => navigate('/')}>
            Go to MotoMap
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="shared-trip-view">
        {/* Header */}
        <div className="shared-header">
          <div className="shared-header-content">
            <div className="shared-trip-info">
              <span className="view-only-badge">👁️ View Only</span>
              <h1 className="shared-trip-name">{trip.name}</h1>
              {trip.description && (
                <p className="shared-trip-description">{trip.description}</p>
              )}
            </div>
            <button
              className="copy-to-trips-btn"
              onClick={handleCopyToMyTrips}
              disabled={isCopying}
            >
              {isCopying ? 'Copying...' : '📋 Copy to My Trips'}
            </button>
          </div>
        </div>

        {/* Map and Details */}
        <div className="shared-content">
          <MapContainer
            center={waypoints[0]?.position || { lat: 37.7749, lng: -122.4194 }}
            zoom={10}
            waypoints={waypoints}
            route={route}
            onMapClick={() => {}} // No interaction
            avoidHighways={trip.settings?.avoidHighways || true}
            onToggleHighways={() => {}} // No interaction
            onClearAll={() => {}} // No interaction
            isLoaded={isLoaded}
          />

          <div className="shared-panel">
            <div className="shared-panel-header">
              <h2>Trip Details</h2>
            </div>

            <WaypointList
              waypoints={waypoints}
              onRemoveWaypoint={() => {}} // Read-only
            />

            {waypoints.length >= 2 && (
              <RouteMetrics route={route} isCalculating={isCalculating} />
            )}

            <div className="shared-footer">
              <p className="footer-text">
                Want to create your own routes?
              </p>
              <button
                className="btn-create-account"
                onClick={() => navigate('/')}
              >
                Try MotoMap Free
              </button>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signup"
      />
    </>
  );
};

export default SharedTripView;
import React from 'react';
import './TripCard.css';

const TripCard = ({ trip, onLoad, onDelete, onShare }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    try {
      // Handle Firestore Timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  const formatDistance = (miles) => {
    if (!miles) return 'N/A';
    return `${miles} mi`;
  };

  return (
    <div className="trip-card">
      <div className="trip-card-header">
        <h3 className="trip-name">{trip.name}</h3>
        {trip.description && (
          <p className="trip-description">{trip.description}</p>
        )}
      </div>

      <div className="trip-card-stats">
        <div className="trip-stat">
          <span className="stat-icon">📍</span>
          <span className="stat-value">{trip.waypointCount || trip.waypoints?.length || 0}</span>
          <span className="stat-label">stops</span>
        </div>

        {trip.metrics?.totalDistance && (
          <div className="trip-stat">
            <span className="stat-icon">📏</span>
            <span className="stat-value">{formatDistance(trip.metrics.totalDistance)}</span>
            <span className="stat-label">distance</span>
          </div>
        )}

        {trip.settings?.avoidHighways && (
          <div className="trip-badge">
            <span>🛣️ Scenic Route</span>
          </div>
        )}
      </div>

      <div className="trip-card-footer">
        <span className="trip-date">
          Updated {formatDate(trip.updatedAt)}
        </span>
      </div>

      <div className="trip-card-actions">
        <button
          className="trip-card-btn primary"
          onClick={onLoad}
        >
          Load Trip
        </button>
        <button
          className="trip-card-btn danger"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TripCard;
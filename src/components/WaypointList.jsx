import React from 'react';
import './WaypointList.css';

const WaypointList = ({ waypoints, onRemoveWaypoint }) => {
  if (waypoints.length === 0) {
    return null;
  }

  return (
    <div className="waypoint-list">
      <div className="waypoint-list-header">
        <span className="list-title">Route Stops</span>
        <span className="list-count">{waypoints.length} waypoint{waypoints.length !== 1 ? 's' : ''}</span>
      </div>
      
      <div className="waypoint-items">
        {waypoints.map((waypoint, index) => (
          <div key={waypoint.id} className="waypoint-item">
            <div className="waypoint-marker">
              <span className="marker-number">{waypoint.order}</span>
            </div>
            
            <div className="waypoint-details">
              <div className="waypoint-address">{waypoint.address}</div>
              <div className="waypoint-coords">
                {waypoint.position.lat.toFixed(4)}, {waypoint.position.lng.toFixed(4)}
              </div>
            </div>

            <button
              className="waypoint-remove"
              onClick={() => onRemoveWaypoint(waypoint.id)}
              title="Remove this waypoint"
              aria-label={`Remove waypoint ${waypoint.order}`}
            >
              <span className="remove-icon">✕</span>
            </button>
          </div>
        ))}
      </div>

      {waypoints.length === 1 && (
        <div className="waypoint-hint">
          <span className="hint-icon">💡</span>
          <span className="hint-text">Add one more waypoint to see your route</span>
        </div>
      )}
    </div>
  );
};

export default WaypointList;
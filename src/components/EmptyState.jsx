import React from 'react';
import './EmptyState.css';

const EmptyState = ({ type = 'waypoints' }) => {
  if (type === 'waypoints') {
    return (
      <div className="empty-state">
        <div className="empty-icon">📍</div>
        <h3>No Waypoints Yet</h3>
        <p>Click on the map or use the search box to add your first waypoint</p>
        <div className="empty-tips">
          <div className="tip">
            <span className="tip-icon">💡</span>
            <span>Add at least 2 waypoints to see your route</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'route') {
    return (
      <div className="empty-state">
        <div className="empty-icon">🗺️</div>
        <h3>Route Not Calculated</h3>
        <p>Add at least 2 waypoints to calculate your route</p>
      </div>
    );
  }

  return null;
};

export default EmptyState;
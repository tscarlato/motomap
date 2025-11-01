import React from 'react';
import './RouteMetrics.css';

const RouteMetrics = ({ route, isCalculating }) => {
  if (isCalculating) {
    return (
      <div className="route-metrics">
        <div className="metrics-loading">
          <div className="loading-spinner-small"></div>
          <span>Calculating route...</span>
        </div>
      </div>
    );
  }

  if (!route || !route.legs || route.legs.length === 0) {
    return null;
  }

  const { legs, totals } = route;

  return (
    <div className="route-metrics">
      {/* Header */}
      <div className="metrics-header">
        <h3 className="metrics-title">Route Details</h3>
        <span className="metrics-legs-count">{totals.legCount} leg{totals.legCount !== 1 ? 's' : ''}</span>
      </div>

      {/* Per-leg breakdown */}
      <div className="metrics-legs">
        {legs.map((leg) => (
          <div key={leg.legNumber} className="leg-item">
            <div className="leg-header">
              <span className="leg-number">Leg {leg.legNumber}</span>
            </div>
            
            <div className="leg-route">
              <div className="leg-location">
                <span className="location-icon">📍</span>
                <span className="location-text">{leg.startAddress}</span>
              </div>
              <div className="leg-arrow">→</div>
              <div className="leg-location">
                <span className="location-icon">📍</span>
                <span className="location-text">{leg.endAddress}</span>
              </div>
            </div>

            <div className="leg-stats">
              <div className="stat">
                <span className="stat-icon">📏</span>
                <span className="stat-value">{leg.distance.text}</span>
              </div>
              <div className="stat-divider">•</div>
              <div className="stat">
                <span className="stat-icon">⏱️</span>
                <span className="stat-value">{leg.duration.text}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total summary */}
      <div className="metrics-total">
        <div className="total-header">
          <span className="total-icon">🏁</span>
          <span className="total-title">Total Trip</span>
        </div>
        <div className="total-stats">
          <div className="total-stat">
            <span className="total-stat-label">Distance</span>
            <span className="total-stat-value">{totals.distance.text}</span>
          </div>
          <div className="total-stat-divider"></div>
          <div className="total-stat">
            <span className="total-stat-label">Time</span>
            <span className="total-stat-value">{totals.duration.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteMetrics;
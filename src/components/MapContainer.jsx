import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import {
  MAP_CONTAINER_STYLE,
  MAP_OPTIONS,
  getMarkerLabel,
  ROUTE_POLYLINE_OPTIONS
} from '../utils/mapConfig';
import './MapContainer.css';

const MapContainer = ({ 
  center, 
  zoom, 
  waypoints, 
  route, 
  onMapClick, 
  avoidHighways,
  onToggleHighways,
  onClearAll,
  isLoaded
}) => {
  const [, setMap] = useState(null);
  const mapRef = useRef(null);

  // Handle map load
  const onLoad = useCallback((mapInstance) => {
    console.log('Map loaded successfully');
    setMap(mapInstance);
    mapRef.current = mapInstance;
  }, []);

  // Handle map unmount
  const onUnmount = useCallback(() => {
    setMap(null);
    mapRef.current = null;
  }, []);

  // Handle map click to add waypoint
  const handleMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    // Reverse geocode to get address
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        onMapClick({ lat, lng }, results[0].formatted_address);
      } else {
        // Fallback to coordinates if geocoding fails
        onMapClick({ lat, lng }, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    });
  }, [onMapClick]);

  // Decode polyline for route display
  const getRoutePath = () => {
    if (!route || !route.overview_polyline || !isLoaded) return [];
    
    // Use Google Maps geometry library to decode
    if (!window.google?.maps?.geometry?.encoding) {
      console.warn('Google Maps geometry library not loaded');
      return [];
    }
    
    try {
      const path = window.google.maps.geometry.encoding.decodePath(
        route.overview_polyline
      );
      return path;
    } catch (error) {
      console.error('Error decoding polyline:', error);
      return [];
    }
  };

  const routePath = route && isLoaded ? getRoutePath() : [];

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  console.log('MapContainer render - API Key present:', !!apiKey);
  console.log('Waypoints count:', waypoints.length);
  console.log('Is Loaded:', isLoaded);

  if (!apiKey) {
    return (
      <div className="map-container">
        <div className="map-error">
          <h3>⚠️ API Key Missing</h3>
          <p>Please add your Google Maps API key to <code>.env.local</code></p>
          <p className="error-detail">
            REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here
          </p>
          <p style={{marginTop: '1rem', fontSize: '0.875rem'}}>
            Then restart the development server (npm start)
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="map-container">
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <p>Loading Google Maps...</p>
          <p style={{fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem'}}>
            This may take a moment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={zoom}
        options={MAP_OPTIONS}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
      >
        {/* Render waypoint markers */}
        {waypoints.map((waypoint) => (
          <Marker
            key={waypoint.id}
            position={waypoint.position}
            label={getMarkerLabel(waypoint.order)}
            title={waypoint.address}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: '#667eea',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 10,
              labelOrigin: new window.google.maps.Point(0, 0)
            }}
          />
        ))}

        {/* Render route polyline if available */}
        {route && routePath.length > 0 && (
          <Polyline
            path={routePath}
            options={ROUTE_POLYLINE_OPTIONS}
          />
        )}
      </GoogleMap>

      {/* Map controls overlay */}
      <div className="map-controls">
        <button
          className={`control-button ${avoidHighways ? 'active' : ''}`}
          onClick={onToggleHighways}
          title={avoidHighways ? 'Currently avoiding highways' : 'Currently allowing highways'}
        >
          <span className="icon">🛣️</span>
          {avoidHighways ? 'Avoiding Highways' : 'Allow Highways'}
        </button>
        
        {waypoints.length > 0 && (
          <button
            className="control-button danger"
            onClick={onClearAll}
            title="Clear all waypoints"
          >
            <span className="icon">🗑️</span>
            Clear All
          </button>
        )}
      </div>

      {/* Instructions overlay */}
      {waypoints.length === 0 && (
        <div className="map-instructions">
          <div className="instruction-card">
            <h3>🗺️ Start Planning Your Route</h3>
            <p>Click anywhere on the map to add waypoints</p>
            <p className="instruction-detail">or use the search box to find locations</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapContainer;
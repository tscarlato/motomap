import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import { Toaster } from 'react-hot-toast';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { TripProvider, useTrips } from './contexts/TripContext';
import NavBar from './components/navigation/NavBar';
import MapContainer from './components/MapContainer';
import SearchBox from './components/SearchBox';
import WaypointList from './components/WaypointList';
import RouteMetrics from './components/RouteMetrics';
import TripActions from './components/trips/TripActions';
import EmptyState from './components/EmptyState';
import MyTripsView from './components/trips/MyTripsView';
import SharedTripView from './components/shared/SharedTripView';
import { DEFAULT_CENTER, DEFAULT_ZOOM, GOOGLE_MAPS_LIBRARIES } from './utils/mapConfig';
import { calculateRoute } from './utils/routeCalculator';

function MapView() {
  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  const { currentTrip } = useTrips();

  // State management
  const [waypoints, setWaypoints] = useState([]);
  const [route, setRoute] = useState(null);
  const [mapSettings, setMapSettings] = useState({
    avoidHighways: true,
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM
  });
  const [ui, setUi] = useState({
    isCalculating: false,
    error: null
  });

  // Load trip when currentTrip changes
  useEffect(() => {
    if (currentTrip && currentTrip.waypoints) {
      console.log('Loading trip waypoints:', currentTrip.waypoints);
      
      // Convert trip waypoints to map waypoints
      const waypointsFromTrip = currentTrip.waypoints.map(wp => ({
        id: `trip-${wp.order}-${Date.now()}`,
        position: { lat: wp.lat, lng: wp.lng },
        address: wp.address,
        order: wp.order
      }));
      
      setWaypoints(waypointsFromTrip);
      
      // Apply trip settings
      if (currentTrip.settings) {
        setMapSettings(prev => ({
          ...prev,
          avoidHighways: currentTrip.settings.avoidHighways
        }));
      }
    }
  }, [currentTrip]);

  // Waypoint management functions
  const addWaypoint = useCallback((position, address) => {
    const newWaypoint = {
      id: Date.now().toString(),
      position,
      address,
      order: waypoints.length + 1
    };
    setWaypoints(prev => [...prev, newWaypoint]);
  }, [waypoints.length]);

  const removeWaypoint = useCallback((id) => {
    setWaypoints(prev => {
      const filtered = prev.filter(wp => wp.id !== id);
      // Renumber waypoints after removal
      return filtered.map((wp, index) => ({
        ...wp,
        order: index + 1
      }));
    });
  }, []);

  const clearAllWaypoints = useCallback(() => {
    setWaypoints([]);
    setRoute(null);
    setUi(prev => ({ ...prev, error: null }));
  }, []);

  const toggleHighways = useCallback(() => {
    setMapSettings(prev => ({
      ...prev,
      avoidHighways: !prev.avoidHighways
    }));
  }, []);

  // Handle map click to add waypoint
  const handleMapClick = useCallback((position, address) => {
    console.log('Map clicked:', position, address);
    addWaypoint(position, address);
  }, [addWaypoint]);

  // Handle place selected from search
  const handlePlaceSelected = useCallback((position, address) => {
    console.log('Place selected:', position, address);
    addWaypoint(position, address);
  }, [addWaypoint]);

  // Calculate route whenever waypoints or highway setting changes
  useEffect(() => {
    // Only calculate if Google Maps is loaded
    if (!isLoaded) return;
    
    // Need at least 2 waypoints to calculate a route
    if (waypoints.length < 2) {
      setRoute(null);
      return;
    }

    // Debounce route calculation to avoid excessive API calls
    const timeoutId = setTimeout(async () => {
      setUi(prev => ({ ...prev, isCalculating: true, error: null }));
      
      try {
        console.log('Calculating route for', waypoints.length, 'waypoints');
        const calculatedRoute = await calculateRoute(waypoints, mapSettings.avoidHighways);
        console.log('Route calculated:', calculatedRoute);
        setRoute(calculatedRoute);
        setUi(prev => ({ ...prev, isCalculating: false }));
      } catch (error) {
        console.error('Error calculating route:', error);
        setUi(prev => ({ 
          ...prev, 
          isCalculating: false, 
          error: error.message || 'Failed to calculate route'
        }));
        setRoute(null);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [waypoints, mapSettings.avoidHighways, isLoaded]);

  console.log('App render - Waypoints:', waypoints.length, 'Route:', !!route, 'Maps loaded:', isLoaded);

  // Handle API load error
  if (loadError) {
    return (
      <div className="app">
        <NavBar />
        <div className="app-error">
          <h2>⚠️ Failed to Load Google Maps</h2>
          <p>There was an error loading the Google Maps API.</p>
          <p>Please check your API key and internet connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <NavBar />

      <div className="app-content">
        {/* Map Container */}
        <MapContainer
          center={mapSettings.center}
          zoom={mapSettings.zoom}
          waypoints={waypoints}
          route={route}
          onMapClick={handleMapClick}
          avoidHighways={mapSettings.avoidHighways}
          onToggleHighways={toggleHighways}
          onClearAll={clearAllWaypoints}
          isLoaded={isLoaded}
        />

        {/* Waypoint Panel */}
        <div className="waypoint-panel">
          {/* Search Box */}
          <SearchBox 
            onPlaceSelected={handlePlaceSelected}
            isLoaded={isLoaded}
          />

          {/* Error message if route calculation failed */}
          {ui.error && (
            <div className="route-error">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{ui.error}</span>
            </div>
          )}

          {/* Waypoint List or Empty State */}
          {waypoints.length === 0 ? (
            <EmptyState type="waypoints" />
          ) : (
            <WaypointList 
              waypoints={waypoints} 
              onRemoveWaypoint={removeWaypoint}
            />
          )}

          {/* Route Metrics */}
          {waypoints.length >= 2 && (
            <RouteMetrics 
              route={route} 
              isCalculating={ui.isCalculating}
            />
          )}

          {/* Trip Actions - Save button */}
          <TripActions
            waypoints={waypoints}
            settings={mapSettings}
            route={route}
          />
        </div>
      </div>
    </div>
  );
}

// Main App component wrapped with providers
function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MapView />} />
            <Route path="/trips" element={<MyTripsView />} />
            <Route path="/shared/:shareToken" element={<SharedTripView />} />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </Router>
      </TripProvider>
    </AuthProvider>
  );
}

export default App;
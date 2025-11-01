/**
 * Google Maps configuration and constants
 */

// Default map center (Captain Shreve High School, Shreveport, LA)
export const DEFAULT_CENTER = {
    lat: 32.4654,
    lng: -93.7912
  };
  
  export const DEFAULT_ZOOM = 13;
  
  // Map options for Google Maps
  export const MAP_OPTIONS = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true,
    mapTypeId: 'roadmap',
    gestureHandling: 'greedy', // Allow single-finger panning on mobile
    clickableIcons: false // Prevent default POI clicks from interfering
  };
  
  // Container style for the map
  export const MAP_CONTAINER_STYLE = {
    width: '100%',
    height: '100%'
  };
  
  // Libraries needed for Google Maps API
  export const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry'];
  
  // Custom marker icon styles for waypoints
  export const getMarkerIcon = (order) => ({
    path: window.google?.maps?.SymbolPath?.CIRCLE,
    fillColor: '#667eea',
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 10,
    labelOrigin: new window.google.maps.Point(0, 0)
  });
  
  // Marker label style
  export const getMarkerLabel = (order) => ({
    text: order.toString(),
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 'bold'
  });
  
  // Polyline options for the route
  export const ROUTE_POLYLINE_OPTIONS = {
    strokeColor: '#667eea',
    strokeOpacity: 0.8,
    strokeWeight: 4
  };
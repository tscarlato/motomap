/**
 * Route calculation utilities using Google Directions API
 */

/**
 * Calculate route through multiple waypoints
 * @param {Array} waypoints - Array of waypoint objects with position {lat, lng}
 * @param {boolean} avoidHighways - Whether to avoid highways
 * @returns {Promise<Object>} Route data with legs, polyline, and bounds
 */
export const calculateRoute = async (waypoints, avoidHighways = true) => {
    if (!window.google || !window.google.maps) {
      throw new Error('Google Maps not loaded');
    }
  
    if (!waypoints || waypoints.length < 2) {
      throw new Error('Need at least 2 waypoints to calculate route');
    }
  
    // Create DirectionsService instance
    const directionsService = new window.google.maps.DirectionsService();
  
    // Prepare origin (first waypoint)
    const origin = waypoints[0].position;
  
    // Prepare destination (last waypoint)
    const destination = waypoints[waypoints.length - 1].position;
  
    // Prepare intermediate waypoints (everything between first and last)
    const waypointsForAPI = waypoints.slice(1, -1).map(wp => ({
      location: wp.position,
      stopover: true // This ensures each waypoint is a stop, not just a point to route through
    }));
  
    // Build request
    const request = {
      origin,
      destination,
      waypoints: waypointsForAPI,
      travelMode: window.google.maps.TravelMode.DRIVING,
      avoidHighways,
      optimizeWaypoints: false, // Keep waypoints in the order user added them
      unitSystem: window.google.maps.UnitSystem.IMPERIAL // Miles
    };
  
    console.log('Calculating route with request:', request);
  
    // Make the API call
    return new Promise((resolve, reject) => {
      directionsService.route(request, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          console.log('Route calculated successfully:', result);
          
          // Parse and return the route data
          const parsedRoute = parseDirectionsResult(result);
          resolve(parsedRoute);
        } else {
          console.error('Route calculation failed:', status, result);
          reject(new Error(`Route calculation failed: ${status}`));
        }
      });
    });
  };
  
  /**
   * Parse Google Directions API result into our app's format
   * @param {Object} result - DirectionsResult from Google API
   * @returns {Object} Parsed route data
   */
  const parseDirectionsResult = (result) => {
    const route = result.routes[0];
    
    if (!route) {
      throw new Error('No route found in result');
    }
  
    // Extract legs - this is the KEY data we need for per-leg metrics
    // Each leg represents one segment between consecutive waypoints
    const legs = route.legs.map((leg, index) => ({
      // Leg identification
      legNumber: index + 1,
      
      // Start and end addresses
      startAddress: leg.start_address,
      endAddress: leg.end_address,
      
      // Start and end coordinates
      startLocation: {
        lat: leg.start_location.lat(),
        lng: leg.start_location.lng()
      },
      endLocation: {
        lat: leg.end_location.lat(),
        lng: leg.end_location.lng()
      },
      
      // Distance data
      distance: {
        text: leg.distance.text,      // "28.3 mi"
        value: leg.distance.value,    // 45542 (meters)
        miles: (leg.distance.value * 0.000621371).toFixed(1) // Convert meters to miles
      },
      
      // Duration data
      duration: {
        text: leg.duration.text,      // "45 mins"
        value: leg.duration.value,    // 2700 (seconds)
        minutes: Math.round(leg.duration.value / 60) // Convert seconds to minutes
      },
      
      // Steps for this leg (detailed turn-by-turn, if needed later)
      steps: leg.steps.map(step => ({
        distance: step.distance.text,
        duration: step.duration.text,
        instructions: step.instructions
      }))
    }));
  
    // Calculate totals
    const totals = calculateTotals(legs);
  
    // Extract overview polyline for drawing on map
    const overviewPolyline = route.overview_polyline;
  
    // Get bounds for fitting map to route
    const bounds = {
      northeast: {
        lat: route.bounds.getNorthEast().lat(),
        lng: route.bounds.getNorthEast().lng()
      },
      southwest: {
        lat: route.bounds.getSouthWest().lat(),
        lng: route.bounds.getSouthWest().lng()
      }
    };
  
    return {
      legs,
      totals,
      overview_polyline: overviewPolyline,
      bounds,
      rawResult: result // Keep original for debugging
    };
  };
  
  /**
   * Calculate total distance and duration from all legs
   * @param {Array} legs - Array of leg objects
   * @returns {Object} Totals object
   */
  const calculateTotals = (legs) => {
    const totalMeters = legs.reduce((sum, leg) => sum + leg.distance.value, 0);
    const totalSeconds = legs.reduce((sum, leg) => sum + leg.duration.value, 0);
    
    const totalMiles = (totalMeters * 0.000621371).toFixed(1);
    const totalMinutes = Math.round(totalSeconds / 60);
    
    // Format duration as "X hr Y min"
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    let durationText;
    if (hours > 0) {
      durationText = minutes > 0 
        ? `${hours} hr ${minutes} min`
        : `${hours} hr`;
    } else {
      durationText = `${minutes} min`;
    }
  
    return {
      distance: {
        text: `${totalMiles} mi`,
        value: totalMeters,
        miles: totalMiles
      },
      duration: {
        text: durationText,
        value: totalSeconds,
        minutes: totalMinutes,
        hours,
        minutesRemainder: minutes
      },
      legCount: legs.length
    };
  };
  
  /**
   * Decode polyline string to array of lat/lng coordinates
   * This is used to draw the route line on the map
   * @param {string} encoded - Encoded polyline string
   * @returns {Array} Array of {lat, lng} coordinates
   */
  export const decodePolyline = (encoded) => {
    if (!window.google?.maps?.geometry?.encoding) {
      console.error('Google Maps geometry library not loaded');
      return [];
    }
  
    const path = window.google.maps.geometry.encoding.decodePath(encoded);
    return path.map(point => ({
      lat: point.lat(),
      lng: point.lng()
    }));
  };
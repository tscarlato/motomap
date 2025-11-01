import React, { useRef, useCallback, useState } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import './SearchBox.css';

const SearchBox = ({ onPlaceSelected, isLoaded }) => {
  const [autocomplete, setAutocomplete] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef(null);

  // Handle autocomplete load
  const onLoad = useCallback((autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  }, []);

  // Handle place selection
  const onPlaceChanged = useCallback(() => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const position = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        const address = place.formatted_address || place.name;
        
        // Call the parent callback
        onPlaceSelected(position, address);
        
        // Clear the input
        setSearchValue('');
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      } else {
        console.warn('No geometry found for place:', place);
      }
    }
  }, [autocomplete, onPlaceSelected]);

  // Handle input change
  const handleInputChange = (e) => {
    setSearchValue(e.target.value);
  };

  // Handle input clear
  const handleClear = () => {
    setSearchValue('');
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  // Don't render Autocomplete until Google Maps is loaded
  if (!isLoaded) {
    return (
      <div className="search-box">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Loading search..."
            disabled
            className="search-input search-input-disabled"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="search-box">
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
        options={{
          fields: ['geometry', 'formatted_address', 'name'],
          types: ['establishment', 'geocode']
        }}
      >
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for a location..."
            value={searchValue}
            onChange={handleInputChange}
            className="search-input"
          />
          {searchValue && (
            <button
              className="clear-search-btn"
              onClick={handleClear}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </Autocomplete>
    </div>
  );
};

export default SearchBox;
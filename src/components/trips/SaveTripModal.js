import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './SaveTripModal.css';

const SaveTripModal = ({ isOpen, onClose, onSave, isLoading, existingTrip = null }) => {
  const [name, setName] = useState(existingTrip?.name || '');
  const [description, setDescription] = useState(existingTrip?.description || '');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a trip name');
      return;
    }

    if (name.length > 100) {
      toast.error('Trip name must be under 100 characters');
      return;
    }

    if (description.length > 500) {
      toast.error('Description must be under 500 characters');
      return;
    }

    try {
      await onSave({ name: name.trim(), description: description.trim() });
      onClose();
      setName('');
      setDescription('');
    } catch (error) {
      // Error handled by parent
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setName(existingTrip?.name || '');
      setDescription(existingTrip?.description || '');
      onClose();
    }
  };

  return (
    <div className="save-trip-overlay" onClick={handleClose}>
      <div className="save-trip-modal" onClick={(e) => e.stopPropagation()}>
        <div className="save-trip-header">
          <h2>{existingTrip ? 'Update Trip' : 'Save Trip'}</h2>
          <button 
            className="modal-close-btn" 
            onClick={handleClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="tripName">
              Trip Name <span className="required">*</span>
            </label>
            <input
              id="tripName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Pacific Coast Highway"
              maxLength={100}
              disabled={isLoading}
              autoFocus
              required
            />
            <span className="char-count">{name.length}/100</span>
          </div>

          <div className="form-group">
            <label htmlFor="tripDescription">
              Description <span className="optional">(optional)</span>
            </label>
            <textarea
              id="tripDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about your trip..."
              rows={4}
              maxLength={500}
              disabled={isLoading}
            />
            <span className="char-count">{description.length}/500</span>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <>
                  <span className="button-spinner"></span>
                  Saving...
                </>
              ) : (
                existingTrip ? 'Update' : 'Save Trip'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveTripModal;
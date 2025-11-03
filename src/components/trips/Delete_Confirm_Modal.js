import React from 'react';
import './DeleteConfirmModal.css';

const DeleteConfirmModal = ({ isOpen, tripName, onConfirm, onCancel, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay" onClick={onCancel}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-icon">⚠️</div>
        
        <h2>Delete Trip?</h2>
        
        <p>
          Are you sure you want to delete <strong>"{tripName}"</strong>?
          This action cannot be undone.
        </p>

        <div className="delete-modal-actions">
          <button
            className="btn-cancel"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="btn-delete"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="button-spinner"></span>
                Deleting...
              </>
            ) : (
              'Delete Trip'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
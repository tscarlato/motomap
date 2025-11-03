import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './ShareTripModal.css';

const ShareTripModal = ({ isOpen, onClose, shareURL, onDisableSharing, isDisabling }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareURL);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleDisableSharing = async () => {
    try {
      await onDisableSharing();
      onClose();
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h2>Share Trip</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="share-modal-content">
          <p className="share-description">
            Anyone with this link can view your trip route and waypoints.
            They won't be able to edit it.
          </p>

          <div className="share-link-container">
            <input
              type="text"
              value={shareURL}
              readOnly
              className="share-link-input"
              onClick={(e) => e.target.select()}
            />
            <button
              className="copy-link-btn"
              onClick={handleCopyLink}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>

          <div className="share-actions">
            <button
              className="btn-disable-sharing"
              onClick={handleDisableSharing}
              disabled={isDisabling}
            >
              {isDisabling ? 'Disabling...' : 'Disable Sharing'}
            </button>
          </div>

          <div className="share-info">
            <p className="info-text">
              💡 Tip: Share this link with your riding buddies so they can see your planned route!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareTripModal;
import React from 'react';

export const LoadingSkeleton: React.FC = () => (
  <div className="pulse-loading-shell" role="status" aria-label="Loading your Pulse workspace">
    <div className="pulse-loading-header"><span className="pulse-skeleton pulse-skeleton-logo" /><span className="pulse-skeleton pulse-skeleton-pill" /></div>
    <div className="pulse-loading-content">
      <span className="pulse-skeleton pulse-skeleton-title" />
      <span className="pulse-skeleton pulse-skeleton-line" />
      <div className="pulse-skeleton pulse-skeleton-map" />
      <div className="pulse-loading-cards"><span className="pulse-skeleton" /><span className="pulse-skeleton" /><span className="pulse-skeleton" /></div>
    </div>
  </div>
);

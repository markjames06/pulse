import React from 'react';

interface PulseLogoProps {
  size?: 'small' | 'large';
  showWordmark?: boolean;
  dark?: boolean;
}

export const PulseLogo: React.FC<PulseLogoProps> = ({ size = 'small', showWordmark = true, dark = false }) => (
  <span className={`pulse-logo ${size === 'large' ? 'pulse-logo-large' : ''} ${dark ? 'pulse-logo-dark' : ''}`}>
    <span className="pulse-logo-mark" aria-hidden="true">
      <span className="pulse-logo-core" />
      <span className="pulse-logo-ring pulse-logo-ring-one" />
      <span className="pulse-logo-ring pulse-logo-ring-two" />
    </span>
    {showWordmark && <span className="pulse-logo-wordmark">Pulse</span>}
  </span>
);

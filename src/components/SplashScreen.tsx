import React from 'react';
import { PulseLogo } from './ui/PulseLogo';

export const SplashScreen: React.FC = () => (
  <div className="pulse-splash" role="status" aria-label="Loading Pulse">
    <div className="pulse-splash-orbit pulse-splash-orbit-one" />
    <div className="pulse-splash-orbit pulse-splash-orbit-two" />
    <PulseLogo size="large" dark />
    <div className="pulse-splash-loader"><span /><span /><span /></div>
    <p>Preparing your circle</p>
  </div>
);

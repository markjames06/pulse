import React from 'react';
import { getInitials } from '../../utils/formatters';

interface AvatarProps {
  name?: string;
  avatarUrl?: string;
  avatarColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPulse?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  avatarUrl,
  avatarColor = 'bg-indigo-600',
  size = 'md',
  showPulse = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  }[size];

  const initials = getInitials(name);

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {showPulse && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      )}
      <div
        className={`${sizeClasses} rounded-full flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-white/10 overflow-hidden ${avatarColor}`}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name || 'User'} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    </div>
  );
};

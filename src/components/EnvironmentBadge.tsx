import React from 'react';
import { config, isDevelopment, isTesting } from '../config/environments';

const EnvironmentBadge: React.FC = () => {
  // Solo mostrar en desarrollo y testing
  if (!isDevelopment() && !isTesting()) {
    return null;
  }

  const getBadgeStyle = () => {
    if (isDevelopment()) {
      return 'bg-blue-500 text-white';
    }
    if (isTesting()) {
      return 'bg-yellow-500 text-black';
    }
    return 'bg-gray-500 text-white';
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50 px-3 py-1 rounded-full text-xs font-bold
      shadow-lg border-2 border-white/20 backdrop-blur-sm
      ${getBadgeStyle()}
    `}>
      🌍 {config.name}
      {config.app.debug && (
        <span className="ml-1 opacity-75">
          v{config.app.version}
        </span>
      )}
    </div>
  );
};

export default EnvironmentBadge; 
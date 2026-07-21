import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { WifiOff, AlertOctagon, RefreshCw } from 'lucide-react';

export const BackendErrorOverlay: React.FC = () => {
  const { connectionStatus, connectionError, reconnect } = useTelemetry();

  if (connectionStatus !== 'error') {
    return null;
  }

  return (
    <div 
      data-testid="backend-error-overlay"
      className="bg-red-950/90 border-b border-red-500 text-red-200 px-6 py-4 backdrop-blur-md font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-50 animate-pulse shadow-lg shadow-red-950/50"
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-red-900/60 border border-red-500 rounded-sm">
          <WifiOff className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <div className="flex items-center space-x-2 text-sm font-extrabold tracking-wider text-red-100 uppercase">
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <span>BACKEND CONNECTION ERROR</span>
          </div>
          <p className="text-xs text-red-300/90 mt-0.5">
            {connectionError || 'No connection with backend service. Telemetry feeds offline.'}
          </p>
        </div>
      </div>

      <button
        onClick={reconnect}
        className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider border border-red-400 rounded-sm transition-all shadow-md active:scale-95 whitespace-nowrap"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>RETRY CONNECTION</span>
      </button>
    </div>
  );
};

export default BackendErrorOverlay;

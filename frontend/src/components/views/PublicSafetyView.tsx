import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { 
  ShieldAlert, 
  Siren, 
  Radio, 
  MapPin, 
  Check, 
  AlertTriangle,
  UserCheck,
  Flame,
  Ambulance,
  Car
} from 'lucide-react';

export const PublicSafetyView: React.FC = () => {
  const { safetyUnits, activeIncidents, avgResponseEtaMinutes } = useTelemetry();
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const triggerDispatch = (callsign: string) => {
    setDispatchStatus(`DISPATCH SIGNAL BROADCAST TO ${callsign}`);
    setTimeout(() => setDispatchStatus(null), 3000);
  };

  return (
    <div className="p-6 space-y-6 font-mono grid-bg">
      {/* Top Banner Header */}
      <div className="p-5 bg-surface border border-outline-variant flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-red-400 font-bold">
            <Siren className="w-4 h-4 text-red-500 animate-pulse" />
            <span>PUBLIC SAFETY & EMERGENCY DISPATCH COMMAND</span>
          </div>
          <h1 className="text-xl font-black text-on-surface tracking-tight font-display mt-0.5">
            EMERGENCY UNIT TRACKING & INCIDENT RESPONSE
          </h1>
          <p className="text-xs text-outline mt-1">
            Real-time unit geolocation, automated AV clearing corridors & incident response metrics
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-surface-container-low p-2 border border-outline-variant">
          <div>
            <div className="text-[10px] text-outline uppercase font-bold">AVG RESPONSE ETA</div>
            <div className="text-sm font-extrabold text-emerald-400">{avgResponseEtaMinutes} MINUTES</div>
          </div>
          <div className="h-6 w-px bg-outline-variant" />
          <div>
            <div className="text-[10px] text-outline uppercase font-bold">ACTIVE UNITS</div>
            <div className="text-sm font-extrabold text-primary">{safetyUnits.length} DEPLOYED</div>
          </div>
        </div>
      </div>

      {dispatchStatus && (
        <div className="p-3 bg-red-950/90 border border-red-500 text-red-200 text-xs font-bold font-mono animate-bounce flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Radio className="w-4 h-4 animate-spin" />
            <span>{dispatchStatus}</span>
          </span>
          <span className="text-[10px] uppercase">STATUS: SENT</span>
        </div>
      )}

      {/* Safety Units Directory & Interactive Dispatch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Safety Units Cards */}
        <div className="lg:col-span-2 p-5 bg-surface border border-outline-variant space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
            <h2 className="text-sm font-bold text-on-surface tracking-wider uppercase font-mono">
              ACTIVE EMERGENCY UNITS DIRECTORY
            </h2>
            <span className="text-xs text-outline">GPS TELEMETRY LOCK ON</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {safetyUnits.length === 0 ? (
              <div className="col-span-full text-center py-8 text-xs text-outline font-mono">
                Awaiting emergency unit GPS telemetry...
              </div>
            ) : (
              safetyUnits.map((unit) => (
                <div key={unit.callsign} className="p-4 bg-surface-container-low border border-outline-variant space-y-3 hover:border-primary transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {unit.type === 'POLICE' ? <Car className="w-4 h-4 text-sky-400" /> :
                       unit.type === 'MEDICAL' ? <Ambulance className="w-4 h-4 text-red-400" /> :
                       unit.type === 'FIRE' ? <Flame className="w-4 h-4 text-amber-400" /> :
                       <Radio className="w-4 h-4 text-emerald-400" />}
                      <span className="font-bold text-sm text-on-surface">{unit.callsign}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold border ${
                      unit.status === 'DISPATCHED' ? 'bg-red-950 border-red-500 text-red-400 animate-pulse' :
                      unit.status === 'EN_ROUTE' ? 'bg-amber-950 border-amber-500 text-amber-400' :
                      'bg-emerald-950 border-emerald-500 text-emerald-400'
                    }`}>
                      {unit.status}
                    </span>
                  </div>

                  <div className="text-xs text-outline space-y-1">
                    <div>SECTOR: <strong className="text-on-surface">{unit.sector}</strong></div>
                    {unit.etaMinutes && (
                      <div>ETA: <strong className="text-primary">{unit.etaMinutes} MINS TO SCENE</strong></div>
                    )}
                  </div>

                  <button
                    onClick={() => triggerDispatch(unit.callsign)}
                    className="w-full py-1.5 bg-surface border border-outline-variant hover:border-red-500 text-on-surface hover:text-red-400 font-mono text-xs font-bold transition-colors uppercase"
                  >
                    DISPATCH CORRIDOR PRIORITY
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Spatial Incident Telemetry Stream */}
        <div className="p-5 bg-surface border border-outline-variant space-y-4">
          <div className="border-b border-outline-variant/60 pb-3">
            <h2 className="text-sm font-bold text-on-surface tracking-wider uppercase font-mono">
              ACTIVE INCIDENT PROTOCOLS
            </h2>
            <p className="text-[11px] text-outline">Real-time emergency dispatch queue</p>
          </div>

          {activeIncidents.length === 0 ? (
            <div className="text-center py-6 text-xs text-outline font-mono">
              No active emergency protocols or incidents reported.
            </div>
          ) : (
            activeIncidents.map((inc) => (
              <div 
                key={inc.id} 
                className={`p-4 bg-surface-container-low border space-y-2 ${
                  inc.priority === 1 ? 'border-red-500/40' : 'border-outline-variant'
                }`}
              >
                <div className={`flex items-center justify-between text-xs font-bold ${
                  inc.priority === 1 ? 'text-red-400' : 'text-amber-400'
                }`}>
                  <span>INCIDENT #{inc.id}</span>
                  <span className={inc.priority === 1 ? 'animate-pulse font-bold' : ''}>
                    PRIORITY {inc.priority}
                  </span>
                </div>
                <div className="text-xs font-bold text-on-surface">{inc.title}</div>
                <p className="text-[11px] text-outline">
                  {inc.description}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

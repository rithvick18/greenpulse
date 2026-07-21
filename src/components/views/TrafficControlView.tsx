import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { 
  Car, 
  Video, 
  Sliders, 
  AlertCircle, 
  Check, 
  Play, 
  Pause, 
  RefreshCw,
  Navigation,
  Activity,
  Layers,
  Radio
} from 'lucide-react';

export const TrafficControlView: React.FC = () => {
  const { intersections, trafficCongestionPercent } = useTelemetry();
  const [signalMode, setSignalMode] = useState<'AI_ADAPTIVE' | 'MANUAL' | 'EMERGENCY_CORRIDOR'>('AI_ADAPTIVE');
  const [cameraActive, setCameraActive] = useState<string>('CAM-01');

  const cameras = [
    { id: 'CAM-01', location: 'Harbor Tunnel Entrance (North)', fps: 60, status: 'LIVE' },
    { id: 'CAM-02', location: 'Grand Ave & 4th Intersection', fps: 60, status: 'LIVE' },
    { id: 'CAM-03', location: 'Expressway Loop 9 Junction', fps: 30, status: 'LIVE' },
    { id: 'CAM-04', location: 'Civic Center Bus Terminal', fps: 60, status: 'LIVE' },
  ];

  return (
    <div className="p-6 space-y-6 font-mono grid-bg">
      {/* Top Header & Signal Matrix Mode Switcher */}
      <div className="p-5 bg-surface border border-outline-variant flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-primary font-bold">
            <Car className="w-4 h-4" />
            <span>TRAFFIC CONTROL CENTER & AI SIGNAL MATRIX</span>
          </div>
          <h1 className="text-xl font-black text-on-surface tracking-tight font-display mt-0.5">
            URBAN TRANSIT & AV VECTOR COMMAND
          </h1>
          <p className="text-xs text-outline mt-1">
            Real-time adaptive signal control, autonomous vehicle corridor prioritization & live optics
          </p>
        </div>

        {/* Override Selector */}
        <div className="flex items-center space-x-2 bg-surface-container-low p-1.5 border border-outline-variant">
          <button
            onClick={() => setSignalMode('AI_ADAPTIVE')}
            className={`px-3 py-1.5 text-xs font-bold transition-all border ${
              signalMode === 'AI_ADAPTIVE'
                ? 'bg-primary-container text-on-primary-container border-primary shadow-sm'
                : 'bg-transparent text-on-surface-variant border-transparent hover:text-primary'
            }`}
          >
            AI ADAPTIVE (AUTO)
          </button>
          <button
            onClick={() => setSignalMode('MANUAL')}
            className={`px-3 py-1.5 text-xs font-bold transition-all border ${
              signalMode === 'MANUAL'
                ? 'bg-amber-500 text-black border-amber-400'
                : 'bg-transparent text-on-surface-variant border-transparent hover:text-primary'
            }`}
          >
            MANUAL OVERRIDE
          </button>
          <button
            onClick={() => setSignalMode('EMERGENCY_CORRIDOR')}
            className={`px-3 py-1.5 text-xs font-bold transition-all border ${
              signalMode === 'EMERGENCY_CORRIDOR'
                ? 'bg-red-600 text-white border-red-400 animate-pulse'
                : 'bg-transparent text-on-surface-variant border-transparent hover:text-red-400'
            }`}
          >
            EMERGENCY CLEARANCE
          </button>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Camera Optics Feed Simulation */}
        <div className="lg:col-span-2 p-5 bg-surface border border-outline-variant space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
            <div className="flex items-center space-x-2">
              <Video className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-bold text-on-surface tracking-wider uppercase font-mono">
                LIVE TRAFFIC OPTICS GRID ({cameraActive})
              </h2>
            </div>
            <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 status-led" />
              <span>OPTICAL TELEMETRY STREAM</span>
            </span>
          </div>

          {/* Camera Canvas Stream Simulation */}
          <div className="relative aspect-video bg-black border-2 border-outline-variant flex flex-col justify-between p-4 overflow-hidden group">
            {/* Top HUD Overlay */}
            <div className="flex items-center justify-between text-xs text-emerald-400 font-mono z-10 bg-black/60 px-3 py-1.5 border border-emerald-500/30">
              <div className="flex items-center space-x-3">
                <span className="font-bold">{cameraActive}</span>
                <span className="text-slate-400">|</span>
                <span>{cameras.find(c => c.id === cameraActive)?.location}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>FPS: 60.0</span>
                <span>RES: 4K HDR</span>
                <span className="text-red-500 font-bold animate-pulse">● REC</span>
              </div>
            </div>

            {/* Simulated Animated Radar / Vehicle Vector Stream Graphics */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80">
              <div className="w-full h-full grid-bg relative">
                {/* Crosshairs & Scanning radar */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/20" />
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/20" />
                
                {/* Simulated Vehicle Bounding Boxes */}
                <div className="absolute top-1/3 left-1/4 px-2 py-1 border border-emerald-400 bg-emerald-950/40 text-[9px] text-emerald-300 font-bold">
                  AV-BUS #402 | 48 MPH
                </div>

                <div className="absolute top-1/2 left-3/4 px-2 py-1 border border-amber-400 bg-amber-950/40 text-[9px] text-amber-300 font-bold">
                  VEHICLE #8901 | 32 MPH
                </div>

                <div className="absolute bottom-1/4 left-1/2 px-2 py-1 border border-red-500 bg-red-950/40 text-[9px] text-red-300 font-bold">
                  SLOWDOWN DETECTED (22 MPH)
                </div>
              </div>
            </div>

            {/* Camera Selectors Footer */}
            <div className="z-10 flex items-center justify-between bg-black/70 p-2 border border-outline-variant">
              <div className="flex items-center space-x-2">
                {cameras.map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => setCameraActive(cam.id)}
                    className={`px-2.5 py-1 text-[10px] font-bold border transition-colors ${
                      cameraActive === cam.id
                        ? 'bg-primary text-black border-primary'
                        : 'bg-surface-container text-on-surface border-outline-variant hover:border-primary'
                    }`}
                  >
                    {cam.id}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-outline">ANALYTICS: 1,420 AV VECTORS ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Intersection Status & Throughput Diagnostics */}
        <div className="p-5 bg-surface border border-outline-variant space-y-4">
          <div className="border-b border-outline-variant/60 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface tracking-wider uppercase font-mono">
              INTERSECTION TELEMETRY
            </h2>
            <RefreshCw className="w-3.5 h-3.5 text-outline cursor-pointer hover:text-primary transition-colors" />
          </div>

          <div className="space-y-3">
            {intersections.map((int) => (
              <div key={int.id} className="p-3 bg-surface-container-low border border-outline-variant/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-on-surface">{int.name}</span>
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold border ${
                    int.signalStatus === 'OPTIMIZED' ? 'bg-emerald-950 border-emerald-500 text-emerald-400' :
                    int.signalStatus === 'CONGESTED' ? 'bg-red-950 border-red-500 text-red-400' :
                    'bg-amber-950 border-amber-500 text-amber-400'
                  }`}>
                    {int.signalStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-outline">
                  <span>THROUGHPUT: <strong className="text-primary">{int.throughput} V/min</strong></span>
                  <span>AV SHARE: <strong className="text-emerald-400">{int.avDensity}%</strong></span>
                </div>

                <div className="w-full bg-surface-container-highest h-1.5 overflow-hidden">
                  <div 
                    className={`h-full ${int.congestion > 75 ? 'bg-red-500' : int.congestion > 40 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                    style={{ width: `${int.congestion}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Command Box */}
          <div className="p-4 bg-surface-container border border-outline-variant space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-primary">
              <Sliders className="w-4 h-4" />
              <span>TRANSIT CORRIDOR PRIORITY</span>
            </div>
            <p className="text-[11px] text-outline">
              Force green wave timing on Expressway Hub 4 to clear peak hour bottleneck.
            </p>
            <button className="w-full py-1.5 bg-surface border border-outline-variant hover:border-primary text-on-surface hover:text-primary font-mono text-xs font-bold transition-colors">
              EXECUTE GREEN WAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { 
  Cpu, 
  Gauge, 
  Activity, 
  CheckCircle2, 
  Flame, 
  AlertTriangle,
  RotateCw,
  Sliders
} from 'lucide-react';

export const IndustrialPrecisionView: React.FC = () => {
  const [lineStatus, setLineStatus] = useState<'RUNNING' | 'PAUSED' | 'CALIBRATING'>('RUNNING');

  const roboticCells = [
    { id: 'ARM-01', location: 'Assembly Line A (Precision Optics)', thermalC: 48.2, maxC: 80, yieldPct: 99.8, status: 'NOMINAL' },
    { id: 'ARM-02', location: 'Assembly Line B (Heavy Stamping)', thermalC: 64.5, maxC: 85, yieldPct: 98.9, status: 'ELEVATED_TEMP' },
    { id: 'ARM-03', location: 'Assembly Line C (Micro Electronics)', thermalC: 41.0, maxC: 75, yieldPct: 99.9, status: 'NOMINAL' },
    { id: 'ARM-04', location: 'Packaging & Automated Sorting', thermalC: 38.5, maxC: 70, yieldPct: 99.5, status: 'NOMINAL' },
  ];

  return (
    <div className="p-6 space-y-6 font-mono grid-bg">
      {/* Top Banner Header */}
      <div className="p-5 bg-surface border border-outline-variant flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-primary font-bold">
            <Cpu className="w-4 h-4 text-primary" />
            <span>INDUSTRIAL PRECISION & HEAVY AUTOMATION COMMAND</span>
          </div>
          <h1 className="text-xl font-black text-on-surface tracking-tight font-display mt-0.5">
            ROBOTICS & MANUFACTURING TELEMETRY
          </h1>
          <p className="text-xs text-outline mt-1">
            High-precision robotic thermal load, vibration harmonics & automated yield control
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-surface-container-low p-2 border border-outline-variant">
          <span className="text-xs text-outline">LINE STATE:</span>
          <span className={`px-2.5 py-1 text-xs font-bold border ${
            lineStatus === 'RUNNING' ? 'bg-emerald-950 border-emerald-500 text-emerald-400' : 'bg-amber-950 border-amber-500 text-amber-400'
          }`}>
            {lineStatus}
          </span>
        </div>
      </div>

      {/* Industrial Robotic Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 bg-surface border border-outline-variant space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
            <h2 className="text-sm font-bold text-on-surface tracking-wider uppercase font-mono">
              ROBOTIC CELL THERMAL & YIELD TELEMETRY
            </h2>
            <span className="text-xs text-outline">4 ROBOTIC CELLS ACTIVE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roboticCells.map((cell) => (
              <div key={cell.id} className="p-4 bg-surface-container-low border border-outline-variant space-y-2 hover:border-primary transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-primary">{cell.id}</span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold border ${
                    cell.status === 'ELEVATED_TEMP' ? 'bg-amber-950 border-amber-500 text-amber-400' : 'bg-emerald-950 border-emerald-500 text-emerald-400'
                  }`}>
                    {cell.status}
                  </span>
                </div>
                <div className="text-xs font-bold text-on-surface">{cell.location}</div>

                <div className="flex items-center justify-between text-xs text-outline pt-1">
                  <span>TEMP: <strong className="text-amber-400">{cell.thermalC} °C</strong></span>
                  <span>YIELD: <strong className="text-emerald-400">{cell.yieldPct}%</strong></span>
                </div>

                <div className="w-full bg-surface-container-highest h-2 border border-outline-variant/40 overflow-hidden">
                  <div 
                    className={`h-full ${cell.thermalC > 60 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                    style={{ width: `${(cell.thermalC / cell.maxC) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Industrial Interlocks & Calibration Control */}
        <div className="p-5 bg-surface border border-outline-variant space-y-4">
          <div className="border-b border-outline-variant/60 pb-3">
            <h2 className="text-sm font-bold text-on-surface tracking-wider uppercase font-mono">
              SAFETY INTERLOCK CONTROLS
            </h2>
            <p className="text-[11px] text-outline">Emergency robotic stop & line rate adjustment</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setLineStatus(prev => prev === 'RUNNING' ? 'PAUSED' : 'RUNNING')}
              className={`w-full py-2 font-mono text-xs font-bold border transition-colors ${
                lineStatus === 'RUNNING' 
                  ? 'bg-amber-500 text-black border-amber-400 hover:bg-amber-400' 
                  : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
              }`}
            >
              {lineStatus === 'RUNNING' ? 'PAUSE ASSEMBLY LINE' : 'RESUME ASSEMBLY LINE'}
            </button>

            <div className="p-3 bg-surface-container-low border border-outline-variant space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                <span>VIBRATION HARMONICS</span>
                <span className="text-emerald-400">0.004 mm/s</span>
              </div>
              <p className="text-[11px] text-outline">Within ISO 10816 precision tolerances.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

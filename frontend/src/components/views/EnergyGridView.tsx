import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { 
  Zap, 
  Sun, 
  Wind, 
  Battery, 
  Flame, 
  ShieldAlert, 
  Activity, 
  SlidersHorizontal,
  RefreshCw,
  Sliders
} from 'lucide-react';

export const EnergyGridView: React.FC = () => {
  const {
    energySources,
    totalPowerMW,
    cleanEnergyPercent,
    substations,
    batteryReserveMWh,
    gridFrequencyHz,
    loadSheddingActive,
    toggleLoadShedding,
  } = useTelemetry();

  return (
    <div className="p-6 space-y-6 font-mono grid-bg">
      {/* Top Banner KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Generation */}
        <div className="p-4 bg-surface border border-outline-variant">
          <div className="flex items-center justify-between text-xs text-outline uppercase font-bold">
            <span>TOTAL GENERATION</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-primary font-display">{totalPowerMW} MW</div>
          <div className="mt-1 text-[10px] text-emerald-400 font-bold">+1.8% vs CONSUMPTION</div>
        </div>

        {/* Clean Energy Ratio */}
        <div className="p-4 bg-surface border border-outline-variant">
          <div className="flex items-center justify-between text-xs text-outline uppercase font-bold">
            <span>RENEWABLE SHARE</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-400 font-display">{cleanEnergyPercent}%</div>
          <div className="mt-1 text-[10px] text-outline">SOLAR + WIND + HYDRO</div>
        </div>

        {/* Grid Reserve Capacity */}
        <div className="p-4 bg-surface border border-outline-variant">
          <div className="flex items-center justify-between text-xs text-outline uppercase font-bold">
            <span>BATTERY RESERVE</span>
            <Battery className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-sky-400 font-display">{batteryReserveMWh} MWh</div>
          <div className="mt-1 text-[10px] text-emerald-400 font-bold">READY FOR DISCHARGE</div>
        </div>

        {/* Frequency Lock */}
        <div className="p-4 bg-surface border border-outline-variant">
          <div className="flex items-center justify-between text-xs text-outline uppercase font-bold">
            <span>GRID FREQUENCY</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-on-surface font-display">{gridFrequencyHz} Hz</div>
          <div className="mt-1 text-[10px] text-emerald-400 font-bold">SYNCHRONIZED</div>
        </div>
      </div>

      {/* Main Grid & Substation Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Power Generation Telemetry Cards */}
        <div className="lg:col-span-2 p-5 bg-surface border border-outline-variant space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
            <h2 className="text-sm font-bold text-on-surface tracking-wider uppercase font-mono">
              HIGH VOLTAGE SUBSTATION HEALTH MATRIX
            </h2>
            <span className="text-xs text-outline">{substations.length} SUBSTATIONS ACTIVE</span>
          </div>

          {substations.length === 0 ? (
            <div className="text-center py-8 text-xs text-outline">
              Awaiting real-time substation data...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {substations.map((sub) => (
                <div key={sub.id} className="p-4 bg-surface-container-low border border-outline-variant hover:border-primary transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-on-surface">{sub.name}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold border ${
                      sub.status === 'HIGH_LOAD' ? 'bg-amber-950 border-amber-500 text-amber-400 animate-pulse' : 'bg-emerald-950 border-emerald-500 text-emerald-400'
                    }`}>
                      {sub.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-outline">
                    <span>VOLTAGE: <strong className="text-on-surface">{sub.voltage}</strong></span>
                    <span>LOAD: <strong className="text-primary">{sub.loadPct}%</strong></span>
                  </div>

                  <div className="w-full bg-surface-container-highest h-2 border border-outline-variant/40 overflow-hidden">
                    <div 
                      className={`h-full ${sub.loadPct > 90 ? 'bg-red-500' : sub.loadPct > 75 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${sub.loadPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load Shedding & Grid Command Controls */}
        <div className="p-5 bg-surface border border-outline-variant space-y-4">
          <div className="border-b border-outline-variant/60 pb-3">
            <h2 className="text-sm font-bold text-on-surface tracking-wider uppercase font-mono">
              LOAD BALANCING & DISPATCH CONTROLS
            </h2>
            <p className="text-[11px] text-outline mt-0.5">High-voltage automated load shedding triggers</p>
          </div>

          <div className="p-4 bg-surface-container-low border border-outline-variant space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface">AUTOMATED LOAD SHED</span>
              <button
                onClick={toggleLoadShedding}
                className={`px-3 py-1 text-xs font-bold border transition-colors ${
                  loadSheddingActive ? 'bg-red-600 border-red-400 text-white animate-pulse' : 'bg-surface border-outline-variant text-on-surface hover:text-primary'
                }`}
              >
                {loadSheddingActive ? 'ARMED' : 'DISARMED'}
              </button>
            </div>
            <p className="text-[11px] text-outline">
              Automatically drops non-critical industrial loads if total grid frequency dips below 49.8 Hz.
            </p>
          </div>

          <div className="p-4 bg-surface-container border border-amber-500/30 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
              <Battery className="w-4 h-4" />
              <span>BATTERY STORAGE DISCHARGE OVERRIDE</span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Inject 100 MW of reserve battery power directly into Substation 03 to relieve high load.
            </p>
            <button className="w-full py-1.5 bg-amber-500 text-black font-mono text-xs font-extrabold hover:bg-amber-400 transition-colors uppercase">
              INJECT BATTERY RESERVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

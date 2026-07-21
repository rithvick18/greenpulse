import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { 
  Zap, 
  Car, 
  Wind, 
  Droplets, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Activity,
  Layers
} from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const { 
    cityHealthIndex, 
    totalPowerMW, 
    peakLoadMW,
    cleanEnergyPercent, 
    trafficCongestionPercent, 
    airQualityAQI, 
    gridFrequencyHz,
    waterPressurePsi,
    seismicMv,
    avCorridorFlow,
    activeAlerts,
    acknowledgeAlert,
    energySources
  } = useTelemetry();

  return (
    <div className="p-6 space-y-6 font-mono grid-bg">
      {/* Top Banner Overview KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* City Health Score */}
        <div className="p-4 bg-surface border border-outline-variant hover:border-primary transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-outline font-bold tracking-wider uppercase">CITY HEALTH INDEX</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-primary tracking-tight font-display">{cityHealthIndex}%</span>
            <span className="text-xs text-emerald-400 font-bold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +0.4%
            </span>
          </div>
          <p className="mt-1 text-[10px] text-outline">OPTIMAL OPERATIONAL STATUS</p>
          <div className="w-full bg-surface-container-highest h-1.5 mt-3">
            <div className="bg-primary h-full transition-all duration-500" style={{ width: `${cityHealthIndex}%` }} />
          </div>
        </div>

        {/* Clean Energy Generation */}
        <div className="p-4 bg-surface border border-outline-variant hover:border-primary transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-outline font-bold tracking-wider uppercase">NET GENERATION</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-on-surface tracking-tight font-mono">{totalPowerMW}</span>
            <span className="text-xs text-outline font-bold">MW</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px]">
            <span className="text-emerald-400 font-bold">{cleanEnergyPercent}% RENEWABLE SHARE</span>
            <span className="text-outline">PEAK LOAD {peakLoadMW} MW</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1.5 mt-3">
            <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${cleanEnergyPercent}%` }} />
          </div>
        </div>

        {/* Traffic Congestion */}
        <div className="p-4 bg-surface border border-outline-variant hover:border-primary transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-outline font-bold tracking-wider uppercase">TRAFFIC CONGESTION</span>
            <Car className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-on-surface tracking-tight font-mono">{trafficCongestionPercent}%</span>
            <span className="text-xs text-emerald-400 font-bold">-1.2% AVG</span>
          </div>
          <p className="mt-1 text-[10px] text-outline">FLOW OPTIMIZED VIA AI MATRIX</p>
          <div className="w-full bg-surface-container-highest h-1.5 mt-3">
            <div className="bg-sky-400 h-full transition-all duration-500" style={{ width: `${trafficCongestionPercent}%` }} />
          </div>
        </div>

        {/* Air Quality Index */}
        <div className="p-4 bg-surface border border-outline-variant hover:border-primary transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-outline font-bold tracking-wider uppercase">AIR QUALITY (AQI)</span>
            <Wind className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-400 tracking-tight font-mono">{airQualityAQI}</span>
            <span className="text-xs text-outline font-bold">EXCELLENT</span>
          </div>
          <p className="mt-1 text-[10px] text-outline">PM 2.5: 8.1 µg/m³ | OZONE: LOW</p>
          <div className="w-full bg-surface-container-highest h-1.5 mt-3">
            <div className="bg-emerald-400 h-full" style={{ width: `${(100 - airQualityAQI)}%` }} />
          </div>
        </div>
      </div>

      {/* Main Telemetry Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Energy Generation Breakdown Chart */}
        <div className="lg:col-span-2 p-5 bg-surface border border-outline-variant space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
            <div>
              <h2 className="text-sm font-bold text-on-surface tracking-wider uppercase font-mono">
                REAL-TIME GRID GENERATION BREAKDOWN
              </h2>
              <p className="text-[11px] text-outline">Power flow distribution by primary sub-sector</p>
            </div>
            <span className="px-2 py-1 bg-surface-container-high border border-outline-variant text-[10px] text-primary font-bold">
              LIVE 60Hz TRACE
            </span>
          </div>

          {/* Energy Breakdown Progress bars */}
          <div className="space-y-3 pt-2">
            {energySources.map((source) => {
              const pct = ((source.outputMW / source.capacityMW) * 100).toFixed(1);
              return (
                <div key={source.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-on-surface font-semibold flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${source.status === 'ONLINE' ? 'bg-emerald-400 status-led' : 'bg-amber-400'}`} />
                      <span>{source.name}</span>
                    </span>
                    <span className="text-outline">
                      <strong className="text-primary">{source.outputMW} MW</strong> / {source.capacityMW} MW ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-2 border border-outline-variant/40 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        source.type === 'solar' ? 'bg-amber-400' :
                        source.type === 'wind' ? 'bg-sky-400' :
                        source.type === 'hydro' ? 'bg-blue-500' :
                        source.type === 'battery' ? 'bg-emerald-400' : 'bg-orange-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Graphical Waveform representation */}
          <div className="mt-4 p-4 bg-surface-container-lowest border border-outline-variant rounded-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-outline uppercase font-bold">SYNCHRONOUS FREQUENCY OSCILLATION ({gridFrequencyHz} Hz)</span>
              <span className="text-[10px] text-emerald-400 font-bold">PHASE LOCK OK</span>
            </div>
            <svg className="w-full h-24 stroke-primary fill-primary/10" viewBox="0 0 500 100">
              <path d="M0 50 Q 25 10, 50 50 T 100 50 T 150 50 T 200 50 T 250 50 T 300 50 T 350 50 T 400 50 T 450 50 T 500 50" fill="none" strokeWidth="2" />
              <path d="M0 50 Q 25 20, 50 50 T 100 50 T 150 50 T 200 50 T 250 50 T 300 50 T 350 50 T 400 50 T 450 50 T 500 50" fill="none" stroke="#fca311" strokeWidth="1" strokeDasharray="4,4" />
            </svg>
          </div>
        </div>

        {/* Environmental & City Sector Status Sidebar */}
        <div className="p-5 bg-surface border border-outline-variant space-y-4">
          <div className="border-b border-outline-variant/60 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface tracking-wider uppercase font-mono">
              SECTOR DIAGNOSTICS
            </h2>
            <RefreshCw className="w-3.5 h-3.5 text-outline cursor-pointer hover:text-primary transition-colors" />
          </div>

          <div className="space-y-3">
            {/* Hydraulic Grid */}
            <div className="p-3 bg-surface-container-low border border-outline-variant/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Droplets className="w-5 h-5 text-sky-400" />
                <div>
                  <div className="text-xs font-bold text-on-surface">WATER PRESSURE MAIN</div>
                  <div className="text-[10px] text-outline">SECTOR 12 (NORTH)</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-emerald-400">{waterPressurePsi} PSI</div>
                <div className="text-[9px] text-outline uppercase">NOMINAL</div>
              </div>
            </div>

            {/* Seismic Activity */}
            <div className="p-3 bg-surface-container-low border border-outline-variant/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-on-surface">SEISMIC STABILITY</div>
                  <div className="text-[10px] text-outline">BASIN NETWORK</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-emerald-400">{seismicMv} Mv</div>
                <div className="text-[9px] text-outline uppercase">QUIESCENT</div>
              </div>
            </div>

            {/* AV Corridor Flow */}
            <div className="p-3 bg-surface-container-low border border-outline-variant/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Layers className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-xs font-bold text-on-surface">AUTONOMOUS CORRIDOR</div>
                  <div className="text-[10px] text-outline">EXPRESSWAY HUB 4</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-primary">{avCorridorFlow.toLocaleString()} AV/h</div>
                <div className="text-[9px] text-emerald-400 uppercase font-bold">CLEAR</div>
              </div>
            </div>
          </div>

          {/* Direct Incident Action Card */}
          <div className="p-4 bg-surface-container border border-primary/40 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-primary">
              <ShieldAlert className="w-4 h-4" />
              <span>COMMAND ACTION REQUIRED</span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Substation 09 load variance requires operator balance approval or automated load shed.
            </p>
            <button className="w-full py-1.5 bg-primary-container text-on-primary-container font-mono text-xs font-bold hover:bg-amber-400 transition-colors uppercase border border-primary">
              REVIEW PROTOCOL
            </button>
          </div>
        </div>
      </div>

      {/* Active City Telemetry & Emergency Alert Feed Table */}
      <div className="p-5 bg-surface border border-outline-variant space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-on-surface tracking-wider uppercase font-mono">
              ACTIVE TELEMETRY ALERTS & INCIDENTS
            </h2>
          </div>
          <span className="text-xs text-outline font-mono">
            SHOWING {activeAlerts.length} CRITICAL ENTRIES
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low text-outline text-[10px] uppercase tracking-wider">
                <th className="p-3">ALERT ID</th>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">LEVEL</th>
                <th className="p-3">SECTOR / NODE</th>
                <th className="p-3">TELEMETRY MESSAGE</th>
                <th className="p-3">STATUS</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {activeAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-surface-container-high transition-colors">
                  <td className="p-3 font-bold text-primary">{alert.id}</td>
                  <td className="p-3 text-outline text-[11px]">{alert.timestamp}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase border ${
                      alert.level === 'CRITICAL' ? 'bg-red-950/80 border-red-500 text-red-400' :
                      alert.level === 'WARNING' ? 'bg-amber-950/80 border-amber-500 text-amber-400' :
                      'bg-sky-950/80 border-sky-500 text-sky-400'
                    }`}>
                      {alert.level}
                    </span>
                  </td>
                  <td className="p-3 text-on-surface font-semibold">{alert.sector}</td>
                  <td className="p-3 text-on-surface-variant max-w-md truncate">{alert.message}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold ${alert.status === 'ACTIVE' ? 'text-amber-400 status-led' : 'text-emerald-400'}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {alert.status === 'ACTIVE' ? (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-2.5 py-1 text-[10px] bg-surface-container border border-outline-variant hover:border-primary text-on-surface font-bold hover:text-primary transition-colors"
                      >
                        ACKNOWLEDGE
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold">CLEARED</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

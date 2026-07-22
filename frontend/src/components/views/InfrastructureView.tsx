import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { 
  Building2, 
  Activity, 
  Droplets, 
  AlertTriangle, 
  Wrench, 
  CheckCircle2,
  Compass,
  Radio
} from 'lucide-react';

export const InfrastructureView: React.FC = () => {
  const { structuralNodes, airQualityAQI, maintenanceQueue, totalSensors, meshHealthPct, nodes } = useTelemetry();

  return (
    <div className="p-6 space-y-6 font-mono grid-bg">
      {/* Top Banner Overview */}
      <div className="p-5 bg-surface border border-outline-variant flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-primary font-bold">
            <Building2 className="w-4 h-4" />
            <span>INFRASTRUCTURE & ENVIRONMENTAL TELEMETRY</span>
          </div>
          <h1 className="text-xl font-black text-on-surface tracking-tight font-display mt-0.5">
            STRUCTURAL INTEGRITY & SENSOR MESH
          </h1>
          <p className="text-xs text-outline mt-1">
            Real-time seismic strain, hydraulic pressure & municipal structure diagnostics
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs bg-surface-container-low p-2 border border-outline-variant">
          <span className="text-outline">TOTAL SENSORS: <strong className="text-on-surface">{totalSensors.toLocaleString()}</strong></span>
          <span className="text-outline">|</span>
          <span className="text-emerald-400 font-bold">MESH HEALTH: {meshHealthPct}%</span>
        </div>
      </div>

      {/* Structural Sensor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Structural Sensor Telemetry Cards */}
        <div className="lg:col-span-2 p-5 bg-surface border border-outline-variant space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
            <h2 className="text-sm font-bold text-on-surface tracking-wider uppercase font-mono">
              KEY STRUCTURAL TELEMETRY NODES
            </h2>
            <span className="text-xs text-outline">STRESS & VIBRATION LIVE FEED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {structuralNodes.length === 0 ? (
              <div className="col-span-full text-center py-8 text-xs text-outline font-mono">
                Awaiting structural stress and vibration sensor data...
              </div>
            ) : (
              structuralNodes.map((node) => (
                <div key={node.id} className="p-4 bg-surface-container-low border border-outline-variant space-y-2 hover:border-primary transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-on-surface">{node.name}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold border ${
                      node.status === 'ELEVATED_STRESS' ? 'bg-amber-950 border-amber-500 text-amber-400' : 'bg-emerald-950 border-emerald-500 text-emerald-400'
                    }`}>
                      {node.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-outline">
                    <span>VIBRATION: <strong className="text-primary">{node.vibrationHz} Hz</strong></span>
                    <span>STRESS LOAD: <strong className="text-on-surface">{node.stressLoad}%</strong></span>
                  </div>

                  <div className="w-full bg-surface-container-highest h-2 border border-outline-variant/40 overflow-hidden">
                    <div 
                      className={`h-full ${node.stressLoad > 75 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${node.stressLoad}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Maintenance Dispatch Request Queue */}
        <div className="p-5 bg-surface border border-outline-variant space-y-4">
          <div className="border-b border-outline-variant/60 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface tracking-wider uppercase font-mono">
              MAINTENANCE DISPATCH QUEUE
            </h2>
            <Wrench className="w-4 h-4 text-primary" />
          </div>

          <div className="space-y-3">
            {maintenanceQueue.length === 0 ? (
              <div className="text-center py-6 text-xs text-outline font-mono">
                Maintenance dispatch queue clear.
              </div>
            ) : (
              maintenanceQueue.map((item) => (
                <div key={item.id} className="p-3 bg-surface-container-low border border-outline-variant/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-primary">{item.id}</span>
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold border ${
                      item.priority === 'HIGH' ? 'bg-red-950 border-red-500 text-red-400' : 'bg-amber-950 border-amber-500 text-amber-400'
                    }`}>
                      {item.priority} PRIORITY
                    </span>
                  </div>
                  <div className="text-xs font-bold text-on-surface">{item.asset}</div>
                  <div className="text-[11px] text-outline">{item.issue}</div>
                  <div className="text-[10px] text-emerald-400 font-bold pt-1">ASSIGNED: {item.assignedTech}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Registered Sensor Nodes (from /api/nodes/) */}
      <div className="p-5 bg-surface border border-outline-variant space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
          <h2 className="text-sm font-bold text-on-surface tracking-wider uppercase font-mono">
            REGISTERED SENSOR NODES
          </h2>
          <span className="text-xs text-outline">{nodes.length} NODES ONLINE</span>
        </div>

        <div className="overflow-x-auto">
          {nodes.length === 0 ? (
            <div className="text-center py-6 text-xs text-outline font-mono">
              No registered sensor nodes reporting.
            </div>
          ) : (
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-outline text-[10px] uppercase tracking-wider">
                  <th className="p-3">NODE ID</th>
                  <th className="p-3">NAME</th>
                  <th className="p-3">TYPE</th>
                  <th className="p-3">LOCATION</th>
                  <th className="p-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {nodes.map((node) => {
                  const online = node.status?.toLowerCase() === 'online';
                  return (
                    <tr key={node.id} className="hover:bg-surface-container-high transition-colors">
                      <td className="p-3 font-bold text-primary">{node.id}</td>
                      <td className="p-3 text-on-surface font-semibold">{node.name}</td>
                      <td className="p-3 text-outline">{node.node_type}</td>
                      <td className="p-3 text-outline">
                        {node.location_lat.toFixed(4)}, {node.location_lon.toFixed(4)}
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold uppercase ${online ? 'text-emerald-400 status-led' : 'text-amber-400'}`}>
                          {node.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

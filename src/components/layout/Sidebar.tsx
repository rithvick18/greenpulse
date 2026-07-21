import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { DashboardTab } from '../../types/dashboard';
import { 
  LayoutDashboard, 
  Car, 
  Zap, 
  Building2, 
  ShieldAlert, 
  Cpu, 
  Activity, 
  Radio, 
  Layers, 
  Database,
  BarChart3
} from 'lucide-react';

interface NavItem {
  id: DashboardTab;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, activeAlerts, emergencyOverrideActive } = useTelemetry();

  const criticalAlertCount = activeAlerts.filter(a => a.level === 'CRITICAL' && a.status === 'ACTIVE').length;

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'GREENPULSE OVERVIEW',
      sublabel: 'City Command & Telemetry',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'traffic',
      label: 'TRAFFIC CONTROL',
      sublabel: 'AI Signal Matrix & AV Routing',
      icon: <Car className="w-5 h-5" />,
    },
    {
      id: 'energy',
      label: 'SMART ENERGY GRID',
      sublabel: 'Load Shedding & Generation',
      icon: <Zap className="w-5 h-5" />,
    },
    {
      id: 'infrastructure',
      label: 'INFRASTRUCTURE',
      sublabel: 'Structural & AQI Telemetry',
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      id: 'public-safety',
      label: 'PUBLIC SAFETY',
      sublabel: 'Dispatch & Surveillance',
      icon: <ShieldAlert className="w-5 h-5" />,
      badge: criticalAlertCount > 0 ? `${criticalAlertCount} ALERTS` : undefined,
    },
    {
      id: 'industrial',
      label: 'INDUSTRIAL PRECISION',
      sublabel: 'Heavy Automation & Yield',
      icon: <Cpu className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-surface-container-lowest border-r border-outline-variant flex flex-col justify-between h-[calc(100vh-57px)] sticky top-[57px] select-none">
      {/* Top Header Logo */}
      <div className="p-4 border-b border-outline-variant bg-surface-container-low">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-container text-on-primary-container flex items-center justify-center font-extrabold text-xl border-2 border-primary shadow-sm">
            GP
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-on-surface font-mono">
              GREENPULSE <span className="text-primary font-black">OS</span>
            </h1>
            <p className="text-[10px] text-outline font-mono uppercase tracking-wider">
              Smart City Command v2.4
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <div className="px-3 py-1 text-[10px] font-bold tracking-widest text-outline uppercase">
          OPERATIONAL MODULES
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-start space-x-3 p-2.5 transition-all text-left font-mono border ${
                isActive
                  ? 'bg-surface-container-high border-primary text-primary shadow-sm'
                  : 'bg-surface border-transparent hover:border-outline-variant hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <div className={`mt-0.5 ${isActive ? 'text-primary' : 'text-outline'}`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold tracking-wide truncate ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.5 text-[9px] font-extrabold bg-red-600 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-outline truncate">{item.sublabel}</div>
              </div>
            </button>
          );
        })}

        {/* Diagnostic Links */}
        <div className="pt-4 px-3 py-1 text-[10px] font-bold tracking-widest text-outline uppercase">
          SYSTEM TELEMETRY
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between p-2 text-xs font-mono text-on-surface-variant bg-surface border border-outline-variant/40">
            <span className="flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>CORE LATENCY</span>
            </span>
            <span className="text-primary font-bold">1.2ms</span>
          </div>

          <div className="flex items-center justify-between p-2 text-xs font-mono text-on-surface-variant bg-surface border border-outline-variant/40">
            <span className="flex items-center space-x-2">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>SENSOR MESH</span>
            </span>
            <span className="text-on-surface font-bold">14,820 NODES</span>
          </div>

          <div className="flex items-center justify-between p-2 text-xs font-mono text-on-surface-variant bg-surface border border-outline-variant/40">
            <span className="flex items-center space-x-2">
              <Radio className="w-3.5 h-3.5 text-sky-400" />
              <span>TELEM STREAM</span>
            </span>
            <span className="text-emerald-400 font-bold">LIVE 60Hz</span>
          </div>
        </div>
      </nav>

      {/* Footer System Status Panel */}
      <div className="p-3 border-t border-outline-variant bg-surface-container-low font-mono text-xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-outline font-bold">NETWORK ENCRYPTION</span>
          <span className="text-[10px] text-emerald-400 font-extrabold">AES-256-GCM</span>
        </div>
        <div className="w-full bg-surface-container-highest h-1.5 overflow-hidden">
          <div className="bg-primary h-full w-[94%]" />
        </div>
        <div className="mt-2 text-[10px] text-outline text-right">
          BUILD 2.4.0-PROD
        </div>
      </div>
    </aside>
  );
};

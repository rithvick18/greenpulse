import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { 
  Sun, 
  Moon, 
  Search, 
  ShieldAlert, 
  Radio, 
  Terminal, 
  SlidersHorizontal,
  Bell
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    themeMode, 
    toggleTheme, 
    emergencyOverrideActive, 
    toggleEmergencyOverride,
    cityHealthIndex,
    searchQuery,
    setSearchQuery,
    activeAlerts
  } = useTelemetry();

  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeAlertCount = activeAlerts.filter(a => a.status === 'ACTIVE').length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b border-outline-variant bg-surface/90 backdrop-blur-md">
      {/* Left section: Breadcrumb & Live Ticker */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider text-outline uppercase">
          <Terminal className="w-4 h-4 text-primary" />
          <span>GREENPULSE OS</span>
          <span className="text-outline-variant">/</span>
          <span className="text-primary font-bold">CORE COMMAND PLATFORM</span>
        </div>

        <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-surface-container-low border border-outline-variant rounded-sm text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${emergencyOverrideActive ? 'bg-red-500 animate-ping' : 'bg-emerald-400 status-led'}`} />
          <span className="text-on-surface-variant font-medium">
            {emergencyOverrideActive ? 'EMERGENCY PROTOCOL ACTIVE' : 'SYSTEMS NOMINAL'}
          </span>
          <span className="text-outline px-1">|</span>
          <span className="text-primary font-bold">{cityHealthIndex}% HEALTH</span>
        </div>
      </div>

      {/* Center section: Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH SECTOR, GRID NODE, OR INCIDENT..."
            className="w-full pl-9 pr-4 py-1.5 bg-surface-container-lowest border border-outline-variant focus:border-primary text-xs font-mono text-on-surface placeholder:text-outline-variant focus:outline-none transition-colors"
          />
          <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-outline cursor-pointer hover:text-primary transition-colors" />
        </div>
      </div>

      {/* Right section: System Clock, Alert Badge, Theme Toggle & Emergency Override */}
      <div className="flex items-center space-x-4">
        <div className="hidden sm:block text-right font-mono text-xs text-on-surface-variant">
          <div className="text-[10px] text-outline font-semibold tracking-widest uppercase">SYSTEM TIME</div>
          <div className="text-primary font-medium text-xs">{timeStr || '--:--:-- UTC'}</div>
        </div>

        {/* Notifications pill */}
        <div className="relative">
          <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors rounded-sm border border-outline-variant">
            <Bell className="w-4 h-4" />
            {activeAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black">
                {activeAlertCount}
              </span>
            )}
          </button>
        </div>

        {/* Theme switcher */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${themeMode === 'dark' ? 'Industrial Precision (Light)' : 'Industrial Steel (Dark)'}`}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-mono border border-outline-variant hover:border-primary bg-surface-container text-on-surface hover:text-primary transition-all rounded-sm"
        >
          {themeMode === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline text-[11px]">LIGHT MODE</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xl:inline text-[11px]">STEEL DARK</span>
            </>
          )}
        </button>

        {/* Emergency Override Button */}
        <button
          onClick={toggleEmergencyOverride}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider transition-all border ${
            emergencyOverrideActive
              ? 'bg-red-600 border-red-400 text-white animate-pulse shadow-lg shadow-red-900/50'
              : 'bg-primary-container text-on-primary-container border-primary hover:bg-amber-400'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span className="hidden sm:inline">
            {emergencyOverrideActive ? 'OVERRIDE ON' : 'EMERGENCY OVERRIDE'}
          </span>
        </button>

        {/* Operator Badge */}
        <div className="hidden xl:flex items-center space-x-2 pl-2 border-l border-outline-variant">
          <div className="w-7 h-7 bg-surface-container-highest border border-outline flex items-center justify-center font-bold text-xs text-primary">
            A7
          </div>
          <div className="text-[10px] font-mono leading-tight">
            <div className="text-on-surface font-bold">OPERATOR ALPHA-7</div>
            <div className="text-outline">CLEARANCE LVL 4</div>
          </div>
        </div>
      </div>
    </header>
  );
};

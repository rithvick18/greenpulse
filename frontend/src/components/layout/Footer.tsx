import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { ShieldCheck, Cpu, HardDrive, Wifi, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { cityHealthIndex } = useTelemetry();

  return (
    <footer className="h-9 border-t border-outline-variant bg-surface-container-lowest px-6 flex items-center justify-between font-mono text-[11px] text-on-surface-variant z-20">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-1.5 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="font-bold">SYSTEM INTEGRITY: {cityHealthIndex}% NOMINAL</span>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 text-outline">
          <Cpu className="w-3.5 h-3.5 text-primary" />
          <span>CPU: <strong className="text-on-surface">24%</strong></span>
        </div>

        <div className="hidden md:flex items-center space-x-1.5 text-outline">
          <HardDrive className="w-3.5 h-3.5 text-amber-400" />
          <span>RAM: <strong className="text-on-surface">8.4 / 32 GB</strong></span>
        </div>

        <div className="hidden lg:flex items-center space-x-1.5 text-outline">
          <Wifi className="w-3.5 h-3.5 text-sky-400" />
          <span>BANDWIDTH: <strong className="text-on-surface">1.4 GB/s</strong></span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 text-outline">
          <Clock className="w-3.5 h-3.5" />
          <span>UPTIME: <strong className="text-primary font-bold">412D 14H 22M</strong></span>
        </div>
        <span className="text-outline-variant">|</span>
        <div className="text-[10px] text-outline uppercase">
          GREENPULSE OS &copy; 2026 MUNICIPAL AUTOMATION
        </div>
      </div>
    </footer>
  );
};

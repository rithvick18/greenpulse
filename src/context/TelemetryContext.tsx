import React, { createContext, useContext, useState, useEffect } from 'react';
import { DashboardTab, ThemeMode, AlertItem, EnergySource, IntersectionData, PublicSafetyUnit, StructuralNode } from '../types/dashboard';

interface TelemetryContextType {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  cityHealthIndex: number;
  totalPowerMW: number;
  cleanEnergyPercent: number;
  trafficCongestionPercent: number;
  airQualityAQI: number;
  activeAlerts: AlertItem[];
  acknowledgeAlert: (id: string) => void;
  energySources: EnergySource[];
  intersections: IntersectionData[];
  safetyUnits: PublicSafetyUnit[];
  structuralNodes: StructuralNode[];
  emergencyOverrideActive: boolean;
  toggleEmergencyOverride: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const initialAlerts: AlertItem[] = [
  { id: 'ALT-8092', timestamp: '09:01:04 UTC', level: 'CRITICAL', sector: 'SECTOR 04-A HARBOR TUNNEL', message: 'Thermal surge detected in ventilation shaft #3. Automatic dampeners engaged.', status: 'ACTIVE' },
  { id: 'ALT-8091', timestamp: '09:00:22 UTC', level: 'WARNING', sector: 'SUBSTATION 09 (WEST END)', message: 'High load capacity reached (92%). Automated load balance shift initiated.', status: 'ACTIVE' },
  { id: 'ALT-8089', timestamp: '08:58:11 UTC', level: 'INFO', sector: 'CENTRAL AV SIGNAL MATRIX', message: 'Adaptive AV corridor clearance route active for Emergency MED-82.', status: 'ACTIVE' },
  { id: 'ALT-8084', timestamp: '08:54:30 UTC', level: 'WARNING', sector: 'WATER MAIN #12 (NORTH DOCKS)', message: 'Pressure fluctuation +14 PSI above baseline. Monitoring valve flow.', status: 'ACTIVE' },
];

const initialEnergySources: EnergySource[] = [
  { name: 'Solar Array Alpha (Desert North)', type: 'solar', outputMW: 320.4, capacityMW: 350, efficiency: 91.5, status: 'ONLINE' },
  { name: 'Offshore Wind Farm Beta', type: 'wind', outputMW: 284.1, capacityMW: 300, efficiency: 94.7, status: 'ONLINE' },
  { name: 'River Basin Hydro Hydro-1', type: 'hydro', outputMW: 140.0, capacityMW: 150, efficiency: 93.3, status: 'ONLINE' },
  { name: 'Thermal Plant Reserve Delta', type: 'thermal', outputMW: 98.2, capacityMW: 250, efficiency: 39.2, status: 'STANDBY' },
  { name: 'Grid Battery Storage Facility', type: 'battery', outputMW: 85.0, capacityMW: 100, efficiency: 98.0, status: 'ONLINE' },
];

const initialIntersections: IntersectionData[] = [
  { id: 'INT-01', name: 'Grand Ave & 4th Street', congestion: 42, throughput: 1450, signalStatus: 'OPTIMIZED', avDensity: 68 },
  { id: 'INT-02', name: 'Harbor Blvd & Tunnel Access', congestion: 88, throughput: 2100, signalStatus: 'CONGESTED', avDensity: 82 },
  { id: 'INT-03', name: 'Industrial Parkway & Loop 9', congestion: 18, throughput: 890, signalStatus: 'OPTIMIZED', avDensity: 54 },
  { id: 'INT-04', name: 'Civic Plaza & Metro Terminal', congestion: 65, throughput: 1720, signalStatus: 'MANUAL_OVERRIDE', avDensity: 76 },
];

const initialSafetyUnits: PublicSafetyUnit[] = [
  { callsign: 'UNIT-309', type: 'POLICE', sector: 'SECTOR 02 (DOWNTOWN)', status: 'DISPATCHED', etaMinutes: 3 },
  { callsign: 'MED-82', type: 'MEDICAL', sector: 'SECTOR 04-A (TUNNEL)', status: 'EN_ROUTE', etaMinutes: 5 },
  { callsign: 'FIRE-12', type: 'FIRE', sector: 'SECTOR 04-A (TUNNEL)', status: 'EN_ROUTE', etaMinutes: 4 },
  { callsign: 'PATROL-AV-09', type: 'AV_PATROL', sector: 'SECTOR 09 (WEST)', status: 'STANDBY' },
];

const initialNodes: StructuralNode[] = [
  { id: 'NODE-B1', name: 'Skyway Suspension Span A', type: 'BRIDGE', stressLoad: 34, vibrationHz: 1.2, status: 'STABLE' },
  { id: 'NODE-R4', name: 'Valley Water Reservoir Dam', type: 'RESERVOIR', stressLoad: 58, vibrationHz: 0.4, status: 'STABLE' },
  { id: 'NODE-T3', name: 'Sub-Bay Rail Transit Tunnel', type: 'TUNNEL', stressLoad: 82, vibrationHz: 4.8, status: 'ELEVATED_STRESS' },
  { id: 'NODE-G9', name: 'High-Voltage Pylon Grid 9', type: 'GRID_TOWER', stressLoad: 29, vibrationHz: 0.8, status: 'STABLE' },
];

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('greenpulse_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const [searchQuery, setSearchQuery] = useState('');

  const [cityHealthIndex, setCityHealthIndex] = useState(91.8);
  const [totalPowerMW, setTotalPowerMW] = useState(927.7);
  const [cleanEnergyPercent, setCleanEnergyPercent] = useState(89.4);
  const [trafficCongestionPercent, setTrafficCongestionPercent] = useState(24.5);
  const [airQualityAQI, setAirQualityAQI] = useState(32);
  const [activeAlerts, setActiveAlerts] = useState<AlertItem[]>(initialAlerts);
  const [energySources, setEnergySources] = useState<EnergySource[]>(initialEnergySources);
  const [intersections, setIntersections] = useState<IntersectionData[]>(initialIntersections);
  const [safetyUnits] = useState<PublicSafetyUnit[]>(initialSafetyUnits);
  const [structuralNodes] = useState<StructuralNode[]>(initialNodes);
  const [emergencyOverrideActive, setEmergencyOverrideActive] = useState(false);

  // Sync theme with HTML root class & localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('greenpulse_theme', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleEmergencyOverride = () => {
    setEmergencyOverrideActive(prev => !prev);
  };

  const acknowledgeAlert = (id: string) => {
    setActiveAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a));
  };

  // Telemetry real-time ticking simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalPowerMW(prev => parseFloat((prev + (Math.random() * 2 - 1)).toFixed(1)));
      setTrafficCongestionPercent(prev => {
        const next = prev + (Math.random() * 0.8 - 0.4);
        return Math.max(10, Math.min(95, parseFloat(next.toFixed(1))));
      });
      setCityHealthIndex(prev => {
        const delta = (Math.random() * 0.2 - 0.1);
        return Math.max(80, Math.min(99.9, parseFloat((prev + delta).toFixed(1))));
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <TelemetryContext.Provider
      value={{
        activeTab,
        setActiveTab,
        themeMode,
        toggleTheme,
        cityHealthIndex,
        totalPowerMW,
        cleanEnergyPercent,
        trafficCongestionPercent,
        airQualityAQI,
        activeAlerts,
        acknowledgeAlert,
        energySources,
        intersections,
        safetyUnits,
        structuralNodes,
        emergencyOverrideActive,
        toggleEmergencyOverride,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
};

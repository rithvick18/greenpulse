import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  DashboardTab, 
  ThemeMode, 
  AlertItem, 
  EnergySource, 
  IntersectionData, 
  PublicSafetyUnit, 
  StructuralNode, 
  Substation,
  RoboticCell,
  MaintenanceItem,
  IncidentItem,
  TrafficCamera
} from '../types/dashboard';

interface TelemetryContextType {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  cityHealthIndex: number;
  totalPowerMW: number;
  peakLoadMW: number;
  cleanEnergyPercent: number;
  trafficCongestionPercent: number;
  airQualityAQI: number;
  batteryReserveMWh: number;
  gridFrequencyHz: number;
  waterPressurePsi: number;
  seismicMv: number;
  avCorridorFlow: number;
  activeAlerts: AlertItem[];
  acknowledgeAlert: (id: string) => void;
  energySources: EnergySource[];
  substations: Substation[];
  intersections: IntersectionData[];
  safetyUnits: PublicSafetyUnit[];
  structuralNodes: StructuralNode[];
  roboticCells: RoboticCell[];
  lineStatus: 'RUNNING' | 'PAUSED' | 'CALIBRATING';
  toggleLineStatus: () => void;
  maintenanceQueue: MaintenanceItem[];
  totalSensors: number;
  meshHealthPct: number;
  activeIncidents: IncidentItem[];
  avgResponseEtaMinutes: number;
  trafficCameras: TrafficCamera[];
  avVectorsActive: number;
  emergencyOverrideActive: boolean;
  toggleEmergencyOverride: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/telemetry';

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('greenpulse_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Overview / Grid Telemetry
  const [cityHealthIndex, setCityHealthIndex] = useState(98.4);
  const [totalPowerMW, setTotalPowerMW] = useState(842.5);
  const [peakLoadMW, setPeakLoadMW] = useState(980);
  const [cleanEnergyPercent, setCleanEnergyPercent] = useState(78.2);
  const [trafficCongestionPercent, setTrafficCongestionPercent] = useState(34);
  const [airQualityAQI, setAirQualityAQI] = useState(24);
  const [batteryReserveMWh, setBatteryReserveMWh] = useState(420);
  const [gridFrequencyHz, setGridFrequencyHz] = useState(50.02);
  const [waterPressurePsi, setWaterPressurePsi] = useState(62);
  const [seismicMv, setSeismicMv] = useState(0.02);
  const [avCorridorFlow, setAvCorridorFlow] = useState(8420);

  // Alerts & Overrides
  const [activeAlerts, setActiveAlerts] = useState<AlertItem[]>([
    {
      id: 'ALT-1092',
      timestamp: '10:24:12',
      level: 'CRITICAL',
      sector: 'SECTOR-04 (GRID)',
      message: 'Substation #09 load variance exceeding nominal parameters (+14%)',
      status: 'ACTIVE'
    },
    {
      id: 'ALT-1088',
      timestamp: '10:19:04',
      level: 'WARNING',
      sector: 'SECTOR-12 (TRANSIT)',
      message: 'AV Corridor Route 4 bottleneck risk near Harbor Entrance',
      status: 'INVESTIGATING'
    }
  ]);
  const [emergencyOverrideActive, setEmergencyOverrideActive] = useState(false);

  // Energy & Infrastructure
  const [energySources, setEnergySources] = useState<EnergySource[]>([
    { name: 'SOLAR ARRAY NORTH', type: 'solar', outputMW: 320, capacityMW: 400, efficiency: 94, status: 'ONLINE' },
    { name: 'OFFSHORE WIND PARK', type: 'wind', outputMW: 280, capacityMW: 350, efficiency: 89, status: 'ONLINE' },
    { name: 'HYDRO BASIN TURBINE', type: 'hydro', outputMW: 150, capacityMW: 180, efficiency: 97, status: 'ONLINE' },
    { name: 'GRID BESS RESERVE', type: 'battery', outputMW: 92.5, capacityMW: 150, efficiency: 99, status: 'ONLINE' },
  ]);
  const [substations, setSubstations] = useState<Substation[]>([
    { id: 'SUB-01', name: 'Downtown Central Substation', loadPct: 78, voltage: '138 kV', status: 'NOMINAL' },
    { id: 'SUB-02', name: 'Harbor Industrial Substation', loadPct: 92, voltage: '230 kV', status: 'HIGH_LOAD' },
  ]);
  const [structuralNodes, setStructuralNodes] = useState<StructuralNode[]>([
    { id: 'STR-8801', name: 'Grand Suspension Bridge', type: 'BRIDGE', stressLoad: 42, vibrationHz: 1.2, status: 'STABLE' },
    { id: 'STR-8802', name: 'Harbor Deep Transit Tunnel', type: 'TUNNEL', stressLoad: 68, vibrationHz: 2.8, status: 'ELEVATED_STRESS' },
    { id: 'STR-8803', name: 'North Basin Aqueduct Reservoir', type: 'RESERVOIR', stressLoad: 29, vibrationHz: 0.4, status: 'STABLE' },
    { id: 'STR-8804', name: 'High-Voltage Grid Tower 14', type: 'GRID_TOWER', stressLoad: 38, vibrationHz: 1.1, status: 'STABLE' },
  ]);

  // Industrial
  const [roboticCells, setRoboticCells] = useState<RoboticCell[]>([
    { id: 'ARM-01', location: 'Assembly Line A (Precision Optics)', thermalC: 48.2, maxC: 80, yieldPct: 99.8, status: 'NOMINAL' },
    { id: 'ARM-02', location: 'Assembly Line B (Heavy Stamping)', thermalC: 64.5, maxC: 85, yieldPct: 98.9, status: 'ELEVATED_TEMP' },
    { id: 'ARM-03', location: 'Assembly Line C (Micro Electronics)', thermalC: 41.0, maxC: 75, yieldPct: 99.9, status: 'NOMINAL' },
    { id: 'ARM-04', location: 'Packaging & Automated Sorting', thermalC: 38.5, maxC: 70, yieldPct: 99.5, status: 'NOMINAL' },
  ]);
  const [lineStatus, setLineStatus] = useState<'RUNNING' | 'PAUSED' | 'CALIBRATING'>('RUNNING');

  // Maintenance & Sensors
  const [maintenanceQueue, setMaintenanceQueue] = useState<MaintenanceItem[]>([
    { id: 'MNT-402', asset: 'Water Main #12 (North Docks)', issue: 'Pressure fluctuation +14 PSI', priority: 'HIGH', assignedTech: 'TECH-UNIT-4' },
    { id: 'MNT-399', asset: 'Sub-Bay Rail Tunnel Sensors', issue: 'Vibration frequency harmonic test', priority: 'MEDIUM', assignedTech: 'TECH-UNIT-2' },
    { id: 'MNT-395', asset: 'AQI Sensor Station #8', issue: 'Optical lens calibration check', priority: 'LOW', assignedTech: 'AUTO-DRONE-1' },
  ]);
  const [totalSensors, setTotalSensors] = useState(14820);
  const [meshHealthPct, setMeshHealthPct] = useState(99.8);

  // Public Safety
  const [safetyUnits, setSafetyUnits] = useState<PublicSafetyUnit[]>([
    { callsign: 'PATROL-AV-01', type: 'AV_PATROL', sector: 'Sector 1 (Financial)', status: 'STANDBY' },
    { callsign: 'MED-UNIT-82', type: 'MEDICAL', sector: 'Sector 4 (Harbor)', status: 'DISPATCHED', etaMinutes: 3.2 },
    { callsign: 'FIRE-ENGINE-04', type: 'FIRE', sector: 'Sector 4 (Harbor)', status: 'EN_ROUTE', etaMinutes: 4.5 },
    { callsign: 'TAC-POLICE-12', type: 'POLICE', sector: 'Sector 2 (Civic Center)', status: 'ON_SCENE' },
  ]);
  const [activeIncidents, setActiveIncidents] = useState<IncidentItem[]>([
    { id: 'INC-809', title: 'Harbor Tunnel Ventilation Surge', description: 'MED-82 & FIRE-12 dispatched. AV Corridor cleared on Route 4.', priority: 1, unitsDispatched: ['MED-82', 'FIRE-12'] },
    { id: 'INC-804', title: 'Civic Plaza Traffic Signal Fault', description: 'PATROL-AV-09 rerouting traffic via peripheral lanes.', priority: 2, unitsDispatched: ['PATROL-AV-09'] },
  ]);
  const [avgResponseEtaMinutes, setAvgResponseEtaMinutes] = useState(3.8);

  // Traffic
  const [intersections, setIntersections] = useState<IntersectionData[]>([
    { id: 'INT-01', name: 'Grand Ave & 4th St', congestion: 68, throughput: 1420, signalStatus: 'OPTIMIZED', avDensity: 74 },
    { id: 'INT-02', name: 'Harbor Expressway Junction', congestion: 84, throughput: 2100, signalStatus: 'CONGESTED', avDensity: 82 },
    { id: 'INT-03', name: 'Civic Center Boulevard', congestion: 29, throughput: 980, signalStatus: 'OPTIMIZED', avDensity: 65 },
  ]);
  const [trafficCameras, setTrafficCameras] = useState<TrafficCamera[]>([
    { id: 'CAM-01', location: 'Harbor Tunnel Entrance (North)', fps: 60, status: 'LIVE' },
    { id: 'CAM-02', location: 'Grand Ave & 4th Intersection', fps: 60, status: 'LIVE' },
    { id: 'CAM-03', location: 'Expressway Loop 9 Junction', fps: 30, status: 'LIVE' },
    { id: 'CAM-04', location: 'Civic Center Bus Terminal', fps: 60, status: 'LIVE' },
  ]);
  const [avVectorsActive, setAvVectorsActive] = useState(1420);

  // Theme synchronization
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
    }
    localStorage.setItem('greenpulse_theme', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleEmergencyOverride = () => {
    setEmergencyOverrideActive(prev => !prev);
  };

  const toggleLineStatus = () => {
    setLineStatus(prev => prev === 'RUNNING' ? 'PAUSED' : prev === 'PAUSED' ? 'CALIBRATING' : 'RUNNING');
  };

  const acknowledgeAlert = (id: string) => {
    setActiveAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a));
  };

  // Real-time WebSocket connection to backend telemetry stream
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      ws = new WebSocket(WS_URL);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle WebSocket event wrappers or direct JSON payloads
          const payload = data.data || data;

          if (payload.cityHealthIndex !== undefined) setCityHealthIndex(payload.cityHealthIndex);
          if (payload.totalPowerMW !== undefined) setTotalPowerMW(payload.totalPowerMW);
          if (payload.peakLoadMW !== undefined) setPeakLoadMW(payload.peakLoadMW);
          if (payload.cleanEnergyPercent !== undefined) setCleanEnergyPercent(payload.cleanEnergyPercent);
          if (payload.trafficCongestionPercent !== undefined) setTrafficCongestionPercent(payload.trafficCongestionPercent);
          if (payload.airQualityAQI !== undefined) setAirQualityAQI(payload.airQualityAQI);
          if (payload.batteryReserveMWh !== undefined) setBatteryReserveMWh(payload.batteryReserveMWh);
          if (payload.gridFrequencyHz !== undefined) setGridFrequencyHz(payload.gridFrequencyHz);
          if (payload.waterPressurePsi !== undefined) setWaterPressurePsi(payload.waterPressurePsi);
          if (payload.seismicMv !== undefined) setSeismicMv(payload.seismicMv);
          if (payload.avCorridorFlow !== undefined) setAvCorridorFlow(payload.avCorridorFlow);
          if (payload.activeAlerts !== undefined) setActiveAlerts(payload.activeAlerts);
          if (payload.energySources !== undefined) setEnergySources(payload.energySources);
          if (payload.substations !== undefined) setSubstations(payload.substations);
          if (payload.intersections !== undefined) setIntersections(payload.intersections);
          if (payload.safetyUnits !== undefined) setSafetyUnits(payload.safetyUnits);
          if (payload.structuralNodes !== undefined) setStructuralNodes(payload.structuralNodes);
          if (payload.roboticCells !== undefined) setRoboticCells(payload.roboticCells);
          if (payload.lineStatus !== undefined) setLineStatus(payload.lineStatus);
          if (payload.maintenanceQueue !== undefined) setMaintenanceQueue(payload.maintenanceQueue);
          if (payload.totalSensors !== undefined) setTotalSensors(payload.totalSensors);
          if (payload.meshHealthPct !== undefined) setMeshHealthPct(payload.meshHealthPct);
          if (payload.activeIncidents !== undefined) setActiveIncidents(payload.activeIncidents);
          if (payload.avgResponseEtaMinutes !== undefined) setAvgResponseEtaMinutes(payload.avgResponseEtaMinutes);
          if (payload.trafficCameras !== undefined) setTrafficCameras(payload.trafficCameras);
          if (payload.avVectorsActive !== undefined) setAvVectorsActive(payload.avVectorsActive);
          if (payload.emergencyOverrideActive !== undefined) setEmergencyOverrideActive(payload.emergencyOverrideActive);
        } catch (err) {
          console.error('Failed to parse telemetry message from WebSocket:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('Telemetry WebSocket error:', error);
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
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
        peakLoadMW,
        cleanEnergyPercent,
        trafficCongestionPercent,
        airQualityAQI,
        batteryReserveMWh,
        gridFrequencyHz,
        waterPressurePsi,
        seismicMv,
        avCorridorFlow,
        activeAlerts,
        acknowledgeAlert,
        energySources,
        substations,
        intersections,
        safetyUnits,
        structuralNodes,
        roboticCells,
        lineStatus,
        toggleLineStatus,
        maintenanceQueue,
        totalSensors,
        meshHealthPct,
        activeIncidents,
        avgResponseEtaMinutes,
        trafficCameras,
        avVectorsActive,
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

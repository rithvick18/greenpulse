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
  connectionStatus: 'connecting' | 'connected' | 'error';
  connectionError: string | null;
  reconnect: () => void;
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
  const [cityHealthIndex, setCityHealthIndex] = useState(0);
  const [totalPowerMW, setTotalPowerMW] = useState(0);
  const [peakLoadMW, setPeakLoadMW] = useState(0);
  const [cleanEnergyPercent, setCleanEnergyPercent] = useState(0);
  const [trafficCongestionPercent, setTrafficCongestionPercent] = useState(0);
  const [airQualityAQI, setAirQualityAQI] = useState(0);
  const [batteryReserveMWh, setBatteryReserveMWh] = useState(0);
  const [gridFrequencyHz, setGridFrequencyHz] = useState(0);
  const [waterPressurePsi, setWaterPressurePsi] = useState(0);
  const [seismicMv, setSeismicMv] = useState(0);
  const [avCorridorFlow, setAvCorridorFlow] = useState(0);

  // Alerts & Overrides
  const [activeAlerts, setActiveAlerts] = useState<AlertItem[]>([]);
  const [emergencyOverrideActive, setEmergencyOverrideActive] = useState(false);

  // Energy & Infrastructure
  const [energySources, setEnergySources] = useState<EnergySource[]>([]);
  const [substations, setSubstations] = useState<Substation[]>([]);
  const [structuralNodes, setStructuralNodes] = useState<StructuralNode[]>([]);

  // Industrial
  const [roboticCells, setRoboticCells] = useState<RoboticCell[]>([]);
  const [lineStatus, setLineStatus] = useState<'RUNNING' | 'PAUSED' | 'CALIBRATING'>('RUNNING');

  // Maintenance & Sensors
  const [maintenanceQueue, setMaintenanceQueue] = useState<MaintenanceItem[]>([]);
  const [totalSensors, setTotalSensors] = useState(0);
  const [meshHealthPct, setMeshHealthPct] = useState(0);

  // Public Safety
  const [safetyUnits, setSafetyUnits] = useState<PublicSafetyUnit[]>([]);
  const [activeIncidents, setActiveIncidents] = useState<IncidentItem[]>([]);
  const [avgResponseEtaMinutes, setAvgResponseEtaMinutes] = useState(0);

  // Traffic
  const [intersections, setIntersections] = useState<IntersectionData[]>([]);
  const [trafficCameras, setTrafficCameras] = useState<TrafficCamera[]>([]);
  const [avVectorsActive, setAvVectorsActive] = useState(0);

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

  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectTrigger, setReconnectTrigger] = useState(0);

  const reconnect = () => {
    setConnectionStatus('connecting');
    setConnectionError(null);
    setReconnectTrigger(prev => prev + 1);
  };

  const acknowledgeAlert = (id: string) => {
    setActiveAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a));
  };

  // Real-time WebSocket connection to backend telemetry stream
  useEffect(() => {
    let ws: WebSocket | null = null;

    const connect = () => {
      try {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          setConnectionStatus('connected');
          setConnectionError(null);
        };

        ws.onmessage = (event) => {
          setConnectionStatus('connected');
          setConnectionError(null);
          try {
            const data = JSON.parse(event.data);
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
          setConnectionStatus('error');
          setConnectionError(`Unable to establish connection with telemetry backend at ${WS_URL}`);
        };

        ws.onclose = () => {
          setConnectionStatus('error');
          setConnectionError(`Backend WebSocket connection closed (${WS_URL}).`);
        };
      } catch (err: any) {
        setConnectionStatus('error');
        setConnectionError(`Failed to initialize WebSocket connection: ${err?.message || err}`);
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
      }
    };
  }, [reconnectTrigger]);

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
        connectionStatus,
        connectionError,
        reconnect,
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

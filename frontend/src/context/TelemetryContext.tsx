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
import { ApiNode } from '../types/api';
import { getLatestTelemetry, getNodes, getAlerts, ApiError } from '../api/client';
import { mapAlertToAlertItem } from '../types/api';

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
  nodes: ApiNode[];
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

// Telemetry is polled from the Django REST backend over HTTP. The API client
// in src/api/client.ts resolves all endpoints through relative "/api/..." paths
// (proxied to Django by vite.config.ts in dev, or a reverse proxy in prod).

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

  // Registered sensor nodes (sourced from /api/nodes/, lower frequency than telemetry)
  const [nodes, setNodes] = useState<ApiNode[]>([]);

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

  const updateTelemetryData = (payload: any) => {
    if (!payload) return;
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
  };

  // Poll the Django telemetry endpoint every 3 seconds. Connection status is
  // driven by the success/failure of these requests so the BackendErrorOverlay
  // reflects real backend reachability.
  useEffect(() => {
    let isDisposed = false;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const poll = async () => {
      try {
        const data = await getLatestTelemetry();
        if (isDisposed) return;
        updateTelemetryData(data);
        setConnectionStatus('connected');
        setConnectionError(null);
      } catch (err) {
        if (isDisposed) return;
        setConnectionStatus('error');
        const detail = err instanceof ApiError
          ? `Telemetry API returned HTTP ${err.status}.`
          : 'Unable to establish telemetry connection with the backend.';
        setConnectionError(detail);
      }
    };

    poll();
    pollInterval = setInterval(poll, 3000);

    return () => {
      isDisposed = true;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [reconnectTrigger]);

  // Nodes and alerts change less often than telemetry; refresh on mount and
  // every 10 seconds. Alerts are merged into the existing activeAlerts list so
  // operator acknowledgements are preserved between refreshes.
  useEffect(() => {
    let isDisposed = false;
    let refreshInterval: ReturnType<typeof setInterval> | null = null;

    const refresh = async () => {
      try {
        const [fetchedNodes, fetchedAlerts] = await Promise.all([
          getNodes(),
          getAlerts(),
        ]);
        if (isDisposed) return;
        setNodes(fetchedNodes);
        setActiveAlerts(prev => {
          const acknowledged = new Set(
            prev.filter(a => a.status !== 'ACTIVE').map(a => a.id),
          );
          const fresh = fetchedAlerts.map(mapAlertToAlertItem);
          // Keep acknowledged alerts, then any freshly active ones not already present.
          const freshIds = new Set(fresh.map(a => a.id));
          const retained = prev.filter(a => !freshIds.has(a.id) && acknowledged.has(a.id));
          return [...retained, ...fresh];
        });
      } catch {
        // Node/alert refresh failures are non-fatal; telemetry polling drives
        // the primary connection status. Logging only to avoid console spam.
      }
    };

    refresh();
    refreshInterval = setInterval(refresh, 10000);

    return () => {
      isDisposed = true;
      if (refreshInterval) {
        clearInterval(refreshInterval);
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
        nodes,
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

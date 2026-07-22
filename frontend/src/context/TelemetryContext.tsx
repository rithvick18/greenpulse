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
    const val = (camel: string, snake: string) => payload[camel] ?? payload[snake];

    if (val('cityHealthIndex', 'city_health_index') !== undefined) setCityHealthIndex(val('cityHealthIndex', 'city_health_index'));
    if (val('totalPowerMW', 'net_generation') !== undefined) setTotalPowerMW(val('totalPowerMW', 'net_generation'));
    if (val('peakLoadMW', 'peak_load_mw') !== undefined) setPeakLoadMW(val('peakLoadMW', 'peak_load_mw'));
    if (val('cleanEnergyPercent', 'clean_energy_percent') !== undefined) setCleanEnergyPercent(val('cleanEnergyPercent', 'clean_energy_percent'));
    if (val('trafficCongestionPercent', 'traffic_congestion') !== undefined) setTrafficCongestionPercent(val('trafficCongestionPercent', 'traffic_congestion'));
    if (val('airQualityAQI', 'air_quality_index') !== undefined) setAirQualityAQI(val('airQualityAQI', 'air_quality_index'));
    if (val('batteryReserveMWh', 'battery_reserve') !== undefined) setBatteryReserveMWh(val('batteryReserveMWh', 'battery_reserve'));
    if (val('gridFrequencyHz', 'grid_frequency') !== undefined) setGridFrequencyHz(val('gridFrequencyHz', 'grid_frequency'));
    if (val('waterPressurePsi', 'water_pressure') !== undefined) setWaterPressurePsi(val('waterPressurePsi', 'water_pressure'));
    if (val('seismicMv', 'seismic_activity') !== undefined) setSeismicMv(val('seismicMv', 'seismic_activity'));
    if (val('avCorridorFlow', 'av_corridor_flow') !== undefined) setAvCorridorFlow(val('avCorridorFlow', 'av_corridor_flow'));
    if (val('activeAlerts', 'active_alerts') !== undefined) setActiveAlerts(val('activeAlerts', 'active_alerts'));
    if (val('energySources', 'generation_breakdown') !== undefined) setEnergySources(val('energySources', 'generation_breakdown'));
    if (val('substations', 'substations') !== undefined) setSubstations(val('substations', 'substations'));
    if (val('intersections', 'intersections') !== undefined) setIntersections(val('intersections', 'intersections'));
    if (val('safetyUnits', 'safety_units') !== undefined) setSafetyUnits(val('safetyUnits', 'safety_units'));
    if (val('structuralNodes', 'structural_nodes') !== undefined) setStructuralNodes(val('structuralNodes', 'structural_nodes'));
    if (val('roboticCells', 'robotic_cells') !== undefined) setRoboticCells(val('roboticCells', 'robotic_cells'));
    if (val('lineStatus', 'line_status') !== undefined) setLineStatus(val('lineStatus', 'line_status'));
    if (val('maintenanceQueue', 'maintenance_queue') !== undefined) setMaintenanceQueue(val('maintenanceQueue', 'maintenance_queue'));
    if (val('totalSensors', 'total_sensors') !== undefined) setTotalSensors(val('totalSensors', 'total_sensors'));
    if (val('meshHealthPct', 'mesh_health_pct') !== undefined) setMeshHealthPct(val('meshHealthPct', 'mesh_health_pct'));
    if (val('activeIncidents', 'active_incidents') !== undefined) setActiveIncidents(val('activeIncidents', 'active_incidents'));
    if (val('avgResponseEtaMinutes', 'emergency_response_avg_min') !== undefined) setAvgResponseEtaMinutes(val('avgResponseEtaMinutes', 'emergency_response_avg_min'));
    if (val('trafficCameras', 'traffic_cameras') !== undefined) setTrafficCameras(val('trafficCameras', 'traffic_cameras'));
    if (val('avVectorsActive', 'av_vectors_active') !== undefined) setAvVectorsActive(val('avVectorsActive', 'av_vectors_active'));
    if (val('emergencyOverrideActive', 'emergency_override_active') !== undefined) setEmergencyOverrideActive(val('emergencyOverrideActive', 'emergency_override_active'));
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

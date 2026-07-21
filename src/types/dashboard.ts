export type DashboardTab = 'overview' | 'traffic' | 'energy' | 'infrastructure' | 'public-safety' | 'industrial';
export type ThemeMode = 'dark' | 'light';

export interface AlertItem {
  id: string;
  timestamp: string;
  level: 'CRITICAL' | 'WARNING' | 'INFO';
  sector: string;
  message: string;
  status: 'ACTIVE' | 'RESOLVED' | 'INVESTIGATING';
}

export interface MetricCardData {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'nominal' | 'warning' | 'alert';
}

export interface IntersectionData {
  id: string;
  name: string;
  congestion: number; // percentage 0-100
  throughput: number; // vehicles per min
  signalStatus: 'OPTIMIZED' | 'MANUAL_OVERRIDE' | 'CONGESTED';
  avDensity: number;
}

export interface EnergySource {
  name: string;
  type: 'solar' | 'wind' | 'hydro' | 'thermal' | 'battery';
  outputMW: number;
  capacityMW: number;
  efficiency: number;
  status: 'ONLINE' | 'STANDBY' | 'MAINTENANCE';
}

export interface PublicSafetyUnit {
  callsign: string;
  type: 'POLICE' | 'MEDICAL' | 'FIRE' | 'AV_PATROL';
  sector: string;
  status: 'DISPATCHED' | 'STANDBY' | 'EN_ROUTE' | 'ON_SCENE';
  etaMinutes?: number;
}

export interface StructuralNode {
  id: string;
  name: string;
  type: 'BRIDGE' | 'RESERVOIR' | 'TUNNEL' | 'GRID_TOWER';
  stressLoad: number; // percentage
  vibrationHz: number;
  status: 'STABLE' | 'ELEVATED_STRESS' | 'CRITICAL_CHECK';
}

export interface Substation {
  id: string;
  name: string;
  loadPct: number;
  voltage: string;
  status: 'NOMINAL' | 'HIGH_LOAD' | 'MAINTENANCE';
}

export interface RoboticCell {
  id: string;
  location: string;
  thermalC: number;
  maxC: number;
  yieldPct: number;
  status: 'NOMINAL' | 'ELEVATED_TEMP' | 'MAINTENANCE';
}

export interface MaintenanceItem {
  id: string;
  asset: string;
  issue: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  assignedTech: string;
}

export interface IncidentItem {
  id: string;
  title: string;
  description: string;
  priority: number;
  unitsDispatched?: string[];
}

export interface TrafficCamera {
  id: string;
  location: string;
  fps: number;
  status: 'LIVE' | 'OFFLINE';
}

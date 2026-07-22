import { AlertItem } from './dashboard';

/**
 * Shapes returned by the Django REST Framework endpoints.
 * These mirror the serializers in backend/greenpulse_app/serializers.py and
 * the `{status, source, data}` envelope used by the views.
 *
 * Note: the backend `Alert` shape differs from the frontend display
 * `AlertItem`, so `mapAlertToAlertItem` adapts it below.
 */

export interface ApiTelemetry {
  time: string | null;
  node_id: string | null;
  metric_name: string | null;
  value: number | null;
}

export interface ApiNode {
  id: string;
  name: string;
  location_lat: number;
  location_lon: number;
  status: string;
  node_type: string;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
}

export interface ApiAlert {
  id: number;
  rule_id: number | null;
  node_id: string | null;
  metric_name: string;
  value: number;
  threshold: number;
  severity: string;
  message: string;
  triggered_at: string;
  resolved_at: string | null;
}

/**
 * Convert a backend `ApiAlert` into the frontend's display `AlertItem`.
 * Backend severity ("critical"/"warning"/"info") maps to the AlertItem level,
 * and resolution state is derived from `resolved_at`.
 */
export const mapAlertToAlertItem = (alert: ApiAlert): AlertItem => {
  const severity = (alert.severity || '').toUpperCase();
  const level: AlertItem['level'] =
    severity.includes('CRIT') ? 'CRITICAL' :
    severity.includes('WARN') ? 'WARNING' :
    'INFO';

  return {
    id: String(alert.id),
    timestamp: alert.triggered_at,
    level,
    sector: alert.node_id || alert.metric_name,
    message: alert.message,
    status: alert.resolved_at ? 'RESOLVED' : 'ACTIVE',
  };
};

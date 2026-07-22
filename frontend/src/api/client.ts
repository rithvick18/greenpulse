import { ApiTelemetry, ApiNode, ApiAlert } from '../types/api';

/**
 * Base URL for the Django backend.
 *
 * Defaults to "" so calls use relative paths ("/api/..."). In development these
 * are proxied to the Django server by the `server.proxy` setting in
 * vite.config.ts; in production they should be served behind a reverse proxy.
 * Set VITE_API_BASE_URL only when the backend lives on a different origin.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Perform a GET request and unwrap the DRF `{status, source, data}` envelope.
 * Falls back to the raw payload if no `data` key is present.
 */
async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new ApiError(`API request to ${path} failed`, res.status);
  }
  const json = await res.json();
  return (json?.data ?? json) as T;
}

/** GET /api/telemetry/latest/ — latest telemetry snapshot (polled every 3s). */
export const getLatestTelemetry = (): Promise<ApiTelemetry | null> =>
  request<ApiTelemetry | null>('/api/telemetry/latest/');

/** GET /api/nodes/ — all registered smart-city nodes. */
export const getNodes = async (): Promise<ApiNode[]> => {
  const data = await request<ApiNode[]>('/api/nodes/');
  return Array.isArray(data) ? data : [];
};

/** GET /api/alerts/ — unresolved alerts, newest first. */
export const getAlerts = async (): Promise<ApiAlert[]> => {
  const data = await request<ApiAlert[]>('/api/alerts/');
  return Array.isArray(data) ? data : [];
};

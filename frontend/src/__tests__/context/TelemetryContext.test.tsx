import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TelemetryProvider, useTelemetry } from '../../context/TelemetryContext';

const TestComponent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    themeMode,
    toggleTheme,
    cityHealthIndex,
    activeAlerts,
    acknowledgeAlert,
    lineStatus,
    toggleLineStatus,
    emergencyOverrideActive,
    toggleEmergencyOverride,
    nodes,
    connectionStatus,
    connectionError,
    reconnect,
  } = useTelemetry();

  return (
    <div>
      <span data-testid="active-tab">{activeTab}</span>
      <span data-testid="theme-mode">{themeMode}</span>
      <span data-testid="city-health">{cityHealthIndex}</span>
      <span data-testid="line-status">{lineStatus}</span>
      <span data-testid="emergency-override">{emergencyOverrideActive ? 'ACTIVE' : 'INACTIVE'}</span>
      <span data-testid="alerts-count">{activeAlerts.length}</span>
      <span data-testid="nodes-count">{nodes.length}</span>
      <span data-testid="connection-status">{connectionStatus}</span>
      <span data-testid="connection-error">{connectionError || ''}</span>

      <button onClick={() => setActiveTab('traffic')}>Switch Tab</button>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={toggleLineStatus}>Toggle Line</button>
      <button onClick={toggleEmergencyOverride}>Toggle Emergency</button>
      <button onClick={reconnect}>Reconnect</button>
      {activeAlerts[0] && (
        <button onClick={() => acknowledgeAlert(activeAlerts[0].id)}>Acknowledge Alert</button>
      )}
    </div>
  );
};

/**
 * Build a fetch mock that serves the three backend endpoints. Each call is
 * resolved against `input` (the URL) so individual tests can assert which
 * endpoint was hit.
 */
const buildFetch = (overrides: {
  telemetry?: any;
  nodes?: any[];
  alerts?: any[];
} = {}) => {
  const telemetry = overrides.telemetry ?? null;
  const nodes = overrides.nodes ?? [];
  const alerts = overrides.alerts ?? [];
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    const envelope = (data: unknown) => ({ ok: true, json: async () => ({ status: 'success', data }) });
    if (url.includes('/api/telemetry/latest/')) return envelope(telemetry);
    if (url.includes('/api/nodes/')) return envelope(nodes);
    if (url.includes('/api/alerts/')) return envelope(alerts);
    return envelope(null);
  });
};

describe('TelemetryContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('renders children with default context values', () => {
    vi.stubGlobal('fetch', buildFetch());

    render(
      <TelemetryProvider>
        <TestComponent />
      </TelemetryProvider>,
    );

    expect(screen.getByTestId('active-tab')).toHaveTextContent('overview');
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('city-health')).toHaveTextContent('0');
    expect(screen.getByTestId('line-status')).toHaveTextContent('RUNNING');
    expect(screen.getByTestId('emergency-override')).toHaveTextContent('INACTIVE');
    expect(screen.getByTestId('alerts-count')).toHaveTextContent('0');
  });

  it('allows changing active tab, theme, line status, and emergency override', () => {
    vi.stubGlobal('fetch', buildFetch());

    render(
      <TelemetryProvider>
        <TestComponent />
      </TelemetryProvider>,
    );

    act(() => {
      screen.getByText('Switch Tab').click();
    });
    expect(screen.getByTestId('active-tab')).toHaveTextContent('traffic');

    act(() => {
      screen.getByText('Toggle Theme').click();
    });
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    expect(localStorage.getItem('greenpulse_theme')).toBe('light');

    act(() => {
      screen.getByText('Toggle Line').click();
    });
    expect(screen.getByTestId('line-status')).toHaveTextContent('PAUSED');

    act(() => {
      screen.getByText('Toggle Emergency').click();
    });
    expect(screen.getByTestId('emergency-override')).toHaveTextContent('ACTIVE');
  });

  it('polls the telemetry endpoint and applies snapshot updates', async () => {
    vi.stubGlobal('fetch', buildFetch({
      telemetry: {
        cityHealthIndex: 99.5,
        totalPowerMW: 900.0,
      },
    }));
    const fetchMock = vi.mocked(fetch);

    render(
      <TelemetryProvider>
        <TestComponent />
      </TelemetryProvider>,
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/telemetry/latest/');
    });
    await waitFor(() => {
      expect(screen.getByTestId('city-health')).toHaveTextContent('99.5');
      expect(screen.getByTestId('connection-status')).toHaveTextContent('connected');
    });
  });

  it('fetches nodes and alerts on mount and exposes them via context', async () => {
    vi.stubGlobal('fetch', buildFetch({
      nodes: [
        { id: 'node-01', name: 'Central Park AQI', location_lat: 40.78, location_lon: -73.96, status: 'online', node_type: 'air_quality', metadata_json: null, created_at: '2026-01-01T00:00:00Z' },
      ],
      alerts: [
        { id: 10, rule_id: 1, node_id: 'node-01', metric_name: 'aqi', value: 165, threshold: 150, severity: 'critical', message: 'AQI exceeded threshold', triggered_at: '2026-01-01T00:00:00Z', resolved_at: null },
      ],
    }));

    render(
      <TelemetryProvider>
        <TestComponent />
      </TelemetryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('nodes-count')).toHaveTextContent('1');
      expect(screen.getByTestId('alerts-count')).toHaveTextContent('1');
    });
  });

  it('allows acknowledging active alerts while preserving them between refreshes', async () => {
    const alertPayload = [
      { id: 10, rule_id: 1, node_id: 'node-01', metric_name: 'aqi', value: 165, threshold: 150, severity: 'critical', message: 'AQI exceeded threshold', triggered_at: '2026-01-01T00:00:00Z', resolved_at: null },
    ];
    vi.stubGlobal('fetch', buildFetch({ alerts: alertPayload }));

    render(
      <TelemetryProvider>
        <TestComponent />
      </TelemetryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('alerts-count')).toHaveTextContent('1');
    });

    screen.getByText('Acknowledge Alert').click();

    // Alert is marked RESOLVED but still present in the list.
    expect(screen.getByTestId('alerts-count')).toHaveTextContent('1');
  });

  it('sets connectionStatus to error when the telemetry request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    render(
      <TelemetryProvider>
        <TestComponent />
      </TelemetryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('error');
    });
    expect(screen.getByTestId('connection-error').textContent).not.toBe('');
  });
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OverviewDashboard } from '../../components/views/OverviewDashboard';
import { TelemetryProvider } from '../../context/TelemetryContext';

describe('OverviewDashboard View', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('renders overview KPI metric cards and initial empty state', () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success', data: null }),
    }));

    render(
      <TelemetryProvider>
        <OverviewDashboard />
      </TelemetryProvider>,
    );

    expect(screen.getByText('CITY HEALTH INDEX')).toBeInTheDocument();
    expect(screen.getByText('NET GENERATION')).toBeInTheDocument();
    expect(screen.getByText('TRAFFIC CONGESTION')).toBeInTheDocument();
    expect(screen.getByText('AIR QUALITY (AQI)')).toBeInTheDocument();
    expect(screen.getByText('Awaiting real-time grid generation breakdown...')).toBeInTheDocument();
    expect(screen.getByText('No active alerts recorded. All telemetry nominal.')).toBeInTheDocument();
  });

  it('displays real-time telemetry metrics polled from the backend', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      const envelope = (data: unknown) => ({ ok: true, json: async () => ({ status: 'success', data }) });
      if (url.includes('/api/telemetry/latest/')) {
        return envelope({
          cityHealthIndex: 98.4,
          totalPowerMW: 842.5,
          trafficCongestionPercent: 34,
        });
      }
      // nodes/alerts endpoints return empty arrays.
      return envelope([]);
    }));

    render(
      <TelemetryProvider>
        <OverviewDashboard />
      </TelemetryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('98.4%')).toBeInTheDocument();
      expect(screen.getByText('842.5')).toBeInTheDocument();
      expect(screen.getByText('34%')).toBeInTheDocument();
    });
  });
});

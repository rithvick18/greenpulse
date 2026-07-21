import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { OverviewDashboard } from '../../components/views/OverviewDashboard';
import { TelemetryProvider } from '../../context/TelemetryContext';
import { MockWebSocket } from '../../setupTests';

describe('OverviewDashboard View', () => {
  beforeEach(() => {
    localStorage.clear();
    MockWebSocket.instances = [];
  });

  it('renders overview KPI metric cards and initial empty state', () => {
    render(
      <TelemetryProvider>
        <OverviewDashboard />
      </TelemetryProvider>
    );

    expect(screen.getByText('CITY HEALTH INDEX')).toBeInTheDocument();
    expect(screen.getByText('NET GENERATION')).toBeInTheDocument();
    expect(screen.getByText('TRAFFIC CONGESTION')).toBeInTheDocument();
    expect(screen.getByText('AIR QUALITY (AQI)')).toBeInTheDocument();
    expect(screen.getByText('Awaiting real-time grid generation breakdown...')).toBeInTheDocument();
    expect(screen.getByText('No active alerts recorded. All telemetry nominal.')).toBeInTheDocument();
  });

  it('displays real-time telemetry metrics from context via WebSocket updates', () => {
    render(
      <TelemetryProvider>
        <OverviewDashboard />
      </TelemetryProvider>
    );

    const ws = MockWebSocket.instances[0];
    act(() => {
      ws.triggerMessage({
        event: 'snapshot',
        data: {
          cityHealthIndex: 98.4,
          totalPowerMW: 842.5,
          trafficCongestionPercent: 34,
        },
      });
    });

    expect(screen.getByText('98.4%')).toBeInTheDocument();
    expect(screen.getByText('842.5')).toBeInTheDocument();
    expect(screen.getByText('34%')).toBeInTheDocument();
  });
});

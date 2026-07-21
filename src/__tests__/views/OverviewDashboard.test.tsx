import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { OverviewDashboard } from '../../components/views/OverviewDashboard';
import { TelemetryProvider } from '../../context/TelemetryContext';

describe('OverviewDashboard View', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders overview KPI metric cards', () => {
    render(
      <TelemetryProvider>
        <OverviewDashboard />
      </TelemetryProvider>
    );

    expect(screen.getByText('CITY HEALTH INDEX')).toBeInTheDocument();
    expect(screen.getByText('NET GENERATION')).toBeInTheDocument();
    expect(screen.getByText('TRAFFIC CONGESTION')).toBeInTheDocument();
    expect(screen.getByText('AIR QUALITY (AQI)')).toBeInTheDocument();
  });

  it('displays real-time telemetry metrics from context', () => {
    render(
      <TelemetryProvider>
        <OverviewDashboard />
      </TelemetryProvider>
    );

    expect(screen.getByText('98.4%')).toBeInTheDocument();
    expect(screen.getByText('842.5')).toBeInTheDocument();
    expect(screen.getByText('34%')).toBeInTheDocument();
  });
});

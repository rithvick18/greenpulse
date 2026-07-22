import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { TrafficControlView } from '../../components/views/TrafficControlView';
import { EnergyGridView } from '../../components/views/EnergyGridView';
import { InfrastructureView } from '../../components/views/InfrastructureView';
import { PublicSafetyView } from '../../components/views/PublicSafetyView';
import { IndustrialPrecisionView } from '../../components/views/IndustrialPrecisionView';
import { TelemetryProvider } from '../../context/TelemetryContext';

describe('Dashboard Module Views', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders TrafficControlView without crashing', () => {
    render(
      <TelemetryProvider>
        <TrafficControlView />
      </TelemetryProvider>
    );
    expect(screen.getByText('TRAFFIC CONTROL CENTER & AI SIGNAL MATRIX')).toBeInTheDocument();
  });

  it('renders EnergyGridView without crashing', () => {
    render(
      <TelemetryProvider>
        <EnergyGridView />
      </TelemetryProvider>
    );
    expect(screen.getByText('HIGH VOLTAGE SUBSTATION HEALTH MATRIX')).toBeInTheDocument();
  });

  it('renders InfrastructureView without crashing', () => {
    render(
      <TelemetryProvider>
        <InfrastructureView />
      </TelemetryProvider>
    );
    expect(screen.getByText('STRUCTURAL INTEGRITY & SENSOR MESH')).toBeInTheDocument();
  });

  it('renders PublicSafetyView without crashing', () => {
    render(
      <TelemetryProvider>
        <PublicSafetyView />
      </TelemetryProvider>
    );
    expect(screen.getByText('PUBLIC SAFETY & EMERGENCY DISPATCH COMMAND')).toBeInTheDocument();
  });

  it('renders IndustrialPrecisionView without crashing', () => {
    render(
      <TelemetryProvider>
        <IndustrialPrecisionView />
      </TelemetryProvider>
    );
    expect(screen.getByText('INDUSTRIAL PRECISION & HEAVY AUTOMATION COMMAND')).toBeInTheDocument();
  });
});

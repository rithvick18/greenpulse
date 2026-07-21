import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { Sidebar } from '../../../components/layout/Sidebar';
import { TelemetryProvider } from '../../../context/TelemetryContext';

describe('Sidebar Navigation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all 6 operational navigation modules', () => {
    render(
      <TelemetryProvider>
        <Sidebar />
      </TelemetryProvider>
    );

    expect(screen.getByText('GREENPULSE OVERVIEW')).toBeInTheDocument();
    expect(screen.getByText('TRAFFIC CONTROL')).toBeInTheDocument();
    expect(screen.getByText('SMART ENERGY GRID')).toBeInTheDocument();
    expect(screen.getByText('INFRASTRUCTURE')).toBeInTheDocument();
    expect(screen.getByText('PUBLIC SAFETY')).toBeInTheDocument();
    expect(screen.getByText('INDUSTRIAL PRECISION')).toBeInTheDocument();
  });

  it('switches views when a navigation tab is clicked', () => {
    render(
      <TelemetryProvider>
        <Sidebar />
      </TelemetryProvider>
    );

    const trafficButton = screen.getByText('TRAFFIC CONTROL').closest('button');
    expect(trafficButton).toBeInTheDocument();

    if (trafficButton) {
      fireEvent.click(trafficButton);
      expect(trafficButton).toHaveClass('border-primary');
    }
  });

  it('displays system telemetry status indicators', () => {
    render(
      <TelemetryProvider>
        <Sidebar />
      </TelemetryProvider>
    );

    expect(screen.getByText('CORE LATENCY')).toBeInTheDocument();
    expect(screen.getByText('SENSOR MESH')).toBeInTheDocument();
    expect(screen.getByText('14,820 NODES')).toBeInTheDocument();
  });
});

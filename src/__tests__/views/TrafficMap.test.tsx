import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TrafficMap } from '../../components/views/TrafficMap';
import { IntersectionData, TrafficCamera } from '../../types/dashboard';

const mockIntersections: IntersectionData[] = [
  {
    id: 'int-1',
    name: 'Central Hub Matrix',
    congestion: 45,
    throughput: 120,
    signalStatus: 'OPTIMIZED',
    avDensity: 35
  },
  {
    id: 'int-2',
    name: 'North Express Arterial',
    congestion: 82,
    throughput: 95,
    signalStatus: 'CONGESTED',
    avDensity: 20
  }
];

const mockTrafficCameras: TrafficCamera[] = [
  { id: 'CAM-01', location: 'North Expressway Hub 4', fps: 30, status: 'LIVE' },
  { id: 'CAM-02', location: 'Central Plaza Junction', fps: 60, status: 'LIVE' }
];

describe('TrafficMap Component', () => {
  it('renders OpenStreetMap and layer controls without crashing', () => {
    render(
      <TrafficMap
        intersections={mockIntersections}
        trafficCameras={mockTrafficCameras}
      />
    );

    expect(screen.getByText('HIGH-RESOLUTION SATELLITE TRANSIT TELEMETRY MAP')).toBeInTheDocument();
    expect(screen.getByText('OPENSTREETMAP')).toBeInTheDocument();
    expect(screen.getByText('SATELLITE')).toBeInTheDocument();
    expect(screen.getByText('HYBRID')).toBeInTheDocument();
    expect(screen.getByText('VECTOR DARK')).toBeInTheDocument();
    expect(screen.getByText('HEATMAP')).toBeInTheDocument();
    expect(screen.getByText('NODES (2)')).toBeInTheDocument();
    expect(screen.getByText('CAMERAS (2)')).toBeInTheDocument();
    expect(screen.getByText('AV PATROL')).toBeInTheDocument();
  });

  it('allows toggling tile mode between OpenStreetMap, Satellite, Hybrid, and Vector Dark', () => {
    render(
      <TrafficMap
        intersections={mockIntersections}
        trafficCameras={mockTrafficCameras}
      />
    );

    const osmBtn = screen.getByText('OPENSTREETMAP');
    const satBtn = screen.getByText('SATELLITE');
    const hybridBtn = screen.getByText('HYBRID');
    const darkBtn = screen.getByText('VECTOR DARK');

    expect(osmBtn).toHaveClass('bg-primary');

    fireEvent.click(satBtn);
    expect(satBtn).toHaveClass('bg-primary');

    fireEvent.click(hybridBtn);
    expect(hybridBtn).toHaveClass('bg-primary');

    fireEvent.click(darkBtn);
    expect(darkBtn).toHaveClass('bg-primary');
  });

  it('allows clicking zoom buttons', () => {
    render(
      <TrafficMap
        intersections={mockIntersections}
        trafficCameras={mockTrafficCameras}
      />
    );

    const zoomInBtn = screen.getByTitle('Zoom In');
    const zoomOutBtn = screen.getByTitle('Zoom Out');
    const resetBtn = screen.getByTitle('Reset View');

    expect(zoomInBtn).toBeInTheDocument();
    expect(zoomOutBtn).toBeInTheDocument();
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(zoomInBtn);
    fireEvent.click(zoomOutBtn);
    fireEvent.click(resetBtn);
  });

  it('displays emergency clearance HUD badge when mode is EMERGENCY_CORRIDOR', () => {
    render(
      <TrafficMap
        intersections={mockIntersections}
        trafficCameras={mockTrafficCameras}
        signalMode="EMERGENCY_CORRIDOR"
      />
    );

    expect(screen.getByText('GREEN WAVE ACTIVE')).toBeInTheDocument();
  });
});

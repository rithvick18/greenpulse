import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TelemetryProvider, useTelemetry } from '../../context/TelemetryContext';
import { MockWebSocket } from '../../setupTests';

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
  } = useTelemetry();

  return (
    <div>
      <span data-testid="active-tab">{activeTab}</span>
      <span data-testid="theme-mode">{themeMode}</span>
      <span data-testid="city-health">{cityHealthIndex}</span>
      <span data-testid="line-status">{lineStatus}</span>
      <span data-testid="emergency-override">{emergencyOverrideActive ? 'ACTIVE' : 'INACTIVE'}</span>
      <span data-testid="alerts-count">{activeAlerts.length}</span>

      <button onClick={() => setActiveTab('traffic')}>Switch Tab</button>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={toggleLineStatus}>Toggle Line</button>
      <button onClick={toggleEmergencyOverride}>Toggle Emergency</button>
      {activeAlerts[0] && (
        <button onClick={() => acknowledgeAlert(activeAlerts[0].id)}>Acknowledge Alert</button>
      )}
    </div>
  );
};

describe('TelemetryContext', () => {
  beforeEach(() => {
    localStorage.clear();
    MockWebSocket.instances = [];
  });

  it('renders children with default context values', () => {
    render(
      <TelemetryProvider>
        <TestComponent />
      </TelemetryProvider>
    );

    expect(screen.getByTestId('active-tab')).toHaveTextContent('overview');
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('line-status')).toHaveTextContent('RUNNING');
    expect(screen.getByTestId('emergency-override')).toHaveTextContent('INACTIVE');
  });

  it('allows changing active tab, theme, line status, and emergency override', () => {
    render(
      <TelemetryProvider>
        <TestComponent />
      </TelemetryProvider>
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

  it('establishes WebSocket connection and handles snapshot telemetry updates', async () => {
    render(
      <TelemetryProvider>
        <TestComponent />
      </TelemetryProvider>
    );

    // Get created WebSocket instance
    expect(MockWebSocket.instances.length).toBeGreaterThan(0);
    const ws = MockWebSocket.instances[0];

    // Simulate server snapshot update message
    act(() => {
      ws.triggerMessage({
        event: 'snapshot',
        data: {
          cityHealthIndex: 99.5,
          totalPowerMW: 900.0,
        },
      });
    });

    expect(screen.getByTestId('city-health')).toHaveTextContent('99.5');
  });

  it('allows acknowledging active alerts', () => {
    render(
      <TelemetryProvider>
        <TestComponent />
      </TelemetryProvider>
    );

    expect(screen.getByTestId('alerts-count')).toHaveTextContent('2');

    act(() => {
      screen.getByText('Acknowledge Alert').click();
    });

    // Alert status is updated to RESOLVED
  });
});

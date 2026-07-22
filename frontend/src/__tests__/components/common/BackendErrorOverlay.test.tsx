import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { BackendErrorOverlay } from '../../../components/common/BackendErrorOverlay';
import { TelemetryProvider } from '../../../context/TelemetryContext';
import { MockWebSocket } from '../../../setupTests';

describe('BackendErrorOverlay Component', () => {
  beforeEach(() => {
    localStorage.clear();
    MockWebSocket.instances = [];
  });

  it('renders nothing when WebSocket connection is normal', () => {
    render(
      <TelemetryProvider>
        <BackendErrorOverlay />
      </TelemetryProvider>
    );

    expect(screen.queryByTestId('backend-error-overlay')).not.toBeInTheDocument();
  });

  it('renders error overlay when WebSocket encounters error', () => {
    render(
      <TelemetryProvider>
        <BackendErrorOverlay />
      </TelemetryProvider>
    );

    const ws = MockWebSocket.instances[0];
    act(() => {
      ws.triggerError(new Error('Connection refused'));
    });

    expect(screen.getByTestId('backend-error-overlay')).toBeInTheDocument();
    expect(screen.getByText('BACKEND CONNECTION ERROR')).toBeInTheDocument();
    expect(screen.getByText('RETRY CONNECTION')).toBeInTheDocument();
  });

  it('triggers reconnect when RETRY CONNECTION button is clicked', () => {
    render(
      <TelemetryProvider>
        <BackendErrorOverlay />
      </TelemetryProvider>
    );

    const ws = MockWebSocket.instances[0];
    act(() => {
      ws.triggerError(new Error('Connection refused'));
    });

    const retryBtn = screen.getByText('RETRY CONNECTION');
    fireEvent.click(retryBtn);

    // Initial overlay is hidden as connectionStatus resets to 'connecting'
    expect(screen.queryByTestId('backend-error-overlay')).not.toBeInTheDocument();
  });
});

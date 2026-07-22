import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BackendErrorOverlay } from '../../../components/common/BackendErrorOverlay';
import { TelemetryProvider } from '../../../context/TelemetryContext';

describe('BackendErrorOverlay Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('renders nothing when the backend connection is healthy', () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success', data: null }),
    }));

    render(
      <TelemetryProvider>
        <BackendErrorOverlay />
      </TelemetryProvider>,
    );

    expect(screen.queryByTestId('backend-error-overlay')).not.toBeInTheDocument();
  });

  it('renders the error overlay when the telemetry request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));

    render(
      <TelemetryProvider>
        <BackendErrorOverlay />
      </TelemetryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('backend-error-overlay')).toBeInTheDocument();
    });
    expect(screen.getByText('BACKEND CONNECTION ERROR')).toBeInTheDocument();
    expect(screen.getByText('RETRY CONNECTION')).toBeInTheDocument();
  });

  it('triggers reconnect when RETRY CONNECTION button is clicked', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));

    render(
      <TelemetryProvider>
        <BackendErrorOverlay />
      </TelemetryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('backend-error-overlay')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('RETRY CONNECTION'));

    // Connection status resets to 'connecting', hiding the overlay.
    await waitFor(() => {
      expect(screen.queryByTestId('backend-error-overlay')).not.toBeInTheDocument();
    });
  });
});

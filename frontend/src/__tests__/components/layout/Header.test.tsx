import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { Header } from '../../../components/layout/Header';
import { TelemetryProvider } from '../../../context/TelemetryContext';

describe('Header Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders title, search bar, and emergency override button', () => {
    render(
      <TelemetryProvider>
        <Header />
      </TelemetryProvider>
    );

    expect(screen.getByText('GREENPULSE OS')).toBeInTheDocument();
    expect(screen.getByText('CORE COMMAND PLATFORM')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('SEARCH SECTOR, GRID NODE, OR INCIDENT...')).toBeInTheDocument();
    expect(screen.getByText('EMERGENCY OVERRIDE')).toBeInTheDocument();
  });

  it('toggles emergency override status when clicked', () => {
    render(
      <TelemetryProvider>
        <Header />
      </TelemetryProvider>
    );

    const overrideBtn = screen.getByText('EMERGENCY OVERRIDE').closest('button');
    expect(overrideBtn).toBeInTheDocument();

    if (overrideBtn) {
      fireEvent.click(overrideBtn);
      expect(screen.getByText('OVERRIDE ON')).toBeInTheDocument();
    }
  });

  it('toggles theme when theme mode button is clicked', () => {
    render(
      <TelemetryProvider>
        <Header />
      </TelemetryProvider>
    );

    const themeBtn = screen.getByText('LIGHT MODE').closest('button');
    expect(themeBtn).toBeInTheDocument();

    if (themeBtn) {
      fireEvent.click(themeBtn);
      expect(screen.getByText('STEEL DARK')).toBeInTheDocument();
    }
  });
});

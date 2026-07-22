import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AIChatDrawer } from '../../../components/common/AIChatDrawer';
import { TelemetryProvider, useTelemetry } from '../../../context/TelemetryContext';

const buildFetch = () => vi.fn(async () => ({
  ok: true,
  json: async () => ({ status: 'success', data: [] }),
}));

const ToolStateProbe: React.FC = () => {
  const { emergencyOverrideActive, loadSheddingActive } = useTelemetry();

  return (
    <>
      <span data-testid="emergency-state">{emergencyOverrideActive ? 'ACTIVE' : 'INACTIVE'}</span>
      <span data-testid="load-shed-state">{loadSheddingActive ? 'ARMED' : 'DISARMED'}</span>
    </>
  );
};

describe('AIChatDrawer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the engineer response and immediately sends an industrial navigation tool call', async () => {
    vi.stubGlobal('fetch', buildFetch());
    const user = userEvent.setup();
    const setActiveView = vi.fn();

    render(
      <TelemetryProvider>
        <AIChatDrawer activeView="overview" setActiveView={setActiveView} />
      </TelemetryProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Open Sentinel AI Agent' }));
    await user.type(
      screen.getByLabelText('TERMINAL COMMAND'),
      'take me to panel where there are industrial assembly line settings',
    );
    await user.click(screen.getByRole('button', { name: 'RUN' }));

    expect(setActiveView).toHaveBeenCalledWith('INDUSTRIAL');
    expect(screen.getByText(/Routing core command interface to/i)).toBeInTheDocument();
    expect(screen.getByText('TOOL: NAVIGATE')).toBeInTheDocument();
  });

  it('executes override and load-shed tool calls against the live UI state', async () => {
    vi.stubGlobal('fetch', buildFetch());
    const user = userEvent.setup();

    render(
      <TelemetryProvider>
        <AIChatDrawer activeView="overview" setActiveView={vi.fn()} />
        <ToolStateProbe />
      </TelemetryProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Open Sentinel AI Agent' }));
    const terminal = screen.getByLabelText('TERMINAL COMMAND');

    await user.type(terminal, 'trigger emergency override');
    await user.click(screen.getByRole('button', { name: 'RUN' }));
    expect(screen.getByTestId('emergency-state')).toHaveTextContent('ACTIVE');

    await user.type(terminal, 'load shed Industrial Substation 04');
    await user.click(screen.getByRole('button', { name: 'RUN' }));
    expect(screen.getByTestId('load-shed-state')).toHaveTextContent('ARMED');
  });
});

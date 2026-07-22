import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';

const buildFetch = () => vi.fn(async (input: RequestInfo | URL) => (
  String(input).includes('/api/ai/agent/')
    ? { ok: true, json: async () => ({ status: 'success', agent: 'Sentinel AI', message: 'Routing core command interface to **Industrial Precision**.', actionTaken: { type: 'NAVIGATE', payload: { viewId: 'INDUSTRIAL' } } }) }
    : { ok: true, json: async () => ({ status: 'success', data: [] }) }
));

describe('App Sentinel integration', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('routes the assembly-line command into the Industrial dashboard view', async () => {
    vi.stubGlobal('fetch', buildFetch());
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Open Sentinel AI Agent' }));
    await user.type(
      screen.getByLabelText('TERMINAL COMMAND'),
      'take me to panel where there are industrial assembly line settings',
    );
    await user.click(screen.getByRole('button', { name: 'RUN' }));

    expect(await screen.findByText(/Routing core command interface to/i)).toBeInTheDocument();
    expect(await screen.findByText('INDUSTRIAL PRECISION & HEAVY AUTOMATION COMMAND')).toBeInTheDocument();
  });
});

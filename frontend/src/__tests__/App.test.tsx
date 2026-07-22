import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';

const buildFetch = () => vi.fn(async () => ({
  ok: true,
  json: async () => ({ status: 'success', data: [] }),
}));

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

    expect(screen.getByText(/Routing core command interface to/i)).toBeInTheDocument();
    expect(screen.getByText('INDUSTRIAL PRECISION & HEAVY AUTOMATION COMMAND')).toBeInTheDocument();
  });
});

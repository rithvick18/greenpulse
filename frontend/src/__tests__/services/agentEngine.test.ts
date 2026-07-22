import { afterEach, describe, expect, it, vi } from 'vitest';
import { processEngineerCommand } from '../../services/agentEngine';

describe('processEngineerCommand', () => {
  const telemetryContext = {
    cityHealthIndex: 98.7,
    totalPowerMW: 842.5,
    gridFrequencyHz: 50.01,
    activeAlerts: [{ status: 'ACTIVE' }, { status: 'RESOLVED' }],
  };

  afterEach(() => vi.unstubAllGlobals());

  it('forwards an industrial command to the secure backend and returns its tool result', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({
      status: 'success', agent: 'Sentinel AI', message: 'Routing to **Industrial Precision**.',
      actionTaken: { type: 'NAVIGATE', payload: { viewId: 'INDUSTRIAL' } },
    }) }));
    vi.stubGlobal('fetch', fetchMock);
    const result = await processEngineerCommand(
      'take me to panel where there are industrial assembly line settings',
      telemetryContext,
    );

    expect(fetchMock).toHaveBeenCalledWith('/api/ai/agent/', expect.objectContaining({ method: 'POST' }));
    expect(result.message).toContain('**Industrial Precision**');
    expect(result.actionTaken).toEqual({
      type: 'NAVIGATE',
      payload: { viewId: 'INDUSTRIAL' },
    });
  });

  it('returns a backend load-shed action without client-side tool inference', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({
      status: 'success', agent: 'Sentinel AI', message: 'Load shedding armed.',
      actionTaken: { type: 'LOAD_SHED', payload: { target: 'Industrial Substation 04' } },
    }) })));
    const result = await processEngineerCommand('load shed Industrial Substation 04', telemetryContext);

    expect(result.actionTaken).toEqual({
      type: 'LOAD_SHED',
      payload: { target: 'Industrial Substation 04' },
    });
  });
});

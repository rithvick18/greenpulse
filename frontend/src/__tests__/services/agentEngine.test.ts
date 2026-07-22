import { describe, expect, it } from 'vitest';
import { processEngineerCommand } from '../../services/agentEngine';

describe('processEngineerCommand', () => {
  const telemetryContext = {
    cityHealthIndex: 98.7,
    totalPowerMW: 842.5,
    gridFrequencyHz: 50.01,
    activeAlerts: [{ status: 'ACTIVE' }, { status: 'RESOLVED' }],
  };

  it('routes an industrial assembly-line request through the NAVIGATE tool', () => {
    const result = processEngineerCommand(
      'take me to panel where there are industrial assembly line settings',
      telemetryContext,
    );

    expect(result.message).toContain('**Industrial Precision**');
    expect(result.actionTaken).toEqual({
      type: 'NAVIGATE',
      payload: { viewId: 'INDUSTRIAL' },
    });
  });

  it('returns a live engineering status report from telemetry context', () => {
    const result = processEngineerCommand('give me a system status report', telemetryContext);

    expect(result.actionTaken).toBeUndefined();
    expect(result.message).toContain('**98.7**');
    expect(result.message).toContain('**842.5 MW**');
    expect(result.message).toContain('**1**');
  });

  it('prioritizes load-shed execution over energy navigation', () => {
    const result = processEngineerCommand('load shed Industrial Substation 04', telemetryContext);

    expect(result.actionTaken).toEqual({
      type: 'LOAD_SHED',
      payload: { target: 'Industrial Substation 04' },
    });
  });
});

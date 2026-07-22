import {
  SentinelOperationalView,
  ToolExecutionResult,
} from '../types/agentTools';

interface NavigationTarget {
  viewId: SentinelOperationalView;
  label: string;
  matcher: RegExp;
}

type TelemetryRecord = Record<string, unknown>;

const NAVIGATION_TARGETS: NavigationTarget[] = [
  {
    viewId: 'INDUSTRIAL',
    label: 'Industrial Precision',
    matcher: /\b(?:industrial|assembly\s*line|robotic|manufacturing)\b/i,
  },
  {
    viewId: 'ENERGY',
    label: 'Smart Energy Grid',
    matcher: /\b(?:energy|substation|power\s*grid|load\s*shedding)\b/i,
  },
  {
    viewId: 'TRAFFIC',
    label: 'Traffic Control',
    matcher: /\b(?:traffic|signal|congestion|av\s*corridor)\b/i,
  },
  {
    viewId: 'INFRASTRUCTURE',
    label: 'Infrastructure Telemetry',
    matcher: /\b(?:sensor|nodes?|structural|seismic|water\s*pipeline)\b/i,
  },
  {
    viewId: 'SAFETY',
    label: 'Public Safety Command',
    matcher: /\b(?:safety|incidents?|emergency|dispatch|surveillance)\b/i,
  },
  {
    viewId: 'OVERVIEW',
    label: 'GreenPulse Overview',
    matcher: /\b(?:overview|home|city\s*health|telemetry)\b/i,
  },
];

const NAVIGATION_INTENT = /\b(?:navigate|navigation|go(?:\s+to)?|take\s+me|open|show(?:\s+me)?|switch|route(?:\s+me)?|panel|screen|view|dashboard)\b/i;

const isNavigationIntent = (input: string): boolean => NAVIGATION_INTENT.test(input);

const isStatusQuery = (input: string): boolean => (
  /\bstatus\b/i.test(input)
  || /\b(?:system|network|grid)\s+health\b/i.test(input)
  || /\bhealth\s+(?:status|report|check)\b/i.test(input)
  || /\bhow\s+(?:is|are)\b.*\bhealth\b/i.test(input)
  || /\btelemetry\s+(?:status|report|readout|data)\b/i.test(input)
  || /\b(?:show|give|read|what|how)\b.*\btelemetry\b/i.test(input)
  || /\b(?:metrics?|diagnostics?|readout|report)\b/i.test(input)
);

const asTelemetryRecord = (telemetryContext: any): TelemetryRecord => (
  telemetryContext && typeof telemetryContext === 'object'
    ? telemetryContext as TelemetryRecord
    : {}
);

const readTelemetryValue = (context: TelemetryRecord, ...keys: string[]): unknown => {
  for (const key of keys) {
    if (context[key] !== undefined && context[key] !== null) {
      return context[key];
    }
  }

  return undefined;
};

const formatMetric = (value: unknown, unit = ''): string => {
  if (value === undefined || value === null || value === '') {
    return 'unavailable';
  }

  const formatted = typeof value === 'number'
    ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : String(value);

  return unit ? `${formatted} ${unit}` : formatted;
};

const activeAlertCount = (value: unknown): string => {
  if (Array.isArray(value)) {
    return String(value.filter((alert) => {
      if (!alert || typeof alert !== 'object') return true;
      const status = (alert as { status?: unknown }).status;
      return status === undefined || status === 'ACTIVE';
    }).length);
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return 'unavailable';
};

const createStatusReport = (telemetryContext: any): ToolExecutionResult => {
  const context = asTelemetryRecord(telemetryContext);
  const cityHealthIndex = readTelemetryValue(context, 'cityHealthIndex', 'city_health_index');
  const totalPowerMW = readTelemetryValue(context, 'totalPowerMW', 'total_power_mw', 'netGeneration', 'net_generation');
  const activeAlerts = readTelemetryValue(context, 'activeAlerts', 'active_alerts');
  const gridFrequencyHz = readTelemetryValue(context, 'gridFrequencyHz', 'grid_frequency');

  return {
    message: [
      'Acknowledged. **Sentinel AI** has sampled the live GreenPulse telemetry bus.',
      '',
      '**SYSTEM STATUS // ENGINEERING READOUT**',
      `- **City Health Index:** **${formatMetric(cityHealthIndex)}**`,
      `- **Grid Output:** **${formatMetric(totalPowerMW, 'MW')}**`,
      `- **Grid Frequency:** **${formatMetric(gridFrequencyHz, 'Hz')}**`,
      `- **Active Alerts:** **${activeAlertCount(activeAlerts)}**`,
      '',
      'Telemetry assessment complete. Routing remains under continuous supervisory control.',
    ].join('\n'),
  };
};

/**
 * Deterministically translates an engineer's natural-language command into a
 * Sentinel tool call or a live telemetry status report.
 */
export const processEngineerCommand = (
  input: string,
  telemetryContext: any,
): ToolExecutionResult => {
  const normalizedInput = input.trim();

  if (!normalizedInput) {
    return {
      message: 'Awaiting command. Specify a **view**, request a **system status**, or issue an authorized **override** or **load shed** instruction.',
    };
  }

  // Action verbs are intentionally evaluated before navigation keywords so a
  // command such as "load shed Industrial Substation 04" executes the action
  // instead of merely opening the Energy view.
  if (/\boverride\b/i.test(normalizedInput) || /\b(?:emergency\s+trigger|trigger\s+emergency)\b/i.test(normalizedInput)) {
    return {
      message: 'Acknowledged. Executing **emergency override** command against **CITYWIDE_AUX**. Emergency protocol instruction has been issued to the live operator interface.',
      actionTaken: {
        type: 'OVERRIDE',
        payload: { target: 'CITYWIDE_AUX' },
      },
    };
  }

  if (/\bload\s*shed\b/i.test(normalizedInput) || /\bgrid\s*balance\b/i.test(normalizedInput)) {
    return {
      message: 'Acknowledged. Executing **load-shed balancing** command for **Industrial Substation 04**. Automated contingency controls are being armed in the live operator interface.',
      actionTaken: {
        type: 'LOAD_SHED',
        payload: { target: 'Industrial Substation 04' },
      },
    };
  }

  // A status request takes priority over a domain keyword only when the user
  // did not explicitly ask to navigate. This keeps "show Energy" a navigation
  // command while "energy status" remains a live telemetry readout.
  if (isStatusQuery(normalizedInput) && !isNavigationIntent(normalizedInput)) {
    return createStatusReport(telemetryContext);
  }

  const navigationTarget = NAVIGATION_TARGETS.find(({ matcher }) => matcher.test(normalizedInput));
  if (navigationTarget) {
    return {
      message: `Acknowledged. Routing core command interface to **${navigationTarget.label}**. Navigation channel locked to **${navigationTarget.viewId}**.`,
      actionTaken: {
        type: 'NAVIGATE',
        payload: { viewId: navigationTarget.viewId },
      },
    };
  }

  if (isStatusQuery(normalizedInput)) {
    return createStatusReport(telemetryContext);
  }

  return {
    message: 'Command parsed, but no authorized tool matched. Request **system status**, navigate to an operational **view**, or issue a scoped **override** / **load shed** command.',
  };
};

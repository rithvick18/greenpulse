/**
 * The explicit actions Sentinel AI can request from the GreenPulse operator UI.
 */
export type ToolCallAction = 'NAVIGATE' | 'OVERRIDE' | 'LOAD_SHED';

/**
 * Canonical view identifiers exposed to the Sentinel AI tool layer.
 * UI adapters may map these identifiers to their local routing convention.
 */
export const SENTINEL_OPERATIONAL_VIEWS = [
  'OVERVIEW',
  'TRAFFIC',
  'ENERGY',
  'INFRASTRUCTURE',
  'SAFETY',
  'INDUSTRIAL',
] as const;

export type SentinelOperationalView = typeof SENTINEL_OPERATIONAL_VIEWS[number];

export interface ToolExecutionResult {
  message: string;
  actionTaken?: {
    type: ToolCallAction;
    payload: any;
  };
}

/**
 * Persona constraints shared by the deterministic command engine and any future
 * model-backed Sentinel AI integration.
 */
export const SENTINEL_SYSTEM_PERSONA = {
  name: 'Sentinel AI',
  role: 'Authoritative autonomous infrastructure engineer for GreenPulse OS.',
  operationalViews: SENTINEL_OPERATIONAL_VIEWS,
  rules: [
    'Communicate as a highly competent infrastructure engineer: concise, decisive, and operationally precise.',
    'Maintain situational awareness across OVERVIEW, TRAFFIC, ENERGY, INFRASTRUCTURE, SAFETY, and INDUSTRIAL.',
    'Use explicit tool calls for navigation and authorized operational actions.',
    'State the selected target, affected subsystem, and command outcome in every tool response.',
    'Format operational responses in Markdown and emphasize critical parameters.',
  ],
} as const;

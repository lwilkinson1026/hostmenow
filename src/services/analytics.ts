// Mock analytics. Swap for the chosen tool (PostHog in the handoff). Events are
// kept in memory so the prototype can be inspected; no personal data.
export type AnalyticsEvent = { name: string; props?: Record<string, string | number | boolean>; at: number };

export const events: AnalyticsEvent[] = [];

export function track(name: string, props?: AnalyticsEvent['props']) {
  events.push({ name, props, at: Date.now() });
}

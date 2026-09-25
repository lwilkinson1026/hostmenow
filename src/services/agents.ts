// Mock "Connect your bot": the member's personal MCP server for AI agents (Grok,
// Claude, ChatGPT, anything that speaks MCP). Swap for the real agents API.
import { delay } from './delay';

export const MCP_SERVER_URL = 'https://mcp.hostmenow.com/mcp';

/** The tools the MCP server exposes. Bookings follow the member's rules: nights 5 days out, free nights first. */
export const MCP_TOOLS = [
  { name: 'search_homes', about: 'Find homes open in the next 5 days.' },
  { name: 'get_home', about: 'Photos, details, rules and price for one home.' },
  { name: 'check_nights', about: 'Your free nights and when they unlock.' },
  { name: 'book_stay', about: 'Book a stay, within the limits you set here.' },
  { name: 'list_trips', about: 'Your upcoming and past trips.' },
  { name: 'cancel_trip', about: 'Cancel a trip. Free nights return 24 hours or more ahead.' },
] as const;

/** A new connection key. Shown to the member once; the server stores only a hash. */
export async function createKey(): Promise<{ key: string; last4: string }> {
  await delay(600);
  const chars = 'abcdefghijkmnopqrstuvwxyz23456789';
  const body = Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return { key: `hmn_${body}`, last4: body.slice(-4) };
}

/** Stands in for the first MCP handshake from the member's agent. */
export async function waitForConnection(): Promise<{ client: string }> {
  await delay(4500);
  return { client: 'Grok' };
}

export async function revokeKey(): Promise<void> {
  await delay(400);
}

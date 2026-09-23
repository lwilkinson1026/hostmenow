// Mock Hostshare API for the host opt-in. The real flow writes hostmenow_optins
// records (and a W-9 if none is on file) against the host's existing session.
import { delay } from './delay';

export type OptInRecord = { listingId: string; level: 'both' | 'paid' };

export async function optIn(records: OptInRecord[], w9?: { legal: string; tin: string; address: string }) {
  await delay(900);
  return { ok: true as const, count: records.length, w9Saved: !!w9 };
}

export async function saveListings(records: OptInRecord[]) {
  await delay(500);
  return { ok: true as const, count: records.length };
}

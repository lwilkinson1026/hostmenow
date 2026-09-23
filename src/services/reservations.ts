// Mock of the reservation messages hostmenow sends Hostshare (handoff section 7,
// Revision 01 section 4). Hostshare adds the host id and locks the listing's earn
// rate on receipt, then records share-night credit for the free nights.
import type { NightKind } from '@/lib/shareLedger';
import { delay } from './delay';

export type ReservationPayload = {
  bookingId: string;
  listingId: string;
  /** Every night of the stay, marked free or paid. */
  nights: { date: string; kind: NightKind }[];
};

export type ReservationMessage =
  | { type: 'reservation.confirmed'; payload: ReservationPayload }
  | { type: 'reservation.cancelled'; bookingId: string; by: 'member' | 'host' };

/** Sent log, for inspecting what the prototype would have sent. */
export const sent: ReservationMessage[] = [];

export async function send(message: ReservationMessage) {
  await delay(150);
  sent.push(message);
  return { ok: true as const };
}

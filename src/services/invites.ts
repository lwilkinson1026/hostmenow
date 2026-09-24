// Mock invite codes and invite links. Swap for the real invites API.
import { MAGIC_BAD_CODE } from '@/data/mock';
import { delay } from './delay';

/** Any non-empty code works except BADCODE. */
export async function validateCode(code: string): Promise<boolean> {
  await delay(450);
  return code.trim().length > 0 && code.trim().toUpperCase() !== MAGIC_BAD_CODE;
}

/** Stands in for the native share sheet with a personal invite link. */
export async function shareInviteLink(): Promise<{ shared: boolean; url: string }> {
  await delay(700);
  return { shared: true, url: `https://hostmenow.com/i/${Math.random().toString(36).slice(2, 8)}` };
}

/** Stands in for the native share sheet with a link to the host page, carrying the member's referral. */
export async function shareHostLink(ref: string): Promise<{ shared: boolean; url: string }> {
  await delay(700);
  return { shared: true, url: `https://hostmenow.com/hosts?ref=${encodeURIComponent(ref)}` };
}

/** Stands in for the native share sheet for a listing. */
export async function shareListing(listingId: string): Promise<{ shared: boolean }> {
  await delay(500);
  return { shared: listingId.length > 0 };
}

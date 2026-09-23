// Mock payments. Swap for Stripe (with Apple Pay) once decided (open decision 3).
import { delay } from './delay';

export type PayMethod = 'apple_pay' | 'card';

export async function payMembership(method: PayMethod): Promise<{ ok: true; method: PayMethod }> {
  await delay(method === 'apple_pay' ? 1200 : 1500);
  return { ok: true, method };
}

export async function payStay(amount: number, method: PayMethod): Promise<{ ok: true; amount: number; method: PayMethod }> {
  await delay(1300);
  return { ok: true, amount, method };
}

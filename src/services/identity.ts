// Mock ID verification. Swap for the chosen vendor (open decision 3).
import { delay } from './delay';

export type IdStatus = 'verifying' | 'verified' | 'failed';

/** The capture itself is instant; the check runs in the background. */
export async function submitCapture(kind: 'id' | 'selfie'): Promise<{ captured: true; kind: typeof kind }> {
  await delay(250);
  return { captured: true, kind };
}

export async function checkStatus(ms = 2400): Promise<IdStatus> {
  await delay(ms);
  return 'verified';
}

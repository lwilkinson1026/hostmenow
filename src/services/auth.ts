// Mock auth. Swap for expo-apple-authentication, Google sign-in and a phone OTP provider.
import { delay } from './delay';

export type AuthProvider = 'apple' | 'google' | 'phone';

export async function signIn(provider: AuthProvider): Promise<{ ok: true; provider: AuthProvider }> {
  await delay(provider === 'phone' ? 700 : 900);
  return { ok: true, provider };
}

export async function cancelMembership(): Promise<{ ok: true }> {
  await delay(800);
  return { ok: true };
}

export async function signOut(): Promise<void> {
  await delay(150);
}

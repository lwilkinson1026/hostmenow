import { router } from 'expo-router';
import { useState } from 'react';

import { OutlineButton, PrimaryButton, TextButton } from '@/components/Buttons';
import { OnboardingScreen, useTitleTop } from '@/components/Onboarding';
import { T } from '@/components/Text';
import { auth } from '@/services';
import type { AuthProvider } from '@/services/auth';

/** B2. Sign in. No passwords. */
export default function SignIn() {
  const top = useTitleTop();
  const [pending, setPending] = useState<AuthProvider | null>(null);

  const go = async (p: AuthProvider) => {
    if (pending) return;
    setPending(p);
    await auth.signIn(p);
    setPending(null);
    router.push('/onboarding/id-scan');
  };

  return (
    <OnboardingScreen
      actions={
        <>
          <PrimaryButton tone="dark" label="Continue with Apple" loading={pending === 'apple'} onPress={() => go('apple')} />
          <OutlineButton tone="dark" label="Continue with Google" loading={pending === 'google'} onPress={() => go('google')} />
          <TextButton tone="dark" label="Use phone number" loading={pending === 'phone'} onPress={() => go('phone')} />
          <T variant="caption" tone="dark" color="inkSecondary" align="center" style={{ marginTop: 8 }}>
            No passwords. Ever.
          </T>
        </>
      }
    >
      <T variant="display" tone="dark" style={{ marginTop: top }}>Let's get you in.</T>
    </OnboardingScreen>
  );
}

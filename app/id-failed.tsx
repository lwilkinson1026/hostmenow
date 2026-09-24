import { router } from 'expo-router';
import { View } from 'react-native';

import { PrimaryButton, TextButton } from '@/components/Buttons';
import { DriftBackground } from '@/components/DriftBackground';
import { OnboardingScreen } from '@/components/Onboarding';
import { T } from '@/components/Text';
import { useDesktop } from '@/lib/layout';

/** L. ID failed. Calm, dark, one clear way forward. */
export default function IdFailed() {
  const desktop = useDesktop();
  return (
    <OnboardingScreen
      background={desktop ? <DriftBackground source={require('../assets/photos/landing.jpg')} overlay={0.78} /> : undefined}
      contentStyle={{ justifyContent: 'center' }}
      actions={
        <View style={{ gap: 4 }}>
          <PrimaryButton tone="dark" label="Try again" onPress={() => router.replace({ pathname: '/onboarding/id-scan', params: { mode: 'retry' } })} />
          <TextButton tone="dark" label="Get help" />
        </View>
      }
    >
      <View style={{ gap: 14, marginTop: desktop ? 0 : -20 }}>
        <T variant="display" tone="dark">We need one more look.</T>
        <T tone="dark" color="inkSecondary">Your ID photo didn't come through clearly. Retaking takes a few seconds.</T>
      </View>
    </OnboardingScreen>
  );
}

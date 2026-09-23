import { router } from 'expo-router';
import { View } from 'react-native';

import { PrimaryButton } from '@/components/Buttons';
import { OnboardingScreen, useTitleTop } from '@/components/Onboarding';
import { T } from '@/components/Text';

/** B5 intro. */
export default function SayHello() {
  const top = useTitleTop();
  return (
    <OnboardingScreen actions={<PrimaryButton tone="dark" label="Start" onPress={() => router.push('/onboarding/question/1')} />}>
      <View style={{ marginTop: top, gap: 16 }}>
        <T variant="display" tone="dark">Say hello.</T>
        <T tone="dark" color="inkSecondary">Three quick questions. 15 seconds each. Hosts see this only after you book.</T>
      </View>
    </OnboardingScreen>
  );
}

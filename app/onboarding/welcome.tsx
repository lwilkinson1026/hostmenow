import { router } from 'expo-router';
import { View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { PrimaryButton } from '@/components/Buttons';
import { DriftBackground } from '@/components/DriftBackground';
import { OnboardingScreen } from '@/components/Onboarding';
import { T } from '@/components/Text';
import { member } from '@/data/mock';
import { BRAND } from '@/config';

/** B1. Invite welcome. */
export default function Welcome() {
  return (
    <OnboardingScreen
      background={<DriftBackground source={require('../../assets/photos/landing.jpg')} cropX={51} />}
      contentStyle={{ justifyContent: 'center' }}
      actions={<PrimaryButton tone="dark" label="Continue" onPress={() => router.push('/onboarding/sign-in')} />}
    >
      <View style={{ alignItems: 'center', gap: 16, marginTop: -40 }}>
        <Avatar size={64} tone="dark" initials={member.invitedBy.initials} />
        <T variant="callout" tone="dark" color="inkSecondary">{member.invitedBy.name} invited you.</T>
        <T variant="display" tone="dark" align="center" style={{ marginTop: 12 }}>Welcome to {BRAND}.</T>
        <T tone="dark" color="inkSecondary" align="center" style={{ maxWidth: 300 }}>
          A private network of homes. Five nights on us each year.
        </T>
      </View>
    </OnboardingScreen>
  );
}

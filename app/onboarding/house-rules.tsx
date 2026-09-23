import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useInsets } from '@/lib/insets';

import { PrimaryButton } from '@/components/Buttons';
import { OnboardingScreen, useTitleTop } from '@/components/Onboarding';
import { Spinner } from '@/components/Spinner';
import { T } from '@/components/Text';
import { houseRules } from '@/data/mock';
import { useApp } from '@/store/app';
import { colors } from '@/theme';

/** B4. The house rules. */
export default function HouseRules() {
  const top = useTitleTop();
  const insets = useInsets();
  const verifying = useApp((s) => s.idStatus === 'verifying');
  return (
    <OnboardingScreen actions={<PrimaryButton tone="dark" label="I'm in" onPress={() => router.push('/onboarding/say-hello')} />}>
      {verifying ? (
        <View style={{ position: 'absolute', left: 24, top: insets.top + 13, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Spinner size={14} tone="dark" />
          <T variant="caption" tone="dark" color="inkSecondary">Verifying in the background</T>
        </View>
      ) : null}
      <T variant="display" tone="dark" style={{ marginTop: top }}>The house rules.</T>
      <View style={{ marginTop: 40, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.dark.line }}>
        {houseRules.map((r) => (
          <T
            key={r}
            tone="dark"
            style={{ fontSize: 20, lineHeight: 28, paddingVertical: 22, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.dark.line }}
          >
            {r}
          </T>
        ))}
      </View>
    </OnboardingScreen>
  );
}

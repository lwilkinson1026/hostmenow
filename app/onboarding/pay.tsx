import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PayButton, TextButton } from '@/components/Buttons';
import { OnboardingScreen, useTitleTop } from '@/components/Onboarding';
import { T } from '@/components/Text';
import { member } from '@/data/mock';
import { haptics, payments } from '@/services';
import type { PayMethod } from '@/services/payments';
import { useApp } from '@/store/app';
import { colors } from '@/theme';

const benefits = ['5 free nights every year', '50% off every night after that', 'Nights roll over for 5 years'];

/** B6. Your membership. Also used to resume a paused membership. */
export default function Pay() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const top = useTitleTop();
  const setMembership = useApp((s) => s.setMembership);
  const [pending, setPending] = useState<PayMethod | null>(null);

  const pay = async (method: PayMethod) => {
    if (pending) return;
    setPending(method);
    await payments.payMembership(method);
    haptics.success();
    setPending(null);
    if (mode === 'resume') {
      setMembership('active');
      router.dismissTo('/explore');
    } else {
      router.push('/onboarding/youre-in');
    }
  };

  return (
    <OnboardingScreen
      actions={
        <View style={{ gap: 8 }}>
          <PayButton tone="dark" loading={pending === 'apple_pay'} disabled={pending === 'card'} onPress={() => pay('apple_pay')} />
          <TextButton tone="dark" label="Pay with card" loading={pending === 'card'} onPress={() => pay('card')} />
        </View>
      }
    >
      <T variant="title" tone="dark" style={{ marginTop: top }}>Your membership.</T>
      <View style={{ marginTop: 38, gap: 6 }}>
        <T tone="dark" style={{ fontSize: 72, lineHeight: 76, letterSpacing: -2.16 }} variant="bodyStrong">
          ${member.membership.firstYear}
        </T>
        <T variant="callout" tone="dark" color="inkSecondary">
          First year. Then ${member.membership.monthlyAfter} a month. Cancel anytime.
        </T>
      </View>
      <View style={{ marginTop: 38, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.dark.line }}>
        {benefits.map((b) => (
          <T key={b} tone="dark" style={{ paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.dark.line }}>
            {b}
          </T>
        ))}
      </View>
    </OnboardingScreen>
  );
}

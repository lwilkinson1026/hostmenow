import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton, TextButton } from '@/components/Buttons';
import { NavHeader } from '@/components/NavHeader';
import { T } from '@/components/Text';
import { MEMBERSHIP_MONTHLY } from '@/config';
import { member } from '@/data/mock';
import { monthDay, nextMonthly, plural } from '@/lib/dates';
import { useInsets } from '@/lib/insets';
import { analytics, auth, haptics } from '@/services';
import { useApp, useBankedNights } from '@/store/app';
import { colors } from '@/theme';

const benefits = ['5 free nights every year', '50% off every night after that', 'Nights roll over for 5 years'];

/** Membership, with the cancel flow and its retention screen (Revision 03, 3.7). */
export default function Membership() {
  const insets = useInsets();
  const banked = useBankedNights();
  const setMembership = useApp((s) => s.setMembership);
  const [step, setStep] = useState<'details' | 'retain'>('details');
  const [cancelling, setCancelling] = useState(false);

  const startCancel = () => {
    setStep('retain');
    analytics.track('cancel_screen_shown', { banked });
  };
  const keep = () => {
    analytics.track('cancel_screen_saved', { banked });
    haptics.success();
    router.back();
  };
  const cancelAnyway = async () => {
    setCancelling(true);
    await auth.cancelMembership();
    analytics.track('membership_cancelled', { banked });
    setMembership('paused');
    setCancelling(false);
    router.back();
  };

  if (step === 'retain') {
    return (
      <View style={[styles.page, { paddingTop: insets.top - 5, paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        <StatusBar style="dark" />
        <NavHeader />
        <View style={{ flex: 1, justifyContent: 'center', gap: 14 }}>
          <T variant="display" accessibilityRole="header">
            {banked > 0 ? `You have ${plural(banked, 'free night')} banked.` : 'Before you go.'}
          </T>
          <T color="inkSecondary">
            {banked > 0
              ? 'If you cancel, they freeze until you come back.'
              : 'You can rejoin any time, and your free nights start again each year.'}
          </T>
        </View>
        <View style={{ gap: 4 }}>
          <PrimaryButton label="Keep my membership" onPress={keep} />
          <TextButton label="Cancel anyway" loading={cancelling} onPress={cancelAnyway} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.page, { paddingTop: insets.top - 5, paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
      <StatusBar style="dark" />
      <NavHeader title="Membership" />
      <View style={{ marginTop: 40, gap: 4 }}>
        <T variant="bodyStrong" style={{ fontSize: 56, lineHeight: 60, letterSpacing: -1.7 }}>
          ${MEMBERSHIP_MONTHLY}
          <T color="inkSecondary"> a month</T>
        </T>
        <T variant="callout" color="inkSecondary">Renews {monthDay(nextMonthly(member.joined))}</T>
      </View>
      <View style={{ marginTop: 32, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.light.line }}>
        {benefits.map((b) => (
          <T key={b} style={styles.line}>{b}</T>
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <TextButton label="Cancel membership" color="danger" onPress={startCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.light.bg, paddingHorizontal: 24 },
  line: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.light.line },
});

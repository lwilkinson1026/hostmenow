import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useInsets } from '@/lib/insets';

import { NavHeader } from '@/components/NavHeader';
import { T } from '@/components/Text';
import { fullDate, plural, toISODate, today } from '@/lib/dates';
import { unlockDate, useApp, useBankedNights } from '@/store/app';
import { colors } from '@/theme';

/** J. Nights bank. */
export default function Nights() {
  const insets = useInsets();
  const bank = useBankedNights();
  const { nightGrants: grants, unlockDays, membership } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: colors.light.bg, paddingTop: insets.top - 5, paddingHorizontal: 24 }}>
      <StatusBar style="dark" />
      <NavHeader title="Nights bank" />
      <View style={{ marginTop: 56, gap: 4 }}>
        <T variant="bodyStrong" style={{ fontSize: 120, lineHeight: 116, letterSpacing: -4.8, paddingTop: 8 }}>{bank}</T>
        <T color="inkSecondary">free {bank === 1 ? 'night' : 'nights'}</T>
      </View>
      <View style={{ marginTop: 48, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.light.line }}>
        {grants.map((g) => (
          <View key={g.granted} style={{ gap: 2, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.light.line }}>
            <T variant="bodyStrong">
              {g.used === 0 ? plural(g.nights, 'night') : `${g.nights - g.used} of ${plural(g.nights, 'night')} left`}
            </T>
            <T variant="callout" color="inkSecondary">
              Granted {fullDate(g.granted)} · Expires {fullDate(g.expires)}
            </T>
            {unlockDate(g, unlockDays).getTime() > today().getTime() && g.used < g.nights ? (
              <T variant="caption" color="accent">Unlocks {fullDate(toISODate(unlockDate(g, unlockDays)))}</T>
            ) : null}
          </View>
        ))}
      </View>
      <T variant="caption" color="inkSecondary" style={{ marginTop: 20 }}>
        {membership === 'paused'
          ? 'Your nights are frozen while your membership is paused. They still expire on schedule.'
          : 'Free nights are used oldest first. You get 5 more every year.'}
      </T>
    </View>
  );
}

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useInsets } from '@/lib/insets';

import { NavHeader } from '@/components/NavHeader';
import { T } from '@/components/Text';
import { fullDate, plural } from '@/lib/dates';
import { useApp, useFreeNights } from '@/store/app';
import { colors } from '@/theme';

/** J. Nights bank. */
export default function Nights() {
  const insets = useInsets();
  const bank = useFreeNights();
  const grants = useApp((s) => s.nightGrants);
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
          </View>
        ))}
      </View>
      <T variant="caption" color="inkSecondary" style={{ marginTop: 20 }}>
        Free nights are used oldest first. You get 5 more every year.
      </T>
    </View>
  );
}

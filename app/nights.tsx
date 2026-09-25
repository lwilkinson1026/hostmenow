import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useInsets } from '@/lib/insets';

import { useCountUp } from '@/components/CountUp';
import { NavHeader } from '@/components/NavHeader';
import { Reveal } from '@/components/Reveal';
import { T } from '@/components/Text';
import { fullDate, plural, toISODate, today } from '@/lib/dates';
import { useColumn, useDesktop } from '@/lib/layout';
import { getListing, listings } from '@/data/mock';
import { aboutMoney, nightValue } from '@/lib/value';
import { dollars, staysWorth } from '@/lib/worth';
import { unlockDate, useApp, useBankedNights } from '@/store/app';
import { colors } from '@/theme';

/** J. Nights bank. */
export default function Nights() {
  const insets = useInsets();
  const desktop = useDesktop();
  const column = useColumn(640);
  const bank = useBankedNights();
  const { nightGrants: grants, unlockDays, membership, bookings } = useApp();
  // The number settles into place; what it's worth follows once it lands.
  const counted = Math.round(useCountUp(bank, { duration: 1200, delay: 200 }));
  const worth = staysWorth(bookings, (id) => getListing(id)?.retailNight);
  return (
    <View style={{ flex: 1, backgroundColor: colors.light.bg }}>
      <View style={[{ flex: 1, paddingTop: desktop ? 24 : insets.top - 5, paddingHorizontal: 24 }, column]}>
      <StatusBar style="dark" />
      <NavHeader title="Nights bank" />
      <View style={{ marginTop: 56, gap: 4 }}>
        <T
          variant="bodyStrong"
          accessibilityLabel={String(bank)}
          style={{ fontSize: 120, lineHeight: 116, letterSpacing: -4.8, paddingTop: 8, fontVariant: ['tabular-nums'] }}
        >
          {counted}
        </T>
        <T color="inkSecondary">free {bank === 1 ? 'night' : 'nights'}</T>
        {bank > 0 ? (
          <Reveal delay={1300} duration={900}>
            <T variant="callout" color="inkSecondary" style={{ marginTop: 4 }}>
              About {aboutMoney(bank * nightValue(listings))} at homes near you
            </T>
          </Reveal>
        ) : null}
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
      {worth.nights > 0 && worth.saved > 0 ? (
        <Reveal delay={1700} duration={900} style={{ marginTop: 20 }}>
          <T variant="callout" color="inkSecondary">
            Your stays so far: {plural(worth.nights, 'night')}, a {dollars(worth.saved)} value.
          </T>
        </Reveal>
      ) : null}
      <T variant="caption" color="inkSecondary" style={{ marginTop: 20 }}>
        {membership === 'paused'
          ? 'Your nights are frozen while your membership is paused. They still expire on schedule.'
          : 'Free nights are used oldest first. You get 5 more every year.'}
      </T>
      </View>
    </View>
  );
}

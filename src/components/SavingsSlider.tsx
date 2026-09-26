import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BRAND } from '@/config';
import { plural } from '@/lib/dates';
import { SAVINGS_ASSUMPTIONS as A, yearOfTravel } from '@/lib/savings';
import { colors } from '@/theme';
import { T } from './Text';

const MIN = 1;
const MAX = 60;
const START = 21;

const dollars = (n: number) => `$${(Math.round(n / 10) * 10).toLocaleString('en-US')}`;
const span = (nights: number) => (nights >= 7 && nights % 7 === 0 ? plural(nights / 7, 'week') : plural(nights, 'night'));

/** Learn More: slide how much you travel in a year; see what hostmenow saves against Airbnb. */
export function SavingsSlider() {
  const [nights, setNights] = useState(START);
  const y = yearOfTravel(nights);
  const ahead = y.saved > 0;

  return (
    <View style={{ gap: 20 }}>
      <View style={{ gap: 4 }}>
        <T color="inkSecondary">Travel {span(nights)} a year and you'd</T>
        <T variant="bodyStrong" style={{ fontSize: 56, lineHeight: 60, letterSpacing: -1.7, fontVariant: ['tabular-nums'] }}>
          {ahead ? `save ${dollars(y.saved)}` : `pay ${dollars(-y.saved)} more`}
        </T>
        {!ahead ? (
          <T variant="callout" color="inkSecondary">The membership pays for itself once you use your {A.freeNights} free nights.</T>
        ) : null}
      </View>

      <View>
        <Slider
          accessibilityLabel="Nights you travel in a year"
          minimumValue={MIN}
          maximumValue={MAX}
          step={1}
          value={nights}
          onValueChange={(v) => setNights(Math.round(v))}
          minimumTrackTintColor={colors.light.ink}
          maximumTrackTintColor={colors.light.line}
          thumbTintColor={colors.light.ink}
          style={{ height: 40 }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T variant="caption" color="inkSecondary">1 night</T>
          <T variant="caption" color="inkSecondary">2 months</T>
        </View>
      </View>

      <View>
        <View style={[styles.row, styles.first]}>
          <T>On Airbnb</T>
          <T style={styles.num}>{dollars(y.airbnb)}</T>
        </View>
        <View style={styles.row}>
          <T>On {BRAND}, membership included</T>
          <T variant="bodyStrong" style={styles.num}>{dollars(y.hostmenow)}</T>
        </View>
      </View>

      <T variant="caption" color="inkSecondary">
        Homes at ${A.rate} a night, {A.nightsPerStay}-night stays, ${A.cleaning} cleaning on each. Airbnb's guest service fee at about{' '}
        {Math.round(A.airbnbServiceFee * 100)}%. Both include taxes. On {BRAND}, your first {A.freeNights} nights are free and the rest are half
        price, booked within 5 days of check-in.
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.light.line },
  first: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.light.line },
  num: { fontVariant: ['tabular-nums'] },
});

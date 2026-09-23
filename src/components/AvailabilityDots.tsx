import { View } from 'react-native';

import { windowDays } from '@/lib/dates';
import { colors } from '@/theme';
import { T } from './Text';

/** Calm green for open nights; the only green in the app. */
export const OPEN = '#4F8A5B';
const BLOCKED = '#D6D3D1';

type Props = { isOpen: (day: number) => boolean; size?: number; labels?: boolean };

/** The next 5 days at a glance: green is open, grey is blocked. */
export function AvailabilityDots({ isOpen, size = 7, labels }: Props) {
  const days = windowDays(5);
  const summary = days.map((d) => `${d.weekday} ${isOpen(d.offset) ? 'open' : 'blocked'}`).join(', ');
  return (
    <View accessible accessibilityLabel={summary} style={{ flexDirection: 'row', gap: labels ? 10 : 3 }}>
      {days.map((d) => (
        <View key={d.offset} style={{ alignItems: 'center', gap: 3 }}>
          <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: isOpen(d.offset) ? OPEN : BLOCKED }} />
          {labels ? (
            <T variant="caption" style={{ fontSize: 11, lineHeight: 13, color: isOpen(d.offset) ? colors.light.inkSecondary : colors.light.inkTertiary }}>
              {d.weekday[0]}
            </T>
          ) : null}
        </View>
      ))}
    </View>
  );
}

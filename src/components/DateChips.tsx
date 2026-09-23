import { Pressable, View } from 'react-native';

import { windowDays } from '@/lib/dates';
import { haptics } from '@/services';
import { colors, radius, size } from '@/theme';
import { T } from './Text';

type Props = {
  /** Selected offset from today (1..5). */
  selected: number;
  onSelect: (offset: number) => void;
  /** Offsets that are not open. */
  unavailable?: number[];
};

/** The next 5 days only, calculated from today. */
export function DateChips({ selected, onSelect, unavailable = [] }: Props) {
  const days = windowDays();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Arrival day" style={{ flexDirection: 'row', gap: 8 }}>
      {days.map((d) => {
        const off = unavailable.includes(d.offset);
        const on = !off && d.offset === selected;
        return (
          <Pressable
            key={d.offset}
            accessibilityRole="radio"
            accessibilityState={{ selected: on, disabled: off }}
            accessibilityLabel={`${d.weekday} ${d.day}${off ? ', not open' : ''}`}
            disabled={off}
            onPress={() => {
              haptics.tapLight();
              onSelect(d.offset);
            }}
            style={{
              flex: 1,
              height: size.chip,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: on ? colors.light.ink : colors.light.line,
              backgroundColor: on ? colors.light.ink : colors.light.bg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <T variant="caption" style={{ color: on ? colors.light.onInk : off ? colors.light.inkTertiary : colors.light.ink }}>
              {d.weekday}
            </T>
            <T variant="calloutStrong" style={{ color: on ? colors.light.onInk : off ? colors.light.inkTertiary : colors.light.ink }}>
              {d.day}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

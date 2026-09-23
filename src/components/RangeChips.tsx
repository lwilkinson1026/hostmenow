import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { windowDays } from '@/lib/dates';
import { isTappable, tapDay, type Range, type RangeRules } from '@/lib/range';
import { haptics } from '@/services';
import { colors, radius, size } from '@/theme';
import { T } from './Text';

type Props = {
  /** How many days to show from tomorrow. More than 5 scrolls; days past 5 can only end a stay. */
  days?: number;
  value: Range | null;
  onChange: (r: Range | null) => void;
  rules: RangeRules;
};

const GAP = 8;

/** Tap the first night, then the last night; the days between fill in. */
export function RangeChips({ days = 5, value, onChange, rules }: Props) {
  const [width, setWidth] = useState(0);
  const list = windowDays(days);
  const scrolls = days > 5;
  const chipW = width > 0 ? (width - GAP * 4) / 5 : 0;

  const chips = list.map((d) => {
    const inRange = !!value && d.offset >= value.start && d.offset <= value.end;
    const edge = !!value && (d.offset === value.start || d.offset === value.end);
    const tappable = isTappable(value, d.offset, rules);
    const fg = edge ? colors.light.onInk : tappable || inRange ? colors.light.ink : colors.light.inkTertiary;
    return (
      <Pressable
        key={d.offset}
        accessibilityRole="button"
        accessibilityState={{ selected: inRange, disabled: !tappable }}
        accessibilityLabel={`${d.weekday} ${d.day}${rules.isOpen(d.offset) ? '' : ', not open'}`}
        disabled={!tappable && !inRange}
        onPress={() => {
          haptics.tapLight();
          onChange(tapDay(value, d.offset, rules));
        }}
        style={{
          ...(scrolls ? { width: chipW } : { flex: 1 }),
          height: size.chip,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: edge ? colors.light.ink : inRange ? colors.light.bgSubtle : colors.light.line,
          backgroundColor: edge ? colors.light.ink : inRange ? colors.light.bgSubtle : colors.light.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <T variant="caption" style={{ color: fg }}>{d.weekday}</T>
        <T variant="calloutStrong" style={{ color: fg, textDecorationLine: rules.isOpen(d.offset) ? 'none' : 'line-through' }}>{d.day}</T>
      </Pressable>
    );
  });

  if (!scrolls) {
    return (
      <View accessibilityLabel="Nights" style={{ flexDirection: 'row', gap: GAP }}>
        {chips}
      </View>
    );
  }
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} accessibilityLabel="Nights">
      {width > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: GAP }}
          style={{ marginHorizontal: -24 }}
        >
          <View style={{ width: 24 - GAP }} />
          {chips}
          <View style={{ width: 24 - GAP }} />
        </ScrollView>
      ) : (
        <View style={{ height: size.chip }} />
      )}
    </View>
  );
}

import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { haptics } from '@/services';
import { colors, radius } from '@/theme';
import { T } from './Text';

type Props<V extends string> = {
  options: { value: V; label: string }[];
  value: V;
  onChange: (v: V) => void;
  style?: StyleProp<ViewStyle>;
};

/** List / Map and Upcoming / Past. */
export function Segmented<V extends string>({ options, value, onChange, style }: Props<V>) {
  return (
    <View accessibilityRole="tablist" style={[{ flexDirection: 'row', padding: 3, borderRadius: radius.pill, backgroundColor: colors.light.bgSubtle }, style]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => {
              if (!on) haptics.tapLight();
              onChange(o.value);
            }}
            style={{
              flex: 1,
              height: 34,
              paddingHorizontal: 16,
              borderRadius: radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: on ? colors.light.bg : 'transparent',
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: on ? colors.light.line : 'transparent',
            }}
          >
            <T variant={on ? 'calloutStrong' : 'callout'} color={on ? 'ink' : 'inkSecondary'}>
              {o.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

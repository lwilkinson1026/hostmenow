import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useInsets } from '@/lib/insets';

import { haptics } from '@/services';
import { colors } from '@/theme';
import { Icon, type IconName } from './Icon';
import { T } from './Text';

const icons: Record<string, IconName> = { explore: 'search', trips: 'trips', you: 'person' };
const labels: Record<string, string> = { explore: 'Explore', trips: 'Trips', you: 'You' };

/** Three tabs. Hairline top border, no tint. Filled icon only for the selected tab. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useInsets();
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        backgroundColor: colors.light.bg,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.light.line,
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 12),
      }}
    >
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const color = focused ? colors.light.ink : colors.light.inkSecondary;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={labels[route.name]}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                haptics.tapLight();
                navigation.navigate(route.name);
              }
            }}
            style={{ flex: 1, alignItems: 'center', gap: 4 }}
          >
            <Icon name={icons[route.name] ?? 'search'} size={26} color={color} filled={focused} strokeWidth={focused ? 2 : 1.5} />
            <T variant={focused ? 'tabStrong' : 'tab'} style={{ color }}>{labels[route.name] ?? route.name}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

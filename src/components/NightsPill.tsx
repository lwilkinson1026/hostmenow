import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming, Easing } from 'react-native-reanimated';

import { plural } from '@/lib/dates';
import { haptics } from '@/services';
import { colors, radius } from '@/theme';
import { PressScale } from './PressScale';
import { T } from './Text';

const pillStyle = {
  height: 36,
  paddingHorizontal: 14,
  borderRadius: radius.pill,
  backgroundColor: colors.light.bgSubtle,
  alignItems: 'center',
  justifyContent: 'center',
} as const;

/** "5 nights". Always visible, never shouted. Taps through to the Nights bank. */
export function NightsPill({ count }: { count: number }) {
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={`${plural(count, 'night')} in your bank`}
      onPress={() => {
        haptics.tapLight();
        router.push('/nights');
      }}
      style={pillStyle}
    >
      <T variant="calloutStrong">{plural(count, 'night')}</T>
    </PressScale>
  );
}

/** Confirmed screen: the old count lifts away and the new one settles in. */
export function NightsPillChange({ from, to }: { from: number; to: number }) {
  const out = useSharedValue(0);
  const inn = useSharedValue(from === to ? 1 : 0);
  useEffect(() => {
    if (from === to) return;
    out.value = withDelay(1100, withTiming(1, { duration: 500, easing: Easing.in(Easing.ease) }));
    inn.value = withDelay(1400, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }));
  }, [from, to, out, inn]);
  const outStyle = useAnimatedStyle(() => ({ opacity: 1 - out.value, transform: [{ translateY: -8 * out.value }] }));
  const inStyle = useAnimatedStyle(() => ({ opacity: inn.value, transform: [{ translateY: 8 * (1 - inn.value) }] }));
  const abs = { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' } as const;
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={`${plural(to, 'night')} left`}
      onPress={() => router.push('/nights')}
      style={[pillStyle, { width: 96, paddingHorizontal: 0, overflow: 'hidden' }]}
    >
      <View style={{ height: 20 }} />
      {from !== to && (
        <Animated.View style={[abs, outStyle]}>
          <T variant="calloutStrong">{plural(from, 'night')}</T>
        </Animated.View>
      )}
      <Animated.View style={[abs, inStyle]}>
        <T variant="calloutStrong">{plural(to, 'night')}</T>
      </Animated.View>
    </PressScale>
  );
}

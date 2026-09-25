import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

/** The house curve: quick to start, long soft landing. */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * Fades in and rises a few points, once, after `delay` ms. The one entrance used
 * across the app, so every new thing arrives the same calm way. Reduce Motion: no movement.
 */
export function Reveal({
  children,
  delay = 0,
  rise = 10,
  duration = 700,
  style,
}: {
  children: ReactNode;
  delay?: number;
  rise?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduce = useReducedMotion();
  const t = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) return;
    t.set(withDelay(delay, withTiming(1, { duration, easing: EASE_OUT })));
  }, [delay, duration, reduce, t]);
  const a = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ translateY: rise * (1 - t.value) }] }));
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

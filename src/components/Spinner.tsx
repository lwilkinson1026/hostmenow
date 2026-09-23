import { useEffect } from 'react';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme';
import type { Tone } from './Text';

export function Spinner({ size = 20, tone = 'light', color }: { size?: number; tone?: Tone; color?: string }) {
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(withTiming(360, { duration: 1000, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(rot);
  }, [rot]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  const c = colors[tone];
  return (
    <Animated.View style={[{ width: size, height: size }, style]} accessibilityRole="progressbar">
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={9} stroke={c.line} strokeWidth={2.5} />
        <Path d="M21 12a9 9 0 0 0-9-9" stroke={color ?? (tone === 'dark' ? c.inkSecondary : c.ink)} strokeWidth={2.5} strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

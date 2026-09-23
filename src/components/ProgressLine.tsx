import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

import { colors, size } from '@/theme';

/** 2px line across the top of onboarding. No step numbers. */
export function ProgressLine({ progress }: { progress: number }) {
  const w = useSharedValue(progress);
  useEffect(() => {
    w.value = withTiming(progress, { duration: 600, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
  }, [progress, w]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      style={{ height: size.progress, backgroundColor: colors.dark.line }}
    >
      <Animated.View style={[{ height: size.progress, backgroundColor: colors.dark.ink }, fill]} />
    </View>
  );
}

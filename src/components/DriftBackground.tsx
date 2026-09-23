import { Image, type ImageSource } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { motion } from '@/theme';

type Props = {
  source: ImageSourcePropType | ImageSource;
  /** contentPosition x, in % */
  cropX?: number;
  overlay?: number;
};

/** One photo drifting slowly (Ken Burns, 20s, alternate) under a black overlay. */
export function DriftBackground({ source, cropX = 50, overlay = motion.overlay.default }: Props) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: motion.drift.duration, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(t);
  }, [t]);
  const style = useAnimatedStyle(() => {
    const { fromScale, toScale } = motion.drift;
    return {
      transform: [
        { scale: fromScale + (toScale - fromScale) * t.value },
        { translateX: `${-2.5 * t.value}%` },
        { translateY: `${-1.5 * t.value}%` },
      ],
    };
  });
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, style]}>
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition={{ left: `${cropX}%`, top: '50%' }}
          transition={400}
          accessible={false}
        />
      </Animated.View>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${overlay})` }]} />
    </View>
  );
}

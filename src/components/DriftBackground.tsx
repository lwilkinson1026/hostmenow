import { Image, type ImageSource } from 'expo-image';
import { useEffect, useRef } from 'react';
import { StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { INTRO } from '@/lib/intro';
import { motion } from '@/theme';

type Source = ImageSourcePropType | ImageSource;

type Props = {
  source: Source;
  /** contentPosition x, in % */
  cropX?: number;
  overlay?: number;
  /**
   * Intro: the same shot with the lights off, faded out on `clock` (ms) so the
   * windows light up, while the overlay lifts from dark to `overlay`.
   */
  intro?: { darkSource: Source; clock: SharedValue<number>; onReady: () => void };
};

/** One photo drifting slowly (Ken Burns, 20s, alternate) under a black overlay. */
export function DriftBackground({ source, cropX = 50, overlay = motion.overlay.default, intro }: Props) {
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

  // Start the intro once both photos are ready, so it never plays over a blank screen.
  const loaded = useRef(0);
  const onLoad = () => {
    loaded.current += 1;
    if (intro && loaded.current === 2) intro.onReady();
  };

  const clock = intro?.clock;
  const darkStyle = useAnimatedStyle(() =>
    clock ? { opacity: interpolate(clock.value, [INTRO.lightsStart, INTRO.lightsEnd], [1, 0], 'clamp') } : { opacity: 0 },
  );
  const shadeStyle = useAnimatedStyle(() =>
    clock ? { opacity: interpolate(clock.value, [INTRO.liftStart, INTRO.liftEnd], [INTRO.darkOverlay, overlay], 'clamp') } : { opacity: overlay },
  );

  const imageProps = {
    style: StyleSheet.absoluteFill,
    contentFit: 'cover' as const,
    contentPosition: { left: `${cropX}%` as const, top: '50%' as const },
    accessible: false,
  };

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, style]}>
        <Image source={source} transition={intro ? 0 : 400} onLoad={intro ? onLoad : undefined} {...imageProps} />
        {intro ? (
          <Animated.View style={[StyleSheet.absoluteFill, darkStyle]}>
            <Image source={intro.darkSource} transition={0} onLoad={onLoad} {...imageProps} />
          </Animated.View>
        ) : null}
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }, shadeStyle]} />
    </View>
  );
}

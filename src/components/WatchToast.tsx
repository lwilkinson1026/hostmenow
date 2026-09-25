import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { listings } from '@/data/mock';
import { useInsets } from '@/lib/insets';
import { useDesktop } from '@/lib/layout';
import { firstOpenNight, nightName } from '@/lib/watch';
import { haptics } from '@/services';
import { useApp, useIsOpen } from '@/store/app';
import { colors, radius, shadow } from '@/theme';
import { EASE_OUT } from './Reveal';
import { T } from './Text';

/** Shown once per session: stands in for the push a member gets when a watched home opens. */
let shown = false;

/**
 * "Ski Chalet opened for Saturday." Slides down softly a moment after Explore
 * opens, holds, and lifts away. Tapping it opens the home.
 */
export function WatchToast() {
  const insets = useInsets();
  const desktop = useDesktop();
  const reduce = useReducedMotion();
  const watching = useApp((s) => s.watching);
  const isOpen = useIsOpen();
  const [home] = useState(() => {
    if (shown) return null;
    const l = listings.find((x) => watching.includes(x.id) && firstOpenNight(x, isOpen) !== null);
    return l ? { l, night: firstOpenNight(l, isOpen)! } : null;
  });
  const t = useSharedValue(0);

  useEffect(() => {
    if (!home) return;
    shown = true;
    const d = reduce ? 0 : 1;
    t.set(withDelay(1400, withTiming(1, { duration: 700 * d, easing: EASE_OUT })));
    const out = setTimeout(() => t.set(withTiming(0, { duration: 600 * d, easing: EASE_OUT })), 7400);
    return () => clearTimeout(out);
  }, [home, reduce, t]);

  const a = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ translateY: -16 * (1 - t.value) }] }));
  if (!home) return null;
  const cover = home.l.photos[0];

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[{ position: 'absolute', top: desktop ? 16 : insets.top, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 16, zIndex: 20 }, a]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLiveRegion="polite"
        onPress={() => {
          haptics.tapLight();
          t.set(withTiming(0, { duration: 300 }));
          router.push({ pathname: '/listing/[id]', params: { id: home.l.id } });
        }}
        style={[
          { width: '100%', maxWidth: 420, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, paddingRight: 16, borderRadius: radius.sheet, backgroundColor: colors.light.bg },
          shadow.sheet,
        ]}
      >
        <Image source={cover.src} contentFit="cover" contentPosition={{ left: `${cover.cropX}%`, top: '50%' }} style={{ width: 48, height: 48, borderRadius: 10 }} />
        <View style={{ flex: 1 }}>
          <T variant="calloutStrong">{home.l.name} opened for {nightName(home.night)}.</T>
          <T variant="caption" color="inkSecondary">You're watching it.</T>
        </View>
      </Pressable>
    </Animated.View>
  );
}

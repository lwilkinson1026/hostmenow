import { useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { haptics } from '@/services';
import { useApp } from '@/store/app';
import { colors, radius } from '@/theme';
import { EASE_OUT } from './Reveal';
import { Icon } from './Icon';
import { T } from './Text';

/**
 * Watch this home: we tell the member when it opens within 5 days. The bookmark
 * fills and breathes once when set. `variant="circle"` floats over photography;
 * `variant="text"` sits in the desktop header next to Share.
 */
export function WatchButton({ listingId, variant }: { listingId: string; variant: 'circle' | 'text' }) {
  const watching = useApp((s) => s.watching.includes(listingId));
  const toggleWatch = useApp((s) => s.toggleWatch);
  const reduce = useReducedMotion();
  const scale = useSharedValue(1);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!watching || reduce) return;
    scale.set(withSequence(withTiming(1.22, { duration: 160, easing: EASE_OUT }), withTiming(1, { duration: 520, easing: EASE_OUT })));
  }, [watching, reduce, scale]);

  const a = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPress = () => {
    haptics.tapLight();
    toggleWatch(listingId);
  };
  const label = watching ? 'Watching' : 'Watch';

  if (variant === 'text') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: watching }}
        accessibilityLabel={watching ? 'Stop watching this home' : "Watch this home. We'll tell you when it opens."}
        onPress={onPress}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40 }}
      >
        <Animated.View style={a}>
          <Icon name="bookmark" size={16} filled={watching} />
        </Animated.View>
        <T variant="calloutStrong" style={{ textDecorationLine: 'underline' }}>{label}</T>
      </Pressable>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: watching }}
      accessibilityLabel={watching ? 'Stop watching this home' : "Watch this home. We'll tell you when it opens."}
      hitSlop={6}
      onPress={onPress}
    >
      <View style={{ width: 40, height: 40, borderRadius: radius.pill, backgroundColor: colors.light.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={a}>
          <Icon name="bookmark" size={18} filled={watching} />
        </Animated.View>
      </View>
    </Pressable>
  );
}

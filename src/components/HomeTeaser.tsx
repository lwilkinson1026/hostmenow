import { Image } from 'expo-image';
import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { freeNightsAt, isOpenOn, member, type Listing } from '@/data/mock';
import { addDays, plural, shortRange, today } from '@/lib/dates';
import { money } from '@/lib/pricing';
import { byTravel, travelLabel } from '@/lib/travel';
import { radius } from '@/theme';
import { PressScale } from './PressScale';
import { T } from './Text';

/** Check-in offsets inside the booking window (1 = tomorrow). */
const WINDOW = [1, 2, 3, 4, 5];

export const isOpenThisWeek = (l: Listing) => WINDOW.some((d) => isOpenOn(l, d));

/**
 * The soonest stay at a home: first open night in the window, then up to `max`
 * consecutive open nights. `free` when the member's free nights cover all of it.
 */
export function soonestStay(l: Listing, bank: number, max = 2) {
  const start = WINDOW.find((d) => isOpenOn(l, d));
  if (start === undefined) return null;
  let nights = 1;
  while (nights < max && isOpenOn(l, start + nights)) nights += 1;
  const free = Math.min(nights, freeNightsAt(l, bank));
  if (free > 0) nights = free;
  const checkIn = addDays(today(), start);
  return { start, nights, free: free > 0, checkIn, checkOut: addDays(checkIn, nights) };
}

/** The single best home for a new member: nearest drive that is open this week and free for them. */
export function bestHomeNear(ls: Listing[], bank: number) {
  const open = byTravel(ls).filter(isOpenThisWeek);
  return (
    open.find((l) => l.travel.mode === 'drive' && freeNightsAt(l, bank) > 0) ??
    open.find((l) => l.travel.mode === 'drive') ??
    open[0] ??
    null
  );
}

/** "2 nights, Sep 26 to 28" */
export const stayLabel = (s: NonNullable<ReturnType<typeof soonestStay>>) =>
  `${plural(s.nights, 'night')}, ${shortRange(s.checkIn, s.checkOut)}`;

/** A rounded photo that drifts very slowly (scale only). Still under Reduce Motion. */
export function DriftPhoto({ listing, style, delay = 0 }: { listing: Listing; style?: StyleProp<ViewStyle>; delay?: number }) {
  const reduce = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    t.set(withDelay(delay, withRepeat(withTiming(1, { duration: 24000, easing: Easing.inOut(Easing.ease) }), -1, true)));
    return () => cancelAnimation(t);
  }, [delay, reduce, t]);
  const drift = useAnimatedStyle(() => ({ transform: [{ scale: 1.02 + 0.06 * t.value }] }));
  const cover = listing.photos[0];
  return (
    <View style={[{ borderRadius: radius.card, overflow: 'hidden', backgroundColor: '#1A1A19' }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, drift]}>
        <Image
          source={cover.src}
          accessibilityLabel={cover.alt}
          contentFit="cover"
          contentPosition={{ left: `${cover.cropX}%`, top: '50%' }}
          transition={600}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

/** "Free · cleaning $85" or "$220 $110 night", for dark screens. */
export function DarkPrice({ listing, free, detail }: { listing: Listing; free: boolean; detail?: string }) {
  if (free) {
    const rest = detail ?? `cleaning ${money(listing.cleaning)}`;
    return (
      <T variant="callout" tone="dark" color="inkSecondary" accessibilityLabel={`Free, ${rest}`}>
        <T variant="calloutStrong" tone="dark" color="accent">Free</T> · {rest}
      </T>
    );
  }
  const half = Math.round(listing.retailNight / 2);
  return (
    <View style={{ flexDirection: 'row', gap: 6 }} accessible accessibilityLabel={`${money(half)} a night, was ${money(listing.retailNight)}`}>
      <T variant="callout" tone="dark" color="inkTertiary" style={{ textDecorationLine: 'line-through' }}>
        {money(listing.retailNight)}
      </T>
      <T variant="callout" tone="dark" color="inkSecondary">
        <T variant="calloutStrong" tone="dark">{money(half)}</T> night{detail ? ` · ${detail}` : ''}
      </T>
    </View>
  );
}

type CardProps = {
  listing: Listing;
  free: boolean;
  /** Replaces the cleaning figure after "Free". */
  detail?: string;
  photoStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  driftDelay?: number;
  onPress?: () => void;
  accessibilityHint?: string;
  children?: ReactNode;
};

/** A home on a dark screen: drifting photo, name, travel time, and the price line. */
export function HomeTeaser({ listing, free, detail, photoStyle, style, driftDelay, onPress, accessibilityHint, children }: CardProps) {
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={`${listing.name}, ${travelLabel(listing.travel)} from ${member.homeCity}`}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      scaleTo={0.99}
      style={[{ gap: 14 }, style]}
    >
      <DriftPhoto listing={listing} style={photoStyle} delay={driftDelay} />
      <View style={{ gap: 2 }}>
        <T variant="heading" tone="dark">{listing.name}</T>
        <T variant="callout" tone="dark" color="inkSecondary">
          {travelLabel(listing.travel)} · {listing.region}
        </T>
        <DarkPrice listing={listing} free={free} detail={detail} />
        {children}
      </View>
    </PressScale>
  );
}

/**
 * Full-screen photos that crossfade slowly from one to the next under a black
 * overlay, drifting like DriftBackground. The incoming photo fades in over the
 * outgoing one, so the light never dips. Reduce Motion: no drift, gentler cycle.
 */
export function PhotoCycle({ listings, overlay = 0.8, every = 8000, fade = 2400 }: { listings: Listing[]; overlay?: number; every?: number; fade?: number }) {
  const reduce = useReducedMotion();
  const [at, setAt] = useState({ now: 0, prev: -1 });
  const count = listings.length;
  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => setAt((a) => ({ now: (a.now + 1) % count, prev: a.now })), reduce ? every * 1.5 : every);
    return () => clearInterval(id);
  }, [count, every, reduce]);

  const t = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    t.set(withRepeat(withTiming(1, { duration: 20000, easing: Easing.inOut(Easing.ease) }), -1, true));
    return () => cancelAnimation(t);
  }, [reduce, t]);
  const drift = useAnimatedStyle(() => ({
    transform: [{ scale: 1.04 + 0.1 * t.value }, { translateX: `${-2 * t.value}%` }, { translateY: `${-1.2 * t.value}%` }],
  }));

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, drift]}>
        {listings.map((l, i) => (
          <CycleLayer key={l.id} listing={l} role={i === at.now ? 'on' : i === at.prev ? 'prev' : 'off'} fade={fade} />
        ))}
      </Animated.View>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: overlay }]} />
    </View>
  );
}

function CycleLayer({ listing, role, fade }: { listing: Listing; role: 'on' | 'prev' | 'off'; fade: number }) {
  const o = useSharedValue(role === 'on' ? 1 : 0);
  useEffect(() => {
    if (role === 'on') {
      o.set(withTiming(1, { duration: fade, easing: Easing.inOut(Easing.ease) }));
    } else if (role === 'off') {
      o.set(0);
    }
    // 'prev' holds at full under the incoming photo until it is covered.
  }, [fade, o, role]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  const cover = listing.photos[0];
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { zIndex: role === 'on' ? 2 : role === 'prev' ? 1 : 0 }, style]}>
      <Image
        source={cover.src}
        contentFit="cover"
        contentPosition={{ left: `${cover.cropX}%`, top: '50%' }}
        transition={0}
        accessible={false}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

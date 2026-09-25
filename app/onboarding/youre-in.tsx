import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { PrimaryButton, TextButton } from '@/components/Buttons';
import { DriftBackground } from '@/components/DriftBackground';
import { HomeTeaser, bestHomeNear, soonestStay, stayLabel } from '@/components/HomeTeaser';
import { OnboardingScreen, useTitleTop } from '@/components/Onboarding';
import { EASE_OUT, Reveal } from '@/components/Reveal';
import { T } from '@/components/Text';
import { listings } from '@/data/mock';
import { useApp, useFreeNights } from '@/store/app';
import { colors } from '@/theme';
import { BRAND } from '@/config';
import { useDesktop } from '@/lib/layout';

/** The pace: the line lands, a beat, then the home rises in, then the actions. */
const AT = { title: 150, line: 650, home: 1700, actions: 2500 };

/**
 * B7. You're in. The line lands, then the one home to go to this week rises in:
 * nearest drive, open, free for them. "Book it" cross-fades from dark onboarding
 * to the light app and opens that home; "Start exploring" goes to Explore.
 */
export default function YoureIn() {
  const completeOnboarding = useApp((s) => s.completeOnboarding);
  const bank = useFreeNights();
  const desktop = useDesktop();
  const titleTop = useTitleTop(40);
  const reduce = useReducedMotion();
  const [leaving, setLeaving] = useState(false);

  const home = useMemo(() => bestHomeNear(listings, bank), [bank]);
  const stay = useMemo(() => (home ? soonestStay(home, bank) : null), [home, bank]);

  // The background steps back as the home arrives, so the card's photo leads.
  const hush = useSharedValue(0);
  useEffect(() => {
    if (!home) return;
    hush.set(withDelay(reduce ? 0 : AT.home, withTiming(1, { duration: reduce ? 0 : 1600, easing: EASE_OUT })));
  }, [home, hush, reduce]);
  const hushStyle = useAnimatedStyle(() => ({ opacity: hush.value * 0.55 }));

  const white = useSharedValue(0);
  const fade = useAnimatedStyle(() => ({ opacity: white.value }));

  const go = (to: 'explore' | 'home') => {
    completeOnboarding();
    router.replace('/explore');
    if (to === 'home' && home) router.push({ pathname: '/listing/[id]', params: { id: home.id } });
  };

  const leave = (to: 'explore' | 'home') => {
    if (leaving) return;
    setLeaving(true);
    white.set(
      withTiming(1, { duration: 520, easing: Easing.out(Easing.ease) }, (done) => {
        if (done) runOnJS(go)(to);
      }),
    );
  };

  const background = (
    <>
      <DriftBackground source={require('../../assets/photos/cedar.jpg')} />
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }, hushStyle]} />
    </>
  );

  const headline = (
    <View style={{ gap: 14 }}>
      <Reveal delay={AT.title} duration={1000} rise={12}>
        <T variant="display" tone="dark">5 nights are yours.</T>
      </Reveal>
      <Reveal delay={AT.line} duration={1000}>
        <T tone="dark" color="inkSecondary">Anywhere on {BRAND}, within 5 days of arrival.</T>
      </Reveal>
    </View>
  );

  if (!home || !stay) {
    return (
      <View style={{ flex: 1 }}>
        <OnboardingScreen
          background={background}
          contentStyle={{ justifyContent: 'center' }}
          actions={<PrimaryButton tone="dark" label="Start exploring" onPress={() => leave('explore')} />}
        >
          <View style={{ marginTop: desktop ? 0 : -20 }}>{headline}</View>
        </OnboardingScreen>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.light.bg }, fade]} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <OnboardingScreen
        background={background}
        contentStyle={{ paddingTop: titleTop, paddingBottom: 8 }}
        actions={
          <Reveal delay={AT.actions} duration={900} style={{ gap: 4 }}>
            <PrimaryButton tone="dark" label="Book it" onPress={() => leave('home')} />
            <TextButton tone="dark" color="inkSecondary" label="Start exploring" onPress={() => leave('explore')} />
          </Reveal>
        }
      >
        <View style={{ flex: desktop ? undefined : 1, gap: desktop ? 40 : 28 }}>
          {headline}
          <Reveal delay={AT.home} duration={1400} rise={28} style={desktop ? undefined : { flex: 1 }}>
            <HomeTeaser
              listing={home}
              free={stay.free}
              detail={stayLabel(stay)}
              style={desktop ? undefined : { flex: 1 }}
              photoStyle={desktop ? { width: '100%', aspectRatio: 3 / 2 } : { flex: 1, minHeight: 160, maxHeight: 460 }}
              onPress={() => leave('home')}
              accessibilityHint="Opens this home to book"
            />
          </Reveal>
        </View>
      </OnboardingScreen>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.light.bg }, fade]} />
    </View>
  );
}

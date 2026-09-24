import { Redirect, router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, interpolate, runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useInsets } from '@/lib/insets';

import { DriftBackground } from '@/components/DriftBackground';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/PressScale';
import { Spinner } from '@/components/Spinner';
import { T } from '@/components/Text';
import { TypedWordmark } from '@/components/TypedWordmark';
import { INTRO, introSeen, markIntroSeen } from '@/lib/intro';
import { haptics, invites } from '@/services';
import { useApp } from '@/store/app';
import { backdropIntro, hasWebBackdrop, setBackdrop } from '@/lib/webChrome';
import { colors, motion, radius, type } from '@/theme';

const WIDE = 900;
/** Phone crop of the landing photo: centered on the lit windows. */
const LANDING_CROP_X = 51;

/** A. Locked landing. Wordmark, pitch line, invite code. Nothing else. */
export default function Landing() {
  const isMember = useApp((s) => s.isMember);
  const { width } = useWindowDimensions();
  const insets = useInsets();
  const wide = Platform.OS === 'web' && width >= WIDE;

  const [code, setCode] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [checking, setChecking] = useState(false);
  const input = useRef<TextInput>(null);

  // Intro: the lights come on, the wordmark types, then the tagline and field appear.
  // Once per visit, skipped for Reduce Motion, and a tap anywhere jumps to the end.
  const reduceMotion = useReducedMotion();
  const [skipIntro] = useState(() => introSeen() || reduceMotion);
  const clock = useSharedValue(skipIntro ? INTRO.total : 0);
  const [playing, setPlaying] = useState(!skipIntro);
  const started = useRef(false);
  const finish = useCallback(() => setPlaying(false), []);

  const startIntro = useCallback(() => {
    if (started.current) return;
    started.current = true;
    markIntroSeen();
    if (skipIntro) {
      backdropIntro('done');
      return;
    }
    backdropIntro('play');
    clock.set(withTiming(INTRO.total, { duration: INTRO.total, easing: Easing.linear }));
    // The skip layer goes once the page has settled; the clock runs on for "beta".
    setTimeout(finish, INTRO.settled);
  }, [clock, finish, skipIntro]);

  // Never wait on a photo forever: if loading stalls, start anyway.
  useEffect(() => {
    const t = setTimeout(startIntro, 2500);
    return () => clearTimeout(t);
  }, [startIntro]);

  const skip = () => {
    if (!playing) return;
    backdropIntro('skip');
    clock.set(withTiming(INTRO.total, { duration: INTRO.skip }, (done) => {
      if (done) runOnJS(finish)();
    }));
  };

  const photo = wide
    ? { source: require('../assets/photos/landing.jpg'), overlay: motion.overlay.landingWeb }
    : { source: require('../assets/photos/landing.jpg'), cropX: LANDING_CROP_X, overlay: motion.overlay.landingMobile };
  const darkSource = require('../assets/photos/landing-dark.jpg');

  // On web the photo is pinned behind the whole page so it fills the screen under Safari's bars.
  // Set on every focus: the landing stays mounted underneath other screens.
  useFocusEffect(
    useCallback(() => {
      if (!hasWebBackdrop) return;
      if (!started.current && !skipIntro) backdropIntro('dark');
      setBackdrop({ ...photo, darkSource }).then(startIntro);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wide, startIntro]),
  );

  // Each style reads clock.value directly so the animation library tracks it (and it runs on the UI thread).
  const { taglineAt, taglineSecondAt, fieldAt, fade, betaAt, betaFade } = INTRO;
  // "beta" arrives after everything else has settled.
  const betaStyle = useAnimatedStyle(() => ({
    opacity: interpolate(clock.value, [betaAt, betaAt + betaFade], [0, 1], 'clamp'),
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: interpolate(clock.value, [taglineAt, taglineAt + fade], [0, 1], 'clamp'),
  }));
  const taglineSecondStyle = useAnimatedStyle(() => ({
    opacity: interpolate(clock.value, [taglineSecondAt, taglineSecondAt + fade], [0, 1], 'clamp'),
  }));
  const fieldStyle = useAnimatedStyle(() => ({
    opacity: interpolate(clock.value, [fieldAt, fieldAt + fade], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(clock.value, [fieldAt, fieldAt + fade], [8, 0], 'clamp') }],
  }));

  const x = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const shake = () => {
    const steps = [-1, 3, -6, 6, -6, 6, -6, 3, -1, 0];
    x.set(withSequence(...steps.map((v) => withTiming(v, { duration: 42 }))));
  };

  if (isMember) return <Redirect href="/explore" />;

  const submit = async () => {
    if (checking) return;
    if (!code.trim()) {
      input.current?.focus();
      return;
    }
    haptics.tapLight();
    setChecking(true);
    const ok = await invites.validateCode(code);
    setChecking(false);
    if (ok) {
      setInvalid(false);
      router.push('/onboarding/welcome');
    } else {
      setInvalid(true);
      haptics.warning();
      shake();
    }
  };

  const field = (
    <View style={{ gap: 10 }}>
      <Animated.View
        style={[
          styles.field,
          { borderColor: invalid ? colors.dark.danger : 'rgba(245,245,244,0.22)' },
          shakeStyle,
        ]}
      >
        <TextInput
          ref={input}
          value={code}
          onChangeText={(t) => {
            setCode(t);
            if (invalid) setInvalid(false);
          }}
          onSubmitEditing={submit}
          placeholder="Invite code"
          placeholderTextColor={colors.dark.inkTertiary}
          accessibilityLabel="Invite code"
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          returnKeyType="go"
          keyboardAppearance="dark"
          selectionColor={colors.dark.accent}
          style={[type.body, styles.input]}
        />
        <PressScale accessibilityRole="button" accessibilityLabel="Continue" onPress={submit} style={styles.arrow}>
          {checking ? <Spinner size={18} color={colors.light.ink} /> : <Icon name="arrow-right" size={20} color={colors.light.ink} />}
        </PressScale>
      </Animated.View>
      {invalid ? (
        <T variant="caption" align="center" accessibilityRole="alert" style={{ color: '#F0A097' }}>
          That code isn't valid.
        </T>
      ) : null}
      <Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.push('/learn')} style={{ alignSelf: 'center', paddingVertical: 6 }}>
        <T variant="calloutStrong" tone="dark">Learn more</T>
      </Pressable>
    </View>
  );

  const privacy = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Pressable accessibilityRole="link" hitSlop={8}>
        <T variant="caption" tone="dark" color="inkTertiary">Privacy</T>
      </Pressable>
      <T variant="caption" tone="dark" color="inkTertiary">·</T>
      <Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.push('/hosts')}>
        <T variant="caption" tone="dark" color="inkTertiary">Earn as a Host</T>
      </Pressable>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: hasWebBackdrop ? 'transparent' : colors.dark.bg }}>
      <StatusBar style="light" />
      {hasWebBackdrop ? null : (
        <DriftBackground
          source={photo.source}
          cropX={photo.cropX}
          overlay={photo.overlay}
          intro={{ darkSource, clock, onReady: startIntro }}
        />
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[StyleSheet.absoluteFill, styles.center, { paddingBottom: wide ? 40 : 60, gap: wide ? 20 : 14 }]} pointerEvents="none">
          <View>
            <TypedWordmark size={wide ? 64 : 40} clock={clock} />
            <Animated.View style={[styles.beta, { top: wide ? 8 : 4 }, betaStyle]}>
              <T variant="caption" tone="dark" color="inkSecondary" style={wide ? { fontSize: 15, lineHeight: 20 } : undefined}>
                beta
              </T>
            </Animated.View>
          </View>
          <View accessible accessibilityLabel="5 nights free. 5 days out." style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: wide ? 6 : 5 }}>
            <Animated.View style={taglineStyle}>
              <T tone="dark" color="inkSecondary" style={wide ? { fontSize: 19, lineHeight: 26 } : undefined}>
                5 nights free.
              </T>
            </Animated.View>
            <Animated.View style={taglineSecondStyle}>
              <T tone="dark" color="inkSecondary" style={wide ? { fontSize: 19, lineHeight: 26 } : undefined}>
                5 days out.
              </T>
            </Animated.View>
          </View>
        </View>

        {wide ? (
          <>
            <Animated.View style={[{ position: 'absolute', left: 0, right: 0, bottom: 120, alignItems: 'center' }, fieldStyle]}>
              <View style={{ width: 400 }}>{field}</View>
            </Animated.View>
            <Animated.View style={[{ position: 'absolute', left: 0, right: 0, bottom: 36, alignItems: 'center' }, fieldStyle]}>{privacy}</Animated.View>
          </>
        ) : (
          <Animated.View style={[{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 16) + 24, gap: 22 }, fieldStyle]}>
            {field}
            <View style={{ alignItems: 'center' }}>{privacy}</View>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
      {playing ? (
        // Invisible: a tap anywhere during the intro jumps to the end.
        <Pressable accessibilityLabel="Skip intro" onPress={skip} style={StyleSheet.absoluteFill} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  /** Hangs off the wordmark's top right without shifting its centering. */
  beta: { position: 'absolute', left: '100%', marginLeft: 4 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingLeft: 24,
    paddingRight: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: 'rgba(245,245,244,0.08)',
  },
  input: {
    flex: 1,
    color: colors.dark.ink,
    letterSpacing: 0.68,
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  arrow: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.dark.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

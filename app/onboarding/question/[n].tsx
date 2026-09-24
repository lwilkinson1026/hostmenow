import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { useInsets } from '@/lib/insets';
import { useDesktop } from '@/lib/layout';
import Svg, { Circle } from 'react-native-svg';

import { CameraSurface } from '@/components/CameraSurface';
import { HostIcon } from '@/components/host/HostIcon';
import { LinearGradientBg } from '@/components/Gradient';
import { PressScale } from '@/components/PressScale';
import { T } from '@/components/Text';
import { introQuestions } from '@/data/mock';
import { haptics } from '@/services';
import { colors, radius } from '@/theme';

const SECONDS = 15;
const R = 44;
const C = 2 * Math.PI * R;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Phase = 'ready' | 'recording' | 'recorded';

/** B5 questions. Front camera, countdown ring around the record button, auto-advances. */
export default function Question() {
  const { n: nParam, mode } = useLocalSearchParams<{ n: string; mode?: string }>();
  const n = Math.min(Math.max(Number(nParam) || 1, 1), introQuestions.length);
  const insets = useInsets();
  const desktop = useDesktop();
  const { height: windowHeight } = useWindowDimensions();
  const [phase, setPhase] = useState<Phase>('ready');
  const [left, setLeft] = useState(SECONDS);
  const progress = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ring = useAnimatedProps(() => ({ strokeDasharray: [C * progress.value, C] }));

  const clear = () => {
    if (timer.current) clearInterval(timer.current);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    timer.current = null;
    advanceTimer.current = null;
  };
  useEffect(() => clear, []);

  const next = () => {
    clear();
    if (n < introQuestions.length) {
      router.push(mode ? { pathname: '/onboarding/question/[n]', params: { n: n + 1, mode } } : `/onboarding/question/${n + 1}`);
    } else if (mode === 'rerecord') {
      router.dismissTo('/you');
    } else {
      router.push('/onboarding/pay');
    }
  };

  const stop = () => {
    clear();
    cancelAnimation(progress);
    progress.value = withTiming(1, { duration: 250 });
    setPhase('recorded');
    haptics.tapLight();
    advanceTimer.current = setTimeout(next, 1600);
  };

  const start = () => {
    haptics.tapLight();
    setPhase('recording');
    setLeft(SECONDS);
    progress.value = 0;
    progress.value = withTiming(1, { duration: SECONDS * 1000, easing: Easing.linear });
    const began = Date.now();
    timer.current = setInterval(() => {
      const remaining = SECONDS - Math.floor((Date.now() - began) / 1000);
      setLeft(Math.max(remaining, 0));
      if (remaining <= 0) stop();
    }, 250);
  };

  const retake = () => {
    clear();
    cancelAnimation(progress);
    progress.value = 0;
    setPhase('ready');
  };

  const onButton = phase === 'ready' ? start : phase === 'recording' ? stop : next;
  const buttonLabel = phase === 'ready' ? 'Record answer' : phase === 'recording' ? 'Stop recording' : 'Next question';

  const recordButton = (
    <PressScale accessibilityRole="button" accessibilityLabel={buttonLabel} onPress={onButton} style={{ width: 100, height: 100, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={100} height={100} viewBox="0 0 100 100" style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-90deg' }] }]}>
        <Circle cx={50} cy={50} r={R} fill="none" stroke="rgba(245,245,244,0.28)" strokeWidth={4} />
        <AnimatedCircle cx={50} cy={50} r={R} fill="none" stroke={colors.dark.ink} strokeWidth={4} strokeLinecap="round" animatedProps={ring} />
      </Svg>
      {phase === 'recording' ? (
        <View style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: colors.dark.ink }} />
      ) : (
        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: colors.dark.ink }} />
      )}
    </PressScale>
  );
  const underButton = (
    <View style={{ minHeight: 44, justifyContent: 'center' }}>
      {phase === 'ready' ? (
        <T variant="caption" tone="dark" color="inkSecondary">15 seconds</T>
      ) : phase === 'recording' ? (
        <T variant="calloutStrong" tone="dark" style={{ fontVariant: ['tabular-nums'] }}>{`0:${String(left).padStart(2, '0')}`}</T>
      ) : (
        <Pressable accessibilityRole="button" onPress={retake} hitSlop={8} style={{ minHeight: 44, justifyContent: 'center' }}>
          <T variant="calloutStrong" tone="dark">Retake</T>
        </Pressable>
      )}
    </View>
  );
  const close = (style: object) =>
    mode === 'rerecord' ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        hitSlop={8}
        onPress={() => {
          clear();
          router.dismissTo('/you');
        }}
        style={[{ position: 'absolute', width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, style]}
      >
        <HostIcon name="close" size={18} color={colors.dark.ink} />
      </Pressable>
    ) : null;

  if (desktop) {
    // Desktop: the question, a 9:16 camera tile and the record button, centered over the onboarding photo.
    const tileHeight = Math.min(Math.max(windowHeight - 400, 320), 540);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 48 }}>
        <StatusBar style="light" />
        <View style={{ width: '100%', maxWidth: 680, alignItems: 'center' }}>
          <T variant="title" tone="dark" align="center">{introQuestions[n - 1]}</T>
          <View style={{ marginTop: 32, height: tileHeight, aspectRatio: 9 / 16, borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.dark.bg }}>
            <CameraSurface facing="front" />
          </View>
          <View style={{ marginTop: 24, alignItems: 'center', gap: 10 }}>
            {recordButton}
            {underButton}
          </View>
        </View>
        {close({ right: 24, top: 24 })}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.dark.bg }}>
      <StatusBar style="light" />
      <CameraSurface facing="front" />
      <View style={[styles.fade, { top: 0, height: 280 }]}>
        <LinearGradientBg from="#000000" to="#000000" fromOpacity={0.7} toOpacity={0} />
      </View>
      <View style={[styles.fade, { bottom: 0, height: 260 }]}>
        <LinearGradientBg from="#000000" to="#000000" fromOpacity={0} toOpacity={0.6} />
      </View>

      <T
        variant="heading"
        tone="dark"
        style={{ position: 'absolute', left: 24, right: mode === 'rerecord' ? 72 : 24, top: insets.top + 25, fontSize: 24, lineHeight: 30 }}
      >
        {introQuestions[n - 1]}
      </T>
      {close({ right: 16, top: insets.top + 16 })}

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(insets.bottom, 16) + 14, alignItems: 'center', gap: 10 }}>
        {recordButton}
        {underButton}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fade: { position: 'absolute', left: 0, right: 0 },
});

import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { PrimaryButton } from '@/components/Buttons';
import { DriftBackground } from '@/components/DriftBackground';
import { OnboardingScreen } from '@/components/Onboarding';
import { T } from '@/components/Text';
import { useApp } from '@/store/app';
import { colors } from '@/theme';
import { BRAND } from '@/config';

/** B7. You're in. "Start exploring" cross-fades from dark onboarding to the light app. */
export default function YoureIn() {
  const completeOnboarding = useApp((s) => s.completeOnboarding);
  const [leaving, setLeaving] = useState(false);
  const white = useSharedValue(0);
  const fade = useAnimatedStyle(() => ({ opacity: white.value }));

  const enter = () => {
    completeOnboarding();
    router.replace('/explore');
  };

  const start = () => {
    if (leaving) return;
    setLeaving(true);
    white.set(
      withTiming(1, { duration: 450, easing: Easing.out(Easing.ease) }, (done) => {
      if (done) runOnJS(enter)();
    }),
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <OnboardingScreen
        background={<DriftBackground source={require('../../assets/photos/cedar.jpg')} />}
        contentStyle={{ justifyContent: 'center' }}
        actions={<PrimaryButton tone="dark" label="Start exploring" onPress={start} />}
      >
        <View style={{ gap: 14, marginTop: -20 }}>
          <T variant="display" tone="dark">5 nights are yours.</T>
          <T tone="dark" color="inkSecondary">Anywhere on {BRAND}, within 5 days of arrival.</T>
        </View>
      </OnboardingScreen>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.light.bg }, fade]} />
    </View>
  );
}

import { Stack, useGlobalSearchParams, useSegments } from 'expo-router';
import { View } from 'react-native';
import { useInsets } from '@/lib/insets';
import { useDesktop } from '@/lib/layout';

import { DriftBackground } from '@/components/DriftBackground';
import { ProgressLine } from '@/components/ProgressLine';
import { colors, motion } from '@/theme';

const STEPS: Record<string, number> = {
  welcome: 1,
  'sign-in': 2,
  'id-scan': 3,
  selfie: 4,
  'house-rules': 5,
  'say-hello': 6,
  question: 6, // + n
  pay: 10,
  'youre-in': 11,
};
const TOTAL = 11;
/** Desktop: the photo sits under every step, darker than the welcome so text stays calm. */
const DESKTOP_OVERLAY = 0.78;

/** Dark stack with a 2px progress line that fills between steps. */
export default function OnboardingLayout() {
  const segments = useSegments() as string[];
  const { n, mode } = useGlobalSearchParams<{ n?: string; mode?: string }>();
  const insets = useInsets();
  const desktop = useDesktop();
  const leaf = segments[1] ?? 'welcome';
  const step = (STEPS[leaf] ?? 1) + (leaf === 'question' ? Number(n ?? 1) : 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.dark.bg }}>
      {desktop ? <DriftBackground source={require('../../assets/photos/landing.jpg')} overlay={DESKTOP_OVERLAY} /> : null}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: motion.step.duration,
          contentStyle: { backgroundColor: desktop ? 'transparent' : colors.dark.bg },
        }}
      >
        <Stack.Screen name="welcome" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="id-scan" />
        <Stack.Screen name="selfie" />
        <Stack.Screen name="house-rules" />
        <Stack.Screen name="say-hello" />
        <Stack.Screen name="question/[n]" options={{ gestureEnabled: false }} />
        <Stack.Screen name="pay" />
        <Stack.Screen name="youre-in" options={{ gestureEnabled: false }} />
      </Stack>
      {mode ? null : (
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: desktop ? 0 : Math.max(insets.top - 9, 12) }}>
          <ProgressLine progress={step / TOTAL} />
        </View>
      )}
    </View>
  );
}

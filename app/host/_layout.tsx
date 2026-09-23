import { Stack } from 'expo-router';

import { hs } from '@/components/host/HostUI';
import { motion } from '@/theme';

/** Host opt-in, as it would appear inside the Hostshare app. */
export default function HostLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: motion.step.duration,
        contentStyle: { backgroundColor: hs.card },
      }}
    >
      <Stack.Screen name="index" options={{ contentStyle: { backgroundColor: hs.page } }} />
      <Stack.Screen name="value" />
      <Stack.Screen name="listings" />
      <Stack.Screen name="guests" />
      <Stack.Screen name="payouts" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="live" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

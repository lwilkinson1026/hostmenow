import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useInsets } from '@/lib/insets';

import { colors } from '@/theme';

/** The top offset where onboarding titles sit (design: 128 on a 59pt status bar). */
export const useTitleTop = (offset = 70) => useInsets().top + offset;

type Props = {
  background?: ReactNode;
  children?: ReactNode;
  /** Bottom actions, pinned 50 from the bottom edge. */
  actions?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

/** Dark, full-screen onboarding step: one question or action per screen. */
export function OnboardingScreen({ background, children, actions, contentStyle }: Props) {
  const insets = useInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.dark.bg }}>
      <StatusBar style="light" />
      {background}
      <View style={[{ flex: 1, paddingHorizontal: 24 }, contentStyle]}>{children}</View>
      {actions ? <View style={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 16) + 16, gap: 12 }}>{actions}</View> : null}
    </View>
  );
}

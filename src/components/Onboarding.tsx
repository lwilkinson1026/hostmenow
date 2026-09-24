import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useInsets } from '@/lib/insets';
import { useDesktop } from '@/lib/layout';

import { colors } from '@/theme';

/** Width of the centered onboarding column on desktop web. */
export const ONBOARDING_COLUMN = 480;

/**
 * The top offset where onboarding titles sit (design: 128 on a 59pt status bar).
 * On desktop the content is vertically centered instead, so there is no offset.
 */
export const useTitleTop = (offset = 70) => {
  const top = useInsets().top + offset;
  return useDesktop() ? 0 : top;
};

type Props = {
  background?: ReactNode;
  children?: ReactNode;
  /** Bottom actions, pinned 50 from the bottom edge. On desktop they follow the content. */
  actions?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  /** Desktop only: style for the centered column (replaces contentStyle there). */
  desktopStyle?: StyleProp<ViewStyle>;
};

/**
 * Dark, full-screen onboarding step: one question or action per screen.
 * On desktop web the screen is see-through (the onboarding layout paints the
 * drifting photo), and the content and actions sit together in a centered column.
 */
export function OnboardingScreen({ background, children, actions, contentStyle, desktopStyle }: Props) {
  const insets = useInsets();
  const desktop = useDesktop();
  if (desktop) {
    return (
      <View style={{ flex: 1, backgroundColor: background ? colors.dark.bg : 'transparent' }}>
        <StatusBar style="light" />
        {background}
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 40, paddingVertical: 72 }}>
          <View style={[{ width: '100%', maxWidth: ONBOARDING_COLUMN, alignSelf: 'center' }, desktopStyle]}>
            {children}
            {actions ? <View style={{ marginTop: 48, gap: 12 }}>{actions}</View> : null}
          </View>
        </View>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.dark.bg }}>
      <StatusBar style="light" />
      {background}
      <View style={[{ flex: 1, paddingHorizontal: 24 }, contentStyle]}>{children}</View>
      {actions ? <View style={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 16) + 16, gap: 12 }}>{actions}</View> : null}
    </View>
  );
}

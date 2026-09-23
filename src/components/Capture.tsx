import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useInsets } from '@/lib/insets';

import { haptics, identity } from '@/services';
import { colors } from '@/theme';
import { CameraSurface } from './CameraSurface';
import { OnboardingScreen, useTitleTop } from './Onboarding';
import { T } from './Text';

const AUTO_CAPTURE_MS = 2600;

type Props = {
  title: string;
  kind: 'id' | 'selfie';
  guide: ReactNode;
  guideLabel: string;
  guideTop: number;
  hint: string;
  status: string;
  onCaptured: () => void;
};

/** B3. Camera with a guide. Captures on its own, or on tap. */
export function CaptureStep({ title, kind, guide, guideLabel, guideTop, hint, status, onCaptured }: Props) {
  const top = useTitleTop(26);
  const insets = useInsets();
  const done = useRef(false);

  const capture = async () => {
    if (done.current) return;
    done.current = true;
    haptics.tapLight();
    await identity.submitCapture(kind);
    onCaptured();
  };

  // Re-arm on every focus, so going back to this step captures again.
  useFocusEffect(
    useCallback(() => {
      done.current = false;
      const t = setTimeout(capture, AUTO_CAPTURE_MS);
      return () => clearTimeout(t);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <OnboardingScreen background={<CameraSurface facing={kind === 'id' ? 'back' : 'front'} />} contentStyle={{ paddingHorizontal: 0 }}>
      <T variant="title" tone="dark" style={{ position: 'absolute', left: 24, right: 24, top }}>{title}</T>
      <View style={{ position: 'absolute', top: top + guideTop, left: 0, right: 0, alignItems: 'center' }}>
        <Pressable accessibilityRole="button" accessibilityLabel={guideLabel} onPress={capture}>
          {guide}
        </Pressable>
        <T variant="callout" tone="dark" color="inkSecondary" align="center" style={{ marginTop: 28, marginHorizontal: 40 }}>
          {hint}
        </T>
      </View>
      <View style={[styles.status, { bottom: Math.max(insets.bottom, 16) + 30 }]}>
        <View style={styles.dot} />
        <T variant="caption" tone="dark" color="inkSecondary">{status}</T>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  status: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.dark.ink },
});

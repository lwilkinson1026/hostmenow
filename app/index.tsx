import { Redirect, router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useInsets } from '@/lib/insets';

import { DriftBackground } from '@/components/DriftBackground';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/PressScale';
import { Spinner } from '@/components/Spinner';
import { T, Wordmark } from '@/components/Text';
import { haptics, invites } from '@/services';
import { useApp } from '@/store/app';
import { hasWebBackdrop, setBackdrop } from '@/lib/webChrome';
import { colors, motion, radius, type } from '@/theme';

const WIDE = 900;

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

  // On web the photo is pinned behind the whole page so it fills the screen under Safari's bars.
  // Set on every focus: the landing stays mounted underneath other screens.
  useFocusEffect(
    useCallback(() => {
      if (!hasWebBackdrop) return;
      setBackdrop(
        wide
          ? { source: require('../assets/photos/landing-web.jpg'), overlay: motion.overlay.landingWeb }
          : { source: require('../assets/photos/landing-mobile.jpg'), cropX: 36, overlay: motion.overlay.landingMobile },
      );
    }, [wide]),
  );

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
      <Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.push('/host')}>
        <T variant="caption" tone="dark" color="inkTertiary">Hostshare Hosts click here</T>
      </Pressable>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: hasWebBackdrop ? 'transparent' : colors.dark.bg }}>
      <StatusBar style="light" />
      {hasWebBackdrop ? null : wide ? (
        <DriftBackground source={require('../assets/photos/landing-web.jpg')} overlay={motion.overlay.landingWeb} />
      ) : (
        <DriftBackground source={require('../assets/photos/landing-mobile.jpg')} cropX={36} overlay={motion.overlay.landingMobile} />
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[StyleSheet.absoluteFill, styles.center, { paddingBottom: wide ? 40 : 60, gap: wide ? 20 : 14 }]} pointerEvents="none">
          <Wordmark size={wide ? 64 : 40} tone="dark" />
          <T tone="dark" color="inkSecondary" style={wide ? { fontSize: 19, lineHeight: 26 } : undefined}>
            5 nights free. 5 days out.
          </T>
        </View>

        {wide ? (
          <>
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 120, alignItems: 'center' }}>
              <View style={{ width: 400 }}>{field}</View>
            </View>
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 36, alignItems: 'center' }}>{privacy}</View>
          </>
        ) : (
          <View style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 16) + 24, gap: 22 }}>
            {field}
            <View style={{ alignItems: 'center' }}>{privacy}</View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
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

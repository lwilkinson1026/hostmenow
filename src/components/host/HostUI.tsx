import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';
import { Pressable, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { PressScale } from '@/components/PressScale';
import { Spinner } from '@/components/Spinner';
import { T } from '@/components/Text';
import { useInsets } from '@/lib/insets';
import { haptics } from '@/services';
import { colors, radius } from '@/theme';
import { HostIcon } from './HostIcon';

/** Hostshare surface colors from the opt-in designs. */
export const hs = {
  page: '#FAFAF9',
  card: '#FFFFFF',
  ink: colors.light.ink,
  secondary: colors.light.inkSecondary,
  tertiary: colors.light.inkTertiary,
  line: colors.light.line,
  subtle: colors.light.bgSubtle,
  muted: '#D6D3D1',
  accent: colors.light.accent,
  accentText: '#7A6A53',
};

const close = () => router.dismissTo('/preview/hostshare');

/** Back, small wordmark, close, and a 2px progress line. */
export function HostStepHeader({ progress, showBack = true }: { progress: number; showBack?: boolean }) {
  const w = useSharedValue(progress);
  useEffect(() => {
    w.value = withTiming(progress, { duration: 600, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
  }, [progress, w]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View>
      <View style={{ height: 44, marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => (router.canGoBack() ? router.back() : close())}
          style={{ width: 44, height: 44, justifyContent: 'center', opacity: showBack ? 1 : 0 }}
          disabled={!showBack}
        >
          <HostIcon name="back" size={20} />
        </Pressable>
        <T variant="calloutStrong" style={{ letterSpacing: -0.3 }}>hostmenow</T>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={close} style={{ width: 44, height: 44, alignItems: 'flex-end', justifyContent: 'center' }}>
          <HostIcon name="close" size={18} />
        </Pressable>
      </View>
      <View style={{ height: 2, backgroundColor: hs.line, borderRadius: radius.pill, overflow: 'hidden' }}>
        <Animated.View style={[{ height: 2, backgroundColor: hs.ink }, fill]} />
      </View>
    </View>
  );
}

/** White step screen: header, scrolling body, pinned actions. */
export function HostStep({ progress, children, actions, showBack }: { progress: number; children: ReactNode; actions: ReactNode; showBack?: boolean }) {
  const insets = useInsets();
  return (
    <View style={{ flex: 1, backgroundColor: hs.card, paddingTop: insets.top - 8 }}>
      <StatusBar style="dark" />
      <View style={{ paddingHorizontal: 24 }}>
        <HostStepHeader progress={progress} showBack={showBack} />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        {children}
      </ScrollView>
      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 16) + 16, gap: 14 }}>{actions}</View>
    </View>
  );
}

type ButtonProps = { label: string; onPress?: () => void; disabled?: boolean; loading?: boolean; style?: StyleProp<ViewStyle> };

export function HostButton({ label, onPress, disabled, loading, style }: ButtonProps) {
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      onPress={() => {
        haptics.tapLight();
        onPress?.();
      }}
      style={[
        { height: 56, borderRadius: radius.pill, backgroundColor: disabled ? hs.line : hs.ink, alignItems: 'center', justifyContent: 'center' },
        style,
      ]}
    >
      {loading ? <Spinner color="#FFFFFF" tone="dark" /> : <T variant="bodyStrong" style={{ color: disabled ? hs.secondary : '#FFFFFF' }}>{label}</T>}
    </PressScale>
  );
}

export function HostTextButton({ label, onPress, loading }: ButtonProps) {
  return (
    <PressScale accessibilityRole="button" disabled={loading} onPress={onPress} style={{ height: 48, alignItems: 'center', justifyContent: 'center' }}>
      {loading ? <Spinner /> : <T variant="bodyStrong">{label}</T>}
    </PressScale>
  );
}

/** 48 x 28 switch from the Hostshare designs. */
export function HostSwitch({ value, onChange, disabled, label }: { value: boolean; onChange?: (v: boolean) => void; disabled?: boolean; label: string }) {
  const x = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    x.value = withTiming(value ? 1 : 0, { duration: 150 });
  }, [value, x]);
  const track = useAnimatedStyle(() => ({ backgroundColor: x.value > 0.5 ? hs.ink : hs.muted }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * 20 }] }));
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={() => {
        haptics.tapLight();
        onChange?.(!value);
      }}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <Animated.View style={[{ width: 48, height: 28, borderRadius: 14, padding: 3 }, track]}>
        <Animated.View
          style={[{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }, knob]}
        />
      </Animated.View>
    </Pressable>
  );
}

/** Two-option pill toggle. */
export function HostSegmented<V extends string>({
  options,
  value,
  onChange,
  small,
}: {
  options: { value: V; label: string }[];
  value: V;
  onChange: (v: V) => void;
  small?: boolean;
}) {
  return (
    <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: 2, padding: 3, backgroundColor: hs.subtle, borderRadius: radius.pill }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => {
              if (!on) haptics.tapLight();
              onChange(o.value);
            }}
            style={{
              flex: 1,
              paddingVertical: small ? 9 : 10,
              paddingHorizontal: 6,
              borderRadius: radius.pill,
              alignItems: 'center',
              backgroundColor: on ? '#FFFFFF' : 'transparent',
              boxShadow: on ? '0 1px 3px rgba(0,0,0,0.08)' : undefined,
            }}
          >
            <T variant={small ? (on ? 'captionStrong' : 'caption') : on ? 'calloutStrong' : 'callout'} style={{ color: on ? hs.ink : hs.secondary }}>
              {o.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

export const money0 = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

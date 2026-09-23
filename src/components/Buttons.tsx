import { View, type StyleProp, type ViewStyle } from 'react-native';

import { haptics } from '@/services';
import { colors, radius, size } from '@/theme';
import { PressScale } from './PressScale';
import { Spinner } from './Spinner';
import { T, type Tone } from './Text';

type Common = {
  label: string;
  onPress?: () => void;
  tone?: Tone;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** 56 tall pill. Ink fill with white label, inverted on dark. One per screen. */
export function PrimaryButton({ label, onPress, tone = 'light', loading, disabled, style, accessibilityLabel }: Common) {
  const c = colors[tone];
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      onPress={() => {
        haptics.tapLight();
        onPress?.();
      }}
      style={[
        { height: size.button, borderRadius: radius.pill, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      {loading ? <Spinner tone={tone === 'dark' ? 'light' : 'dark'} color={c.onInk} /> : <T variant="bodyStrong" style={{ color: c.onInk }}>{label}</T>}
    </PressScale>
  );
}

/** Outline pill, used for the second sign-in option. */
export function OutlineButton({ label, onPress, tone = 'light', loading, style }: Common) {
  const c = colors[tone];
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={loading}
      onPress={() => {
        haptics.tapLight();
        onPress?.();
      }}
      style={[
        { height: size.button, borderRadius: radius.pill, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' },
        style,
      ]}
    >
      {loading ? <Spinner tone={tone} /> : <T variant="bodyStrong" tone={tone}>{label}</T>}
    </PressScale>
  );
}

/** Ink Body Semibold, 48 tall hit area. */
export function TextButton({ label, onPress, tone = 'light', loading, style, color }: Common & { color?: string }) {
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={loading}
      onPress={onPress}
      style={[{ height: 48, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      {loading ? <Spinner tone={tone} /> : <T variant="bodyStrong" tone={tone} color={color ?? 'ink'}>{label}</T>}
    </PressScale>
  );
}

/** Apple Pay: black on light screens, white on dark screens. */
export function PayButton({ onPress, tone = 'light', loading, disabled, style }: Omit<Common, 'label'>) {
  const bg = tone === 'dark' ? '#FFFFFF' : '#000000';
  const fg = tone === 'dark' ? '#000000' : '#FFFFFF';
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel="Pay with Apple Pay"
      accessibilityState={{ busy: !!loading, disabled: !!disabled }}
      disabled={loading || disabled}
      onPress={() => {
        haptics.tapLight();
        onPress?.();
      }}
      style={[
        { height: size.button, borderRadius: radius.pill, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      {loading ? (
        <Spinner color={fg} tone={tone === 'dark' ? 'light' : 'dark'} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <T variant="bodyStrong" style={{ color: fg, fontSize: 19, letterSpacing: -0.19 }}>Apple Pay</T>
        </View>
      )}
    </PressScale>
  );
}

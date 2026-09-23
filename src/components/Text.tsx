import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { colors, type } from '@/theme';

export type Variant = Exclude<keyof typeof type, 'wordmark'>;
export type Tone = 'light' | 'dark';

type Props = TextProps & {
  variant?: Variant;
  tone?: Tone;
  color?: 'ink' | 'inkSecondary' | 'inkTertiary' | 'accent' | 'danger' | 'onInk' | (string & {});
  align?: TextStyle['textAlign'];
};

export function T({ variant = 'body', tone = 'light', color = 'ink', align, style, ...rest }: Props) {
  const palette = colors[tone] as Record<string, string>;
  return (
    <RNText
      {...rest}
      style={[type[variant] as TextStyle, { color: palette[color] ?? color, textAlign: align }, style]}
    />
  );
}

export function Wordmark({ size = 22, tone = 'light', style }: { size?: number; tone?: Tone; style?: TextStyle }) {
  return (
    <RNText
      accessibilityRole="header"
      style={[type.wordmark(size) as TextStyle, { color: colors[tone].ink, lineHeight: Math.round(size * 1.15) }, style]}
    >
      hostmenow
    </RNText>
  );
}

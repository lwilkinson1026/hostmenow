// hostmenow design tokens (spec v0.1)
import { Platform } from 'react-native';

export const colors = {
  light: {
    bg: '#FFFFFF',
    bgSubtle: '#F5F5F4',
    ink: '#111111',
    inkSecondary: '#6B6B6B',
    inkTertiary: '#A3A3A3',
    line: '#E7E5E4',
    accent: '#8A7A63', // open decision: #7A6B55 passes AA for small text
    danger: '#B42318',
    onInk: '#FFFFFF',
  },
  dark: {
    bg: '#0B0B0B',
    bgSubtle: 'rgba(245,245,244,0.08)',
    ink: '#F5F5F4',
    inkSecondary: '#A8A8A6',
    inkTertiary: '#8E8E8C',
    line: 'rgba(245,245,244,0.16)',
    accent: '#8A7A63',
    danger: '#E5776C', // lighter tint so errors stay legible on dark
    onInk: '#111111',
  },
} as const;

const family = Platform.select({
  ios: { regular: 'System', semibold: 'System' },
  default: { regular: 'Inter_400Regular', semibold: 'Inter_600SemiBold' },
})!;

const t = (size: number, lh: number, weight: '400' | '600', trackingPct = 0) => ({
  fontFamily: weight === '600' ? family.semibold : family.regular,
  fontWeight: weight,
  fontSize: size,
  lineHeight: lh,
  letterSpacing: (size * trackingPct) / 100,
});

export const type = {
  display: t(40, 44, '600', -2),
  title: t(28, 34, '600', -1),
  heading: t(20, 26, '600'),
  body: t(17, 24, '400'),
  bodyStrong: t(17, 24, '600'),
  callout: t(15, 20, '400'),
  calloutStrong: t(15, 20, '600'),
  caption: t(13, 18, '400'),
  captionStrong: t(13, 18, '600'),
  tab: t(11, 13, '400'),
  tabStrong: t(11, 13, '600'),
  wordmark: (size = 22) => t(size, size, '600', -2),
} as const;

export const space = { xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48, margin: 24 } as const;

export const radius = { card: 12, sheet: 20, pill: 999 } as const;

export const size = {
  button: 56,
  chip: 56,
  tabBar: 84,
  avatar: { list: 40, profile: 64 },
  hairline: 0.5,
  progress: 2,
} as const;

export const shadow = {
  // the only shadow in the system
  sheet: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
} as const;

export const motion = {
  step: { duration: 350, damping: 30, stiffness: 260, overshootClamping: true },
  sheet: { duration: 300 },
  pressScale: 0.97,
  drift: { duration: 20000, fromScale: 1.04, toScale: 1.16 },
  overlay: { default: 0.6, landingMobile: 0.4, landingWeb: 0.45 },
} as const;

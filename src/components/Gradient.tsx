import { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

/** Soft radial dark gradient: the camera placeholder on simulator and web. */
export function RadialGradientBg({ from = '#2A2927', to = '#121211' }: { from?: string; to?: string }) {
  const id = `rg${useId().replace(/:/g, '')}`;
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none" pointerEvents="none">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="45%" rx="60%" ry="40%" fx="50%" fy="45%">
          <Stop offset="0" stopColor={from} />
          <Stop offset="1" stopColor={to} />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

/** Vertical fade, used for the soft dark gradients behind camera copy. */
export function LinearGradientBg({ from, to, fromOpacity = 1, toOpacity = 1 }: { from: string; to: string; fromOpacity?: number; toOpacity?: number }) {
  const id = `lg${useId().replace(/:/g, '')}`;
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none" pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={from} stopOpacity={fromOpacity} />
          <Stop offset="1" stopColor={to} stopOpacity={toOpacity} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

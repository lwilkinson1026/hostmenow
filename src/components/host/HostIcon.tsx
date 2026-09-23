import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

export type HostIconName = 'back' | 'close' | 'split' | 'coins' | 'calendar-check' | 'check' | 'bank' | 'check-bold' | 'home' | 'calendar' | 'pin' | 'inbox' | 'house';

/** Icons from the Hostshare opt-in designs. */
export function HostIcon({ name, size = 24, color = '#111111' }: { name: HostIconName; size?: number; color?: string }) {
  const s = { stroke: color, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  switch (name) {
    case 'back':
      return (
        <Svg width={size} height={size} viewBox="0 0 20 20">
          <Path d="M12.5 4.5 7 10l5.5 5.5" {...s} strokeWidth={1.6} />
        </Svg>
      );
    case 'close':
      return (
        <Svg width={size} height={size} viewBox="0 0 18 18">
          <Path d="M4 4l10 10M14 4 4 14" {...s} strokeWidth={1.6} />
        </Svg>
      );
    case 'split':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx={12} cy={12} r={8.5} {...s} />
          <Path d="M12 3.5v17" {...s} />
          <Path d="M12 3.5a8.5 8.5 0 0 1 0 17Z" fill={color} />
        </Svg>
      );
    case 'coins':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Ellipse cx={12} cy={7} rx={7} ry={3} {...s} />
          <Path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" {...s} />
        </Svg>
      );
    case 'calendar-check':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x={3.5} y={5} width={17} height={15} rx={2} {...s} />
          <Path d="M3.5 10h17M8 3v4M16 3v4" {...s} />
          <Path d="m9 15 2 2 4-4" {...s} />
        </Svg>
      );
    case 'check':
      return (
        <Svg width={size} height={size} viewBox="0 0 20 20">
          <Path d="m5 10.5 3 3 7-7" {...s} strokeWidth={1.6} />
        </Svg>
      );
    case 'check-bold':
      return (
        <Svg width={size} height={size} viewBox="0 0 26 26">
          <Path d="m7 13.5 4 4 8-9" {...s} strokeWidth={2} />
        </Svg>
      );
    case 'bank':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M3.5 9.5 12 4l8.5 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3.5 20h17" {...s} />
        </Svg>
      );
    case 'house':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 11 12 4.5l8 6.5v8.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V11Z" {...s} />
        </Svg>
      );
    case 'home':
      return (
        <Svg width={size} height={size} viewBox="0 0 22 22">
          <Path d="M3.5 10 11 4l7.5 6v8a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-8Z" {...s} />
        </Svg>
      );
    case 'calendar':
      return (
        <Svg width={size} height={size} viewBox="0 0 22 22">
          <Rect x={3.5} y={5} width={15} height={13} rx={2} {...s} />
          <Path d="M3.5 9h15M8 3v4M14 3v4" {...s} />
        </Svg>
      );
    case 'pin':
      return (
        <Svg width={size} height={size} viewBox="0 0 22 22">
          <Path d="M11 19s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" {...s} />
          <Circle cx={11} cy={9} r={2} {...s} />
        </Svg>
      );
    case 'inbox':
      return (
        <Svg width={size} height={size} viewBox="0 0 22 22">
          <Path d="M4 5.5h14v9H8l-4 3v-12Z" {...s} />
        </Svg>
      );
  }
}

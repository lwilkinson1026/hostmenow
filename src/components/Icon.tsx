import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Platform } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'search'
  | 'trips'
  | 'person'
  | 'chevron-right'
  | 'chevron-left'
  | 'share'
  | 'plus'
  | 'minus'
  | 'lock'
  | 'pin'
  | 'message'
  | 'play'
  | 'arrow-right'
  | 'guests'
  | 'bed'
  | 'bath'
  | 'wifi'
  | 'kitchen'
  | 'flame'
  | 'car'
  | 'washer'
  | 'mountain'
  | 'waves'
  | 'snowflake'
  | 'tree';

const sf: Record<IconName, SFSymbol> = {
  search: 'magnifyingglass',
  trips: 'suitcase',
  person: 'person',
  'chevron-right': 'chevron.right',
  'chevron-left': 'chevron.left',
  share: 'square.and.arrow.up',
  plus: 'plus',
  minus: 'minus',
  lock: 'lock',
  pin: 'mappin',
  message: 'message',
  play: 'play.fill',
  'arrow-right': 'arrow.right',
  guests: 'person.2',
  bed: 'bed.double',
  bath: 'bathtub',
  wifi: 'wifi',
  kitchen: 'fork.knife',
  flame: 'flame',
  car: 'car',
  washer: 'washer',
  mountain: 'mountain.2',
  waves: 'water.waves',
  snowflake: 'snowflake',
  tree: 'tree',
};

const filledSf: Partial<Record<IconName, SFSymbol>> = {
  trips: 'suitcase.fill',
  person: 'person.fill',
};

/** 24-unit outline paths from the approved designs, used off iOS. */
function Paths({ name, color, filled }: { name: IconName; color: string; filled: boolean }) {
  const fillFor = filled ? color : 'none';
  switch (name) {
    case 'search':
      return (
        <>
          <Circle cx={11} cy={11} r={7} />
          <Path d="M16.5 16.5L21 21" />
        </>
      );
    case 'trips':
      return (
        <>
          <Rect x={3} y={7} width={18} height={13} rx={2} fill={fillFor} />
          <Path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </>
      );
    case 'person':
      return (
        <>
          <Circle cx={12} cy={8} r={4} fill={fillFor} />
          <Path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" fill={fillFor} />
        </>
      );
    case 'chevron-right':
      return <Path d="M9 5l7 7-7 7" />;
    case 'chevron-left':
      return <Path d="M15 5l-7 7 7 7" />;
    case 'share':
      return <Path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />;
    case 'plus':
      return <Path d="M12 5v14M5 12h14" />;
    case 'minus':
      return <Path d="M5 12h14" />;
    case 'lock':
      return (
        <>
          <Rect x={5} y={11} width={14} height={10} rx={2} />
          <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </>
      );
    case 'pin':
      return (
        <>
          <Path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" fill="#FFFFFF" />
          <Circle cx={12} cy={10} r={2.5} />
        </>
      );
    case 'message':
      return <Path d="M4 5h16v11H9l-5 4z" />;
    case 'play':
      return <Path d="M7 4.5v15l13-7.5z" fill={color} stroke="none" />;
    case 'arrow-right':
      return <Path d="M5 12h14M13 6l6 6-6 6" />;
    case 'guests':
      return (
        <>
          <Circle cx={9} cy={8} r={3.5} />
          <Path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.6 3.5 2.6 3.5 6" />
        </>
      );
    case 'bed':
      return (
        <>
          <Path d="M3 18V6M3 14h18v4M21 14v-3a3 3 0 0 0-3-3h-7v6" />
          <Circle cx={7} cy={11} r={1.8} />
        </>
      );
    case 'bath':
      return <Path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V6a2 2 0 0 1 3.5-1.3M7 19l-1 2M17 19l1 2" />;
    case 'wifi':
      return (
        <>
          <Path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" />
          <Circle cx={12} cy={19.5} r={0.6} />
        </>
      );
    case 'kitchen':
      return <Path d="M7 3v18M4 3v5a3 3 0 0 0 6 0V3M17 21V3c-2.5 1-4 3.5-4 7h4" />;
    case 'flame':
      return <Path d="M12 21c-3.6 0-6-2.6-6-6 0-4 4-6 4-11 3 2 8 5 8 11 0 3.4-2.4 6-6 6z" />;
    case 'car':
      return (
        <>
          <Path d="M5 17h14M3 17v-4l2-5h14l2 5v4" />
          <Circle cx={7} cy={17} r={2} />
          <Circle cx={17} cy={17} r={2} />
        </>
      );
    case 'washer':
      return (
        <>
          <Rect x={4} y={3} width={16} height={18} rx={2} />
          <Circle cx={12} cy={13} r={4} />
          <Path d="M7 6.5h1" />
        </>
      );
    case 'mountain':
      return <Path d="M3 19l6-9 4 5 3-4 5 8z" />;
    case 'waves':
      return <Path d="M2 9c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M2 15c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0" />;
    case 'snowflake':
      return <Path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M9 4l3 2 3-2M9 20l3-2 3 2" />;
    case 'tree':
      return <Path d="M12 22v-6M12 3c-3.3 0-6 2.7-6 6 0 3.3 2.7 7 6 7s6-3.7 6-7c0-3.3-2.7-6-6-6z" />;
  }
}

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  /** Filled variant, only for the selected tab. */
  filled?: boolean;
  strokeWidth?: number;
};

export function Icon({ name, size = 24, color = '#111111', filled = false, strokeWidth = 1.5 }: Props) {
  if (Platform.OS === 'ios') {
    const symbol = (filled && filledSf[name]) || sf[name];
    return (
      <SymbolView
        name={symbol}
        size={size}
        tintColor={color}
        weight={filled || strokeWidth > 1.5 ? 'medium' : 'light'}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Paths name={name} color={color} filled={filled} />
    </Svg>
  );
}

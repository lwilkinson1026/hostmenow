import { View } from 'react-native';

import { radius } from '@/theme';
import { LinearGradientBg } from './Gradient';
import { Icon } from './Icon';
import { PressScale } from './PressScale';
import { T } from './Text';

/** 9:16, radius 12, play glyph centered. */
export function VideoTile({ width = 108, duration = '0:45', onPress }: { width?: number; duration?: string; onPress?: () => void }) {
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel="Play your intro video"
      onPress={onPress}
      style={{ width, aspectRatio: 9 / 16, borderRadius: radius.card, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}
    >
      <LinearGradientBg from="#3A3835" to="#151514" />
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="play" size={16} color="#111111" />
      </View>
      <T variant="caption" style={{ position: 'absolute', left: 10, bottom: 8, color: '#FFFFFF' }}>{duration}</T>
    </PressScale>
  );
}


import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';

import { colors, radius } from '@/theme';
import { Icon } from './Icon';

/** The monochrome map illustration from the designs. */
export function MapArt({ style }: { style?: ViewStyle }) {
  return (
    <Svg style={[StyleSheet.absoluteFill, style]} width="100%" height="100%" viewBox="0 0 393 470" preserveAspectRatio="xMidYMid slice" pointerEvents="none">
      <Rect width={393} height={470} fill="#EEEEEC" />
      <Path d="M0 0 H38 C30 60 44 110 30 160 C20 200 34 250 60 300 C80 340 96 380 132 420 C150 440 160 460 164 470 H0Z" fill="#DCDCDA" />
      <Path d="M120 60 C150 50 170 80 160 110 C150 130 120 120 118 96Z M300 300 C330 290 350 320 330 340 C312 352 296 330 300 300Z" fill="#E4E4E1" />
      <Path d="M250 20 C258 40 262 60 258 90" stroke="#DCDCDA" strokeWidth={8} fill="none" strokeLinecap="round" />
      <G stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round">
        <Path d="M50 150 C120 140 180 150 240 120 C300 90 340 100 393 90" />
        <Path d="M190 0 C196 120 204 240 250 470" />
        <Path d="M60 300 C140 280 220 300 393 260" />
      </G>
      <G stroke="#FFFFFF" strokeWidth={2} fill="none">
        <Path d="M0 220 C100 230 200 210 393 200" />
        <Path d="M120 0 C130 150 110 300 150 470" />
        <Path d="M320 0 C310 160 330 320 300 470" />
        <Path d="M40 60 C120 70 220 40 393 40" />
      </G>
    </Svg>
  );
}

/**
 * Static monochrome map. "area" draws the approximate circle used before booking;
 * "pin" marks the exact address on a trip.
 */
export function StaticMap({ height, marker }: { height: number; marker: 'area' | 'pin' }) {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={marker === 'area' ? 'Map of the approximate area' : 'Map of the address'}
      style={{ height, borderRadius: radius.card, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}
    >
      <MapArt />
      {marker === 'area' ? (
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(17,17,17,0.08)',
            borderWidth: 1.5,
            borderColor: colors.light.ink,
          }}
        />
      ) : (
        <View style={{ marginTop: -14 }}>
          <Icon name="pin" size={28} />
        </View>
      )}
    </View>
  );
}

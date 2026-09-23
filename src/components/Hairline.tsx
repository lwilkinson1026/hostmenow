import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme';
import type { Tone } from './Text';

export function Hairline({ tone = 'light', style }: { tone?: Tone; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors[tone].line }, style]} />;
}

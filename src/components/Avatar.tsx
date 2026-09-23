import { View } from 'react-native';

import { colors } from '@/theme';
import { T, type Tone } from './Text';

type Props = { initials?: string | null; size?: 40 | 64; tone?: Tone; pending?: boolean };

export function Avatar({ initials, size = 40, tone = 'light', pending }: Props) {
  if (pending) {
    return (
      <View
        accessible={false}
        style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.light.inkTertiary }}
      />
    );
  }
  return (
    <View
      accessible={false}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: tone === 'dark' ? 'rgba(245,245,244,0.14)' : colors.light.bgSubtle,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <T variant={size === 64 ? 'heading' : 'calloutStrong'} tone={tone} style={size === 64 ? { fontSize: 22 } : undefined}>
        {initials}
      </T>
    </View>
  );
}

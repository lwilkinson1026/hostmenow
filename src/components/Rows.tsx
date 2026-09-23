import { StyleSheet, View } from 'react-native';

import { colors, type } from '@/theme';
import { T } from './Text';

/** Hairline-separated money row, as in the booking breakdown and receipt. */
export function LineItem({ label, value, strong, pad = 10 }: { label: string; value: string; strong?: boolean; pad?: number }) {
  return (
    <View
      style={[
        { flexDirection: 'row', justifyContent: 'space-between' },
        strong
          ? { paddingTop: pad + 2 }
          : { paddingVertical: pad, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.light.line },
      ]}
    >
      <T variant={strong ? 'bodyStrong' : 'callout'}>{label}</T>
      <T variant={strong ? 'bodyStrong' : 'callout'} style={{ fontVariant: ['tabular-nums'] }}>{value}</T>
    </View>
  );
}

export const tabular = { fontVariant: ['tabular-nums'] as const, ...type.callout };

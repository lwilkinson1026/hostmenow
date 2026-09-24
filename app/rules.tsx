import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useInsets } from '@/lib/insets';

import { NavHeader } from '@/components/NavHeader';
import { T } from '@/components/Text';
import { useColumn, useDesktop } from '@/lib/layout';
import { houseRules } from '@/data/mock';
import { colors } from '@/theme';

/** The member house rules, from You. */
export default function Rules() {
  const insets = useInsets();
  const desktop = useDesktop();
  const column = useColumn(640);
  return (
    <View style={{ flex: 1, backgroundColor: colors.light.bg }}>
      <View style={[{ flex: 1, paddingTop: desktop ? 24 : insets.top - 5, paddingHorizontal: 24 }, column]}>
      <StatusBar style="dark" />
      <NavHeader />
      <T variant="title" style={{ marginTop: 32 }}>The house rules.</T>
      <View style={{ marginTop: 24, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.light.line }}>
        {houseRules.map((r) => (
          <T key={r} style={{ paddingVertical: 18, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.light.line }}>
            {r}
          </T>
        ))}
      </View>
      </View>
    </View>
  );
}

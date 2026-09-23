import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useInsets } from '@/lib/insets';

import { NavHeader } from '@/components/NavHeader';
import { T } from '@/components/Text';
import { houseRules } from '@/data/mock';
import { colors } from '@/theme';

/** The member house rules, from You. */
export default function Rules() {
  const insets = useInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.light.bg, paddingTop: insets.top - 5, paddingHorizontal: 24 }}>
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
  );
}

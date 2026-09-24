import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { HostIcon, type HostIconName } from '@/components/host/HostIcon';
import { EstimateFlow } from '@/components/host/EstimateFlow';
import { HostButton, HostStep, hs } from '@/components/host/HostUI';
import { T } from '@/components/Text';
import { hostPrefill } from '@/store/host';

const points: { icon: HostIconName; title: string; body: string }[] = [
  { icon: 'split', title: 'Half-price stays', body: 'Members pay 50% of your rate. You keep 88%.' },
  { icon: 'coins', title: 'A share of every membership', body: 'Paid to you each quarter for the members you host and the nights you open.' },
  { icon: 'calendar-check', title: 'Only last-minute nights', body: 'Members book within 5 days of arrival, after your regular guests have had their chance.' },
  { icon: 'sharing', title: 'Counts toward your sharing', body: 'Free member stays count toward the nights you share on Hostshare.' },
];

/** 2. The estimate and three value points. */
export default function Value() {
  return (
    <HostStep
      progress={1 / 6}
      actions={
        <>
          <T variant="caption" color="inkSecondary" align="center">Your Hostshare travel doesn't change.</T>
          <HostButton label="Choose listings" onPress={() => router.push('/preview/hostshare/listings')} />
        </>
      }
    >
      <T variant="bodyStrong" style={{ marginTop: 40, fontSize: 34, lineHeight: 38, letterSpacing: -1 }}>
        Earn on nights that would sit empty.
      </T>
      <View style={{ marginTop: 28 }}>
        {/* The host's own numbers, prefilled; "Adjust" opens the three questions. */}
        <EstimateFlow embedded startAtResult initial={hostPrefill()} />
      </View>
      <View style={{ marginTop: 16 }}>
        {points.map((p, i) => (
          <View key={p.title} style={[styles.point, i < points.length - 1 && styles.divider]}>
            <HostIcon name={p.icon} />
            <View style={{ flex: 1, gap: 2 }}>
              <T variant="bodyStrong">{p.title}</T>
              <T variant="callout" color="inkSecondary">{p.body}</T>
            </View>
          </View>
        ))}
      </View>
    </HostStep>
  );
}

const styles = StyleSheet.create({
  point: { flexDirection: 'row', gap: 16, paddingVertical: 18 },
  divider: { borderBottomWidth: 1, borderBottomColor: hs.line },
});

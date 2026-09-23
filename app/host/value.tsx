import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { HostIcon, type HostIconName } from '@/components/host/HostIcon';
import { HostButton, HostStep, hs, money0 } from '@/components/host/HostUI';
import { T } from '@/components/Text';
import { hostListings } from '@/data/host';
import { roundTo } from '@/lib/pool';
import { listingEstimate } from '@/store/host';

const points: { icon: HostIconName; title: string; body: string }[] = [
  { icon: 'split', title: 'Half-price stays', body: 'Members pay 50% of your rate. You keep 88%.' },
  { icon: 'coins', title: 'A share of every membership', body: 'Paid to you each quarter for the members you host and the nights you open.' },
  { icon: 'calendar-check', title: 'Only last-minute nights', body: 'Members book within 5 days of arrival, after your regular guests have had their chance.' },
];

/** 2. The estimate and three value points. */
export default function Value() {
  const eligible = hostListings.filter((l) => l.eligible);
  const total = roundTo(eligible.reduce((s, l) => s + listingEstimate(l.id, 'both'), 0), 100);
  return (
    <HostStep
      progress={1 / 6}
      actions={
        <>
          <T variant="caption" color="inkSecondary" align="center">Your Hostshare travel doesn't change.</T>
          <HostButton label="Choose listings" onPress={() => router.push('/host/listings')} />
        </>
      }
    >
      <T variant="bodyStrong" style={{ marginTop: 40, fontSize: 34, lineHeight: 38, letterSpacing: -1 }}>
        Earn on nights that would sit empty.
      </T>
      <View style={styles.estimate}>
        <T variant="caption" color="inkSecondary">Your estimate</T>
        <T variant="bodyStrong" style={{ fontSize: 36, lineHeight: 40, letterSpacing: -1.1 }}>
          {money0(total)}
          <T color="inkSecondary"> a year</T>
        </T>
        <T variant="caption" color="inkSecondary">{eligible.length} listings, based on your rates and open nights</T>
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
  estimate: { marginTop: 28, padding: 20, gap: 2, backgroundColor: hs.subtle, borderRadius: 16 },
  point: { flexDirection: 'row', gap: 16, paddingVertical: 18 },
  divider: { borderBottomWidth: 1, borderBottomColor: hs.line },
});

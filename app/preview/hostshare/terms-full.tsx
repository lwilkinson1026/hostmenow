import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { HostIcon } from '@/components/host/HostIcon';
import { hs } from '@/components/host/HostUI';
import { T } from '@/components/Text';
import { useInsets } from '@/lib/insets';
import { BRAND } from '@/config';

/** Plain-language host terms. Placeholder for the legal document; the rules here are the decided ones. */
const sections: { title: string; body: string[] }[] = [
  {
    title: 'Joining',
    body: [
      `You choose which listings join ${BRAND}, and whether each one takes paid and free stays or paid stays only. Only the primary host of a listing can opt it in.`,
      'A listing needs last-minute availability turned on in your Hostshare Share Settings before it can join.',
      "Pause a listing any time and reopen it whenever you like. There's no minimum number of nights. A paused listing takes no new member bookings and earns no pool income until you reopen it.",
      'You can also leave any time. Stays already booked still happen, whether you pause or leave.',
    ],
  },
  {
    title: 'When members book',
    body: [
      'Members only book nights within 5 days of check-in, and only nights still open to Hostshare travelers at that point. Your regular guests and Hostshare travelers always get their chance first.',
      "Booking follows your Hostshare setting, instant book or approve requests. You can watch a member's video intro once they book, but you can't decline a member based on their photo or video.",
    ],
  },
  {
    title: "How you're paid",
    body: [
      `Paid stays are 50% of your nightly rate. ${BRAND} keeps 15% of that and you receive the rest with your Hostshare payouts. Cleaning fees are yours on every stay, free or paid. Card fees of 2.9% come out of your stay and cleaning payouts, never out of pool shares.`,
      `Nearly half of every membership goes to hosts. Each quarter, 45% of membership revenue, plus a quarter of what ${BRAND} keeps on paid stays, is shared among hosts based on the free member nights you host and the nights you make available. It is paid 15 days after the quarter ends. Amounts under $25 roll forward. Estimates aren't guaranteed.`,
      'Pool payouts are reported on a 1099.',
    ],
  },
  {
    title: 'Share nights',
    body: [
      "Each free night a member stays counts toward the nights you share on Hostshare, the same as a Hostshare traveler's stay, at your listing's earn rate on the day it was booked. It counts once the stay is complete, including when a member doesn't show up.",
      "Paid member nights don't count toward your share nights, because you're paid for them.",
      'On Starter and Starter+, free member stays earn you travel nights in your Hostshare Wallet instead of a pool share.',
    ],
  },
  {
    title: 'Cancellations',
    body: [
      'If a member cancels a free stay, it no longer counts toward your share nights.',
      `If you cancel a confirmed member stay, it doesn't count toward your share nights, your pool share goes down, and Hostshare's $100 host cancellation fee applies. The fee goes into the ${BRAND} pool.`,
    ],
  },
];

export default function HostTermsFull() {
  const insets = useInsets();
  return (
    <View style={{ flex: 1, backgroundColor: hs.card }}>
      <StatusBar style="dark" />
      <View style={[styles.bar, { marginTop: Platform.OS === 'ios' ? 0 : 8 }]}>
        <T variant="calloutStrong">Host Terms</T>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/preview/hostshare/terms'))}
          style={styles.close}
        >
          <HostIcon name="close" size={18} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 32 }}>
        <T variant="title" style={{ marginTop: 20 }}>{BRAND} Host Terms</T>
        {sections.map((s) => (
          <View key={s.title} style={styles.section}>
            <T variant="heading">{s.title}</T>
            {s.body.map((p) => (
              <T key={p} variant="callout" style={{ lineHeight: 22 }}>{p}</T>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderBottomWidth: 1, borderBottomColor: hs.line },
  close: { position: 'absolute', right: 16, bottom: 6, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  section: { gap: 10, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: hs.line },
});

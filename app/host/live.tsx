import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { HostIcon } from '@/components/host/HostIcon';
import { HostButton, HostTextButton, hs } from '@/components/host/HostUI';
import { T } from '@/components/Text';
import { pastGuests } from '@/data/host';
import { useInsets } from '@/lib/insets';
import { haptics, invites } from '@/services';
import { invitesLeft, useHost } from '@/store/host';
import { BRAND } from '@/config';

/** 7. Live, with 5 host invites and suggested past guests. */
export default function Live() {
  const insets = useInsets();
  const s = useHost();
  const [sharing, setSharing] = useState(false);
  const count = s.rows.filter((r) => r.on).length;
  const left = invitesLeft(s);

  const share = async () => {
    setSharing(true);
    const r = await invites.shareInviteLink();
    setSharing(false);
    if (r.shared) {
      haptics.success();
      s.shareLink();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: hs.card, paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        <View style={{ height: 2, backgroundColor: hs.ink, borderRadius: 999, marginTop: 8 }} />
        <View style={{ gap: 12, marginTop: 40 }}>
          <View style={styles.check}>
            <HostIcon name="check-bold" size={26} color="#FFFFFF" />
          </View>
          <T variant="bodyStrong" style={{ marginTop: 8, fontSize: 34, lineHeight: 38, letterSpacing: -1 }}>
            {count} {count === 1 ? 'listing is' : 'listings are'} live on {BRAND}.
          </T>
          <T variant="callout" color="inkSecondary" style={{ lineHeight: 21 }}>
            Members can now book any night that's still open 5 days out. We'll let you know when they do.
          </T>
        </View>
        <View style={styles.invites}>
          <T variant="heading">You have {left} {left === 1 ? 'invite' : 'invites'}.</T>
          <T variant="callout" color="inkSecondary">Send them to guests you'd happily host again.</T>
        </View>
        <View style={{ marginTop: 8 }}>
          {pastGuests.map((g) => {
            const sent = s.invited.includes(g.id);
            return (
              <View key={g.id} style={styles.guest}>
                <View style={styles.avatar}>
                  <T variant="calloutStrong" style={{ fontSize: 14 }}>{g.name[0]}</T>
                </View>
                <View style={{ flex: 1, gap: 1 }}>
                  <T variant="calloutStrong">{g.name}</T>
                  <T variant="caption" color="inkSecondary">{g.meta}</T>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={sent ? `${g.name} invited` : `Invite ${g.name}`}
                  disabled={sent || left === 0}
                  onPress={() => {
                    haptics.tapLight();
                    s.invite(g.id);
                  }}
                  style={[styles.invite, sent ? styles.invited : null, !sent && left === 0 ? { opacity: 0.4 } : null]}
                >
                  <T variant="captionStrong" style={{ color: sent ? hs.secondary : hs.ink }}>{sent ? 'Invited' : 'Invite'}</T>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 16) + 16, gap: 8 }}>
        <HostButton label="Share an invite link" disabled={left === 0} loading={sharing} onPress={share} />
        <HostTextButton label="Done" onPress={() => router.dismissTo('/host')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  check: { width: 56, height: 56, borderRadius: 28, backgroundColor: hs.ink, alignItems: 'center', justifyContent: 'center' },
  invites: { marginTop: 32, paddingTop: 24, borderTopWidth: 1, borderTopColor: hs.line, gap: 4 },
  guest: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: hs.line },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: hs.line, alignItems: 'center', justifyContent: 'center' },
  invite: { borderRadius: 999, paddingVertical: 9, paddingHorizontal: 16, borderWidth: 1, borderColor: hs.ink, backgroundColor: hs.card },
  invited: { borderColor: hs.line, backgroundColor: hs.subtle },
});

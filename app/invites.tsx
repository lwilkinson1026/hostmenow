import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useInsets } from '@/lib/insets';

import { Avatar } from '@/components/Avatar';
import { PrimaryButton, TextButton } from '@/components/Buttons';
import { NavHeader } from '@/components/NavHeader';
import { T } from '@/components/Text';
import { SEAT_RULES } from '@/config';
import { member, type HostReferral } from '@/data/mock';
import { plural } from '@/lib/dates';
import { useColumn, useDesktop } from '@/lib/layout';
import { haptics, invites } from '@/services';
import { referralSeats, useApp, useInvitesLeft } from '@/store/app';
import { colors } from '@/theme';

function hostLine(r: HostReferral, daysAhead: number) {
  if (r.liveDaysAgo === null) return r.status ?? 'Invited';
  const seat = referralSeats(r, daysAhead);
  const homes = `${plural(r.homes, 'home')} live`;
  if (seat.mine === 0) return homes;
  return seat.open
    ? `${homes} · opened ${plural(seat.mine, 'invite')} for you`
    : `${homes} · ${plural(seat.mine, 'invite')} in ${plural(seat.daysLeft ?? 0, 'day')}`;
}

/** K. Invites. Invites come from hosts the member brings, so members never outgrow the homes. */
export default function Invites() {
  const insets = useInsets();
  const desktop = useDesktop();
  const column = useColumn(640);
  const { sentInvites, sendInvite, hostReferrals, sendHostInvite, referralDaysAhead } = useApp();
  const invitesLeft = useInvitesLeft();
  const [sharing, setSharing] = useState<'member' | 'host' | null>(null);

  const share = async () => {
    setSharing('member');
    const r = await invites.shareInviteLink();
    setSharing(null);
    if (r.shared) {
      haptics.success();
      sendInvite();
    }
  };

  const shareHost = async () => {
    setSharing('host');
    const r = await invites.shareHostLink(member.initials.toLowerCase());
    setSharing(null);
    if (r.shared) {
      haptics.success();
      sendHostInvite();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.light.bg }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[{ paddingTop: desktop ? 24 : insets.top - 5, paddingHorizontal: 24, paddingBottom: desktop ? 80 : 40 }, column]}>
        <NavHeader />
        <T variant="display" style={{ marginTop: 32 }}>Invite someone good.</T>
        <T color="inkSecondary" style={{ marginTop: 14 }}>
          {invitesLeft > 0 ? `You have ${plural(invitesLeft, 'invite')}. You're vouching for them.` : 'Bring a host to open more invites.'}
        </T>
        <PrimaryButton style={[{ marginTop: 32 }, desktop && styles.buttonDesktop]} label="Send an invite" loading={sharing === 'member'} disabled={invitesLeft === 0} onPress={share} />

        <T variant="calloutStrong" color="inkSecondary" style={{ marginTop: 48 }}>Sent</T>
        <View style={styles.list}>
          {sentInvites.map((inv, i) => (
            <View key={`${inv.status}-${i}`} style={styles.row}>
              <Avatar initials={inv.initials} pending={!inv.name} />
              <View style={{ flex: 1 }}>
                <T>{inv.name ?? 'Pending'}</T>
                <T variant="caption" color="inkSecondary">{inv.status}</T>
              </View>
            </View>
          ))}
        </View>

        <T variant="calloutStrong" color="inkSecondary" style={{ marginTop: 48 }}>Hosts you brought</T>
        <T variant="callout" color="inkSecondary" style={{ marginTop: 8 }}>
          Every home that joins opens {SEAT_RULES.membersPerListing} memberships: one for you, one for the host, one for the waitlist. They open after
          the home has been live {SEAT_RULES.liveDaysToOpen} days.
        </T>
        <View style={styles.list}>
          {hostReferrals.map((r) => (
            <View key={r.id} style={styles.row}>
              <Avatar initials={r.initials} pending={!r.name} />
              <View style={{ flex: 1 }}>
                <T>{r.name ?? 'Pending'}</T>
                <T variant="caption" color="inkSecondary">{hostLine(r, referralDaysAhead)}</T>
              </View>
            </View>
          ))}
        </View>
        <TextButton style={{ alignSelf: 'flex-start', marginTop: 8 }} label="Invite a host" loading={sharing === 'host'} onPress={shareHost} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonDesktop: { alignSelf: 'flex-start', width: 360 },
  list: { marginTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.light.line },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.light.line,
  },
});

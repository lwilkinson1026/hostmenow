import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useInsets } from '@/lib/insets';

import { Avatar } from '@/components/Avatar';
import { PrimaryButton } from '@/components/Buttons';
import { NavHeader } from '@/components/NavHeader';
import { T } from '@/components/Text';
import { plural } from '@/lib/dates';
import { haptics, invites } from '@/services';
import { useApp } from '@/store/app';
import { colors } from '@/theme';

/** K. Invites. */
export default function Invites() {
  const insets = useInsets();
  const { invitesLeft, sentInvites, sendInvite } = useApp();
  const [sharing, setSharing] = useState(false);

  const share = async () => {
    setSharing(true);
    const r = await invites.shareInviteLink();
    setSharing(false);
    if (r.shared) {
      haptics.success();
      sendInvite();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.light.bg }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top - 5, paddingHorizontal: 24, paddingBottom: 40 }}>
        <NavHeader />
        <T variant="display" style={{ marginTop: 32 }}>Invite someone good.</T>
        <T color="inkSecondary" style={{ marginTop: 14 }}>
          {invitesLeft > 0 ? `You have ${plural(invitesLeft, 'invite')}. You're vouching for them.` : "You've used your invites for this year."}
        </T>
        <PrimaryButton style={{ marginTop: 32 }} label="Send an invite" loading={sharing} disabled={invitesLeft === 0} onPress={share} />
        <T variant="calloutStrong" color="inkSecondary" style={{ marginTop: 48 }}>Sent</T>
        <View style={{ marginTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.light.line }}>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.light.line,
  },
});

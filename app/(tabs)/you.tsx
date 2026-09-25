import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useInsets } from '@/lib/insets';

import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { T } from '@/components/Text';
import { VideoTile } from '@/components/VideoTile';
import { cardLabel, member } from '@/data/mock';
import { MEMBERSHIP_MONTHLY } from '@/config';
import { monthDay, monthYear, nextMonthly, plural } from '@/lib/dates';
import { useColumn, useDesktop } from '@/lib/layout';
import { auth, haptics } from '@/services';
import { useApp, useBankedNights, useInvitesLeft } from '@/store/app';
import { colors, radius } from '@/theme';

type RowProps = { label: string; value?: string; href?: Href; onPress?: () => void; first?: boolean; chevron?: boolean };

function Row({ label, value, href, onPress, first, chevron = true }: RowProps) {
  const desktop = useDesktop();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      onPress={() => {
        if (href) router.push(href);
        onPress?.();
      }}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.row,
        !first && styles.rowDivider,
        desktop && hovered && !pressed && { backgroundColor: colors.light.line + '80' },
        pressed && { backgroundColor: colors.light.line },
      ]}
    >
      <T style={{ flex: 1 }}>{label}</T>
      {value ? <T variant="callout" color="inkSecondary">{value}</T> : null}
      {chevron ? <Icon name="chevron-right" size={18} color={colors.light.inkTertiary} /> : null}
    </Pressable>
  );
}

/** I. You. */
export default function You() {
  const insets = useInsets();
  const desktop = useDesktop();
  const column = useColumn(640);
  const nights = useBankedNights();
  const { membership, signOut, agent, watching } = useApp();
  const invitesLeft = useInvitesLeft();

  const doSignOut = async () => {
    haptics.tapLight();
    await auth.signOut();
    signOut();
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.light.bg }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[{ paddingTop: desktop ? 56 : insets.top + 39, paddingHorizontal: 24, paddingBottom: desktop ? 80 : 32, gap: 24 }, column]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Avatar size={64} initials={member.initials} />
          <View style={{ gap: 2 }}>
            <T variant="title" accessibilityRole="header">{member.name}</T>
            <T variant="caption" color="inkSecondary">Member since {monthYear(member.memberSince)}</T>
            <T variant="caption" color="inkSecondary">Invited by {member.invitedBy.name}</T>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-end' }}>
          <VideoTile />
          <View style={{ gap: 4, paddingBottom: 4, flex: 1 }}>
            <T variant="bodyStrong">Your intro</T>
            <T variant="callout" color="inkSecondary">Hosts see this after you book.</T>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/onboarding/question/[n]', params: { n: 1, mode: 'rerecord' } })}
              style={{ minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' }}
            >
              <T variant="bodyStrong">Re-record</T>
            </Pressable>
          </View>
        </View>

        <View style={styles.group}>
          <Row first label="Nights bank" value={plural(nights, 'night')} href="/nights" />
          <Row label="Watching" value={watching.length ? plural(watching.length, 'home') : undefined} href="/watching" />
          <Row label="Invites" value={`${invitesLeft} left`} href="/invites" />
          <Row label="Connect your bot" value={agent.client ? `${agent.client} connected` : agent.keyLast4 ? 'Waiting' : 'Off'} href="/agent" />
          <Row
            label="Membership"
            value={membership === 'paused' ? 'Paused' : `$${MEMBERSHIP_MONTHLY} a month · renews ${monthDay(nextMonthly(member.joined))}`}
            onPress={() =>
              membership === 'paused'
                ? router.push({ pathname: '/onboarding/pay', params: { mode: 'resume' } })
                : router.push('/membership')
            }
            chevron
          />
        </View>
        <View style={styles.group}>
          <Row first label="Payment method" value={cardLabel(member.card)} />
          <Row label="House rules" href="/rules" />
          <Row label="Help" />
        </View>
        <View style={styles.group}>
          <Row first label="Sign out" chevron={false} onPress={doSignOut} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { borderRadius: radius.card, backgroundColor: colors.light.bgSubtle, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 52, paddingHorizontal: 16 },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.light.line },
});

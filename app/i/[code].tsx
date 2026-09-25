import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { PrimaryButton } from '@/components/Buttons';
import { LinearGradientBg } from '@/components/Gradient';
import { HomeTeaser, PhotoCycle, isOpenThisWeek } from '@/components/HomeTeaser';
import { Reveal } from '@/components/Reveal';
import { T, Wordmark } from '@/components/Text';
import { freeNightsAt, listings, MAGIC_BAD_CODE, member } from '@/data/mock';
import { useInsets } from '@/lib/insets';
import { useDesktop } from '@/lib/layout';
import { byTravel } from '@/lib/travel';
import { useApp } from '@/store/app';
import { colors } from '@/theme';

/** Free nights a new member starts with, for the preview's price lines. */
const STARTING_NIGHTS = member.nightGrants.reduce((n, g) => n + g.nights, 0);

/** The pace of the entrance: title, line, then the homes one after another, then the action. */
const AT = { title: 150, line: 700, homes: 1200, stagger: 240, action: 2000 };

/**
 * The personal invite. Before anything is asked of them, an invitee sees who asked
 * them in and the real homes open near them this week. Booking opens when they join.
 */
export default function InvitePreview() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const isMember = useApp((s) => s.isMember);
  const desktop = useDesktop();
  const insets = useInsets();
  const [told, setTold] = useState<string | null>(null);
  const homes = useMemo(() => byTravel(listings).filter(isOpenThisWeek).slice(0, 3), []);

  if (isMember) return <Redirect href="/explore" />;
  if (!code || code.trim().toUpperCase() === MAGIC_BAD_CODE) return <Redirect href="/" />;

  const inviter = member.invitedBy.name.split(' ')[0];
  const accept = () => router.push('/onboarding/welcome');

  const header = (
    <View style={{ gap: 14, maxWidth: 560 }}>
      <Reveal delay={0} duration={1000}>
        <Wordmark tone="dark" size={18} style={{ marginBottom: desktop ? 40 : 28 }} />
      </Reveal>
      <Reveal delay={AT.title} duration={1000} rise={12}>
        <T variant="display" tone="dark" accessibilityRole="header">{inviter} invited you.</T>
      </Reveal>
      <Reveal delay={AT.line} duration={1000}>
        <T tone="dark" color="inkSecondary">{"Here's what's open near you this week."}</T>
      </Reveal>
    </View>
  );

  const cards = homes.map((l, i) => (
    <Reveal key={l.id} delay={AT.homes + i * AT.stagger} rise={18} duration={1200} style={desktop ? { flex: 1 } : undefined}>
      <HomeTeaser
        listing={l}
        free={freeNightsAt(l, STARTING_NIGHTS) > 0}
        photoStyle={{ width: '100%', aspectRatio: desktop ? 1 : 4 / 5 }}
        driftDelay={i * 3000}
        onPress={() => setTold(l.id)}
        accessibilityHint="Booking opens when you join."
      >
        {told === l.id ? (
          <Reveal rise={4} duration={600}>
            <T variant="callout" tone="dark" color="inkTertiary" style={{ marginTop: 6 }}>Booking opens when you join.</T>
          </Reveal>
        ) : null}
      </HomeTeaser>
    </Reveal>
  ));

  const action = (
    <Reveal delay={AT.action} duration={900}>
      <PrimaryButton tone="dark" label="Accept invite" onPress={accept} />
    </Reveal>
  );

  if (desktop) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.dark.bg }}>
        <StatusBar style="light" />
        <PhotoCycle listings={homes} overlay={0.84} />
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 40, paddingVertical: 64 }}>
          <View style={{ width: '100%', maxWidth: 1120, alignSelf: 'center' }}>
            {header}
            <View style={{ flexDirection: 'row', gap: 24, marginTop: 48 }}>{cards}</View>
            <View style={{ width: 360, marginTop: 48 }}>{action}</View>
          </View>
        </ScrollView>
      </View>
    );
  }

  const bottom = Math.max(insets.bottom, 16) + 16;
  return (
    <View style={{ flex: 1, backgroundColor: colors.dark.bg }}>
      <StatusBar style="light" />
      <PhotoCycle listings={homes} overlay={0.82} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 28, paddingHorizontal: 24, paddingBottom: bottom + 56 + 48 }}
      >
        {header}
        <View style={{ gap: 40, marginTop: 40 }}>{cards}</View>
      </ScrollView>
      <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: -40, bottom: 0 }}>
          <LinearGradientBg from={colors.dark.bg} to={colors.dark.bg} fromOpacity={0} toOpacity={0.94} />
        </View>
        <View style={{ paddingHorizontal: 24, paddingBottom: bottom }}>{action}</View>
      </View>
    </View>
  );
}

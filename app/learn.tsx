import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { PrimaryButton, TextButton } from '@/components/Buttons';
import { DriftBackground } from '@/components/DriftBackground';
import { T, Wordmark } from '@/components/Text';
import { MEMBERSHIP_MONTHLY } from '@/config';
import { useInsets } from '@/lib/insets';
import { colors, motion } from '@/theme';

const steps = [
  {
    title: 'Get invited.',
    body: 'Membership is by invitation only. Someone who knows you vouches for you, and you verify your ID.',
  },
  {
    title: 'Get 5 free nights a year.',
    body: 'Stay at private homes and pay only the cleaning fee and taxes. After your free nights, every night is 50% off. Unused free nights roll over for 5 years.',
  },
  {
    title: 'Book within 5 days.',
    body: "Homes open to members when they're still free 5 days before check-in. Plan a little less, travel a lot more.",
  },
];

const vetting = [
  'Invited by someone who vouches for them',
  'Government ID verified',
  'A short video intro that hosts see after booking',
  "Agreed to the house rules. One serious strike and they're out, and their inviter hears about it.",
];

const hostPoints = [
  { title: 'Half-price stays', body: 'Members pay 50% of your nightly rate. You keep 88% of that.' },
  { title: 'Cleaning fees are yours', body: 'In full, on every stay, free or paid.' },
  { title: 'A share of every membership', body: '60% of membership revenue goes to hosts each quarter, for the members you host and the nights you open.' },
  { title: 'Counts toward your sharing', body: 'Free member stays count toward the nights you share on Hostshare.' },
  { title: 'Only last-minute nights', body: 'Members book within 5 days of arrival, after your regular guests and Hostshare travelers have had their chance.' },
];

const faqs = [
  {
    q: 'Where are the homes?',
    a: 'Private homes across the Hostshare network, from mountain cabins to desert houses and coastal lofts.',
  },
  {
    q: 'Why only 5 days out?',
    a: "Those are the nights hosts would otherwise leave empty. That's what makes free and half-price stays possible.",
  },
  {
    q: 'What if my plans change?',
    a: 'Cancel 24 hours or more before check-in and your free nights go back to your bank.',
  },
  {
    q: 'What if I pause my membership?',
    a: 'Your banked nights are frozen, not lost. They come back when you rejoin.',
  },
  {
    q: 'How do I get an invite?',
    a: 'Ask a member or a Hostshare host. Every member and host has a few invites to give.',
  },
];

function Section({ title, children, first }: { title?: string; children: ReactNode; first?: boolean }) {
  return (
    <View style={[styles.section, first && { borderTopWidth: 0 }]}>
      {title ? <T variant="title">{title}</T> : null}
      {children}
    </View>
  );
}

/** Public explainer behind "Learn more" on the landing. */
export default function Learn() {
  const insets = useInsets();
  const { width, height } = useWindowDimensions();
  const wide = width >= 900;
  const column = { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 24 } as const;

  return (
    <View style={{ flex: 1, backgroundColor: colors.light.bg }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}>
        <View style={{ height: Math.min(Math.max(height * 0.62, 420), 640), backgroundColor: colors.dark.bg }}>
          <DriftBackground
            source={require('../assets/photos/cedar.jpg')}
            overlay={motion.overlay.default}
          />
          <View style={[column, { flex: 1, paddingTop: insets.top, paddingBottom: 40, justifyContent: 'space-between' }]}>
            <Pressable accessibilityRole="link" accessibilityLabel="hostmenow home" onPress={() => router.replace('/')} style={{ alignSelf: 'flex-start', paddingVertical: 8 }}>
              <Wordmark size={22} tone="dark" />
            </Pressable>
            <View style={{ gap: 14 }}>
              <T variant="display" tone="dark" style={wide ? { fontSize: 56, lineHeight: 60, letterSpacing: -1.1 } : undefined}>
                5 nights free.{'\n'}5 days out.
              </T>
              <T tone="dark" color="inkSecondary" style={{ maxWidth: 440 }}>
                hostmenow is a private travel membership for staying in homes run by Hostshare hosts.
              </T>
            </View>
          </View>
        </View>

        <View style={column}>
          <Section first>
            <View style={{ gap: 28, paddingTop: 8 }}>
              {steps.map((s, i) => (
                <View key={s.title} style={{ flexDirection: 'row', gap: 16 }}>
                  <T variant="heading" color="accent" style={{ width: 20, fontVariant: ['tabular-nums'] }}>{i + 1}</T>
                  <View style={{ flex: 1, gap: 6 }}>
                    <T variant="heading">{s.title}</T>
                    <T color="inkSecondary">{s.body}</T>
                  </View>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Membership">
            <T variant="bodyStrong" style={{ fontSize: 56, lineHeight: 60, letterSpacing: -1.7 }}>
              ${MEMBERSHIP_MONTHLY}
              <T color="inkSecondary"> a month</T>
            </T>
            <View>
              {['5 free nights every year', '50% off every night after that', 'Nights roll over for 5 years', 'Cancel anytime'].map((l, i) => (
                <T key={l} style={[styles.line, i === 0 && styles.lineFirst]}>{l}</T>
              ))}
            </View>
          </Section>

          <Section title="Who's in">
            <T color="inkSecondary">Every member gets in the same way.</T>
            <View>
              {vetting.map((v, i) => (
                <T key={v} style={[styles.line, i === 0 && styles.lineFirst]}>{v}</T>
              ))}
            </View>
          </Section>

          <Section title="For Hostshare hosts">
            <T color="inkSecondary">Earn on the nights that would otherwise sit empty. Your Hostshare travel doesn't change.</T>
            <View style={{ gap: 18 }}>
              {hostPoints.map((p) => (
                <View key={p.title} style={{ gap: 2 }}>
                  <T variant="bodyStrong">{p.title}</T>
                  <T variant="callout" color="inkSecondary">{p.body}</T>
                </View>
              ))}
            </View>
            <TextButton label="See what your listings could earn" onPress={() => router.push('/host')} style={{ alignSelf: 'flex-start', height: 44 }} />
          </Section>

          <Section title="Questions">
            <View style={{ gap: 22 }}>
              {faqs.map((f) => (
                <View key={f.q} style={{ gap: 4 }}>
                  <T variant="bodyStrong">{f.q}</T>
                  <T color="inkSecondary">{f.a}</T>
                </View>
              ))}
            </View>
          </Section>

          <Section>
            <View style={{ gap: 16, alignItems: 'stretch' }}>
              <T variant="heading" align="center">Have an invite?</T>
              <PrimaryButton label="Enter your code" onPress={() => router.replace('/')} style={{ alignSelf: 'center', width: '100%', maxWidth: 360 }} />
            </View>
          </Section>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 16, paddingVertical: 40, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.light.line },
  line: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.light.line },
  lineFirst: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.light.line },
});

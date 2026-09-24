import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { BRAND, MEMBERSHIP_MONTHLY, PRICING_CONFIG } from '@/config';
import { PressScale } from '@/components/PressScale';
import { T } from '@/components/Text';
import { estimate, money10, networkFor, type EstimateInput, type Stage } from '@/lib/estimate';
import { useInsets } from '@/lib/insets';
import { haptics } from '@/services';
import { radius } from '@/theme';
import { HostIcon, type HostIconName } from './HostIcon';
import { HostButton, HostSegmented, HostTextButton, hs } from './HostUI';

const HOMES = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5+', value: 6 },
];
const OPEN = [
  { label: '0 to 3', value: 2 },
  { label: '4 to 6', value: 5 },
  { label: '7 to 10', value: 8 },
  { label: 'More than 10', value: 13 },
];
const RATE_MIN = 80;
const RATE_MAX = 600;

type Inputs = Required<Pick<EstimateInput, 'homes' | 'rate' | 'openPerMonth'>> & { quality?: number };
/** 0 is how it works (public page only), 1 to 3 the questions, 4 the result. */
type Step = 0 | 1 | 2 | 3 | 4;

const DEFAULTS: Inputs = { homes: 1, rate: 220, openPerMonth: 8 };

function Chips<V extends number>({ options, value, onChange, columns }: { options: { label: string; value: V }[]; value: V; onChange: (v: V) => void; columns: number }) {
  const rows: (typeof options)[] = [];
  for (let i = 0; i < options.length; i += columns) rows.push(options.slice(i, i + columns));
  return (
    <View accessibilityRole="radiogroup" style={{ gap: 10, marginTop: 28 }}>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: 10 }}>
          {row.map((o) => {
            const on = o.value === value;
            return (
              <PressScale
                key={o.label}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  haptics.tapLight();
                  onChange(o.value);
                }}
                style={[styles.chip, on && { backgroundColor: hs.ink, borderColor: hs.ink }]}
              >
                <T variant={on ? 'bodyStrong' : 'body'} style={{ color: on ? '#FFFFFF' : hs.ink }}>{o.label}</T>
              </PressScale>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function Question({ eyebrow, title, help, children }: { eyebrow?: string; title: string; help: string; children: ReactNode }) {
  return (
    <View>
      {eyebrow ? <T variant="caption" color="inkSecondary" style={{ marginBottom: 8 }}>{eyebrow}</T> : null}
      <T variant="bodyStrong" accessibilityRole="header" style={{ fontSize: 30, lineHeight: 36, letterSpacing: -0.75 }}>{title}</T>
      <T variant="callout" color="inkSecondary" style={{ marginTop: 10, lineHeight: 21 }}>{help}</T>
      {children}
    </View>
  );
}

function Row({ label, sub, value, total }: { label: string; sub?: string; value: string; total?: boolean }) {
  return (
    <View style={[styles.row, total ? null : styles.rowLine]}>
      <View style={{ flex: 1 }}>
        <T variant={total ? 'body' : 'callout'}>{label}</T>
        {sub ? <T variant="caption" color="inkSecondary">{sub}</T> : null}
      </View>
      <T variant="bodyStrong" style={[{ fontVariant: ['tabular-nums'] }, total ? { fontSize: 20 } : { fontSize: 15 }]}>{value}</T>
    </View>
  );
}

/** The result: total, the pool card leading, the breakdown, and the scenario toggle. */
export function EstimateResult({ inputs, stage, onStage }: { inputs: Inputs; stage: Stage; onStage: (s: Stage) => void }) {
  const e = estimate(inputs, networkFor(stage));
  const free = Math.max(1, Math.round(e.freeStays));
  const paid = Math.max(1, Math.round(e.paidNights));
  return (
    <View accessibilityLiveRegion="polite">
      <T variant="caption" color="inkSecondary" style={{ marginBottom: 8 }}>Your estimate</T>
      <T variant="bodyStrong" style={{ fontSize: 30, lineHeight: 36, letterSpacing: -0.75 }}>About {money10(e.total)} a year</T>

      <View style={styles.pool}>
        <T variant="caption" style={{ color: '#FFFFFF', opacity: 0.75 }}>From the pool</T>
        <T variant="bodyStrong" style={{ color: '#FFFFFF', fontSize: 52, lineHeight: 56, letterSpacing: -2, fontVariant: ['tabular-nums'] }}>
          {money10(e.pool)}
          <T style={{ color: '#FFFFFF', opacity: 0.75 }}> a year</T>
        </T>
        <T variant="callout" style={{ color: '#FFFFFF', opacity: 0.8, lineHeight: 21 }}>
          Nearly half of every membership goes to hosts, paid each quarter.
        </T>
      </View>

      <View style={{ marginTop: 8 }}>
        <Row label="Pool: members you host" sub={`About ${free} free ${free === 1 ? 'night' : 'nights'} a year`} value={money10(e.poolHosted)} />
        <Row label="Pool: nights you leave open" sub="Paid even when nobody books" value={money10(e.poolAvail)} />
        <Row label="Half-price stays" sub={`About ${paid} ${paid === 1 ? 'night' : 'nights'} at $${Math.round(e.memberRate)}, after fees`} value={money10(e.paid)} />
        <Row total label="Total" value={money10(e.total)} />
      </View>

      <View style={{ marginTop: 16 }}>
        <HostSegmented<Stage>
          small
          options={[
            { value: 'launch', label: 'At launch' },
            { value: 'growing', label: 'At 8,000 members' },
          ]}
          value={stage}
          onChange={onStage}
        />
      </View>
      <T variant="caption" color="inkSecondary" style={{ marginTop: 8 }}>
        {stage === 'launch'
          ? 'The pool grows as members join. Every new member adds to it.'
          : `Same homes, same nights, with 8,000 members on ${BRAND}.`}
      </T>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, alignItems: 'flex-start' }}>
        <HostIcon name="check" size={16} color={hs.secondary} />
        <T variant="caption" color="inkSecondary" style={{ flex: 1 }}>
          Free member stays count toward the nights you already share on Hostshare. Paid stays are extra income.
        </T>
      </View>
    </View>
  );
}

const poolPct = `${Math.round(PRICING_CONFIG.pool_share_of_membership * 100)}%`;

const HOW: { icon: HostIconName; title: string; body: string }[] = [
  { icon: 'people', title: 'Travelers join.', body: `People pay $${MEMBERSHIP_MONTHLY} a month to travel for less.` },
  { icon: 'coins', title: 'Nearly half goes to hosts.', body: `${poolPct} of every membership goes into a pool for hosts, plus a share of the fees on paid stays.` },
  { icon: 'calendar-check', title: 'You open your empty nights.', body: 'Nights still free 5 days out earn you a share, even if nobody books them.' },
  { icon: 'split', title: 'Guests who stay add more.', body: 'Half-price stays pay you directly. Free stays earn a bigger share. Paid each quarter.' },
];

/** One step of the picture; fades up in turn once `play` is true. */
function HowStep({ h, i, play, last }: { h: (typeof HOW)[number]; i: number; play: boolean; last: boolean }) {
  const reduceMotion = useReducedMotion();
  const p = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (play && !reduceMotion) p.value = withDelay(150 + i * 170, withTiming(1, { duration: 420, easing: Easing.out(Easing.ease) }));
  }, [play, i, p, reduceMotion]);
  const style = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: 10 * (1 - p.value) }] }));
  return (
    <Animated.View style={[{ flexDirection: 'row', gap: 16 }, style]}>
      <View style={{ alignItems: 'center', width: 44 }}>
        <View style={styles.howIcon}>
          <HostIcon name={h.icon} size={22} />
        </View>
        {last ? null : <View style={{ width: 1, flex: 1, minHeight: 18, backgroundColor: hs.line }} />}
      </View>
      <View style={{ flex: 1, paddingTop: 2, paddingBottom: last ? 0 : 22, gap: 2 }}>
        <T variant="bodyStrong">{h.title}</T>
        <T variant="callout" color="inkSecondary" style={{ lineHeight: 21 }}>{h.body}</T>
      </View>
    </Animated.View>
  );
}

/** A four-step picture of the model, drawn as a quiet vertical line. Plays once it's actually on screen. */
function HowItWorks({ play }: { play: boolean }) {
  return (
    <View>
      <T variant="caption" color="inkSecondary" style={{ marginBottom: 8 }}>How it works</T>
      <T variant="bodyStrong" accessibilityRole="header" style={{ fontSize: 30, lineHeight: 36, letterSpacing: -0.75 }}>
        Your empty nights, paid.
      </T>
      <View style={{ marginTop: 28 }}>
        {HOW.map((h, i) => (
          <HowStep key={h.title} h={h} i={i} play={play} last={i === HOW.length - 1} />
        ))}
      </View>
    </View>
  );
}

function Progress({ step }: { step: Step }) {
  const w = useSharedValue(step / 4);
  useEffect(() => {
    w.value = withTiming(step / 4, { duration: 350, easing: Easing.out(Easing.ease) });
  }, [step, w]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={{ height: 2, backgroundColor: hs.line, borderRadius: radius.pill, overflow: 'hidden' }}>
      <Animated.View style={[{ height: 2, backgroundColor: hs.ink }, fill]} />
    </View>
  );
}

type Props = {
  /** Signed-in prefill. Without it, the questions start from the reference defaults. */
  initial?: Inputs;
  /** Open on the result (signed-in hosts) instead of question 1. */
  startAtResult?: boolean;
  /** Embedded in another screen: no header, questions inline, "Adjust" instead of the CTA. */
  embedded?: boolean;
  onInputs?: (inputs: Inputs) => void;
  onCta?: () => void;
  /** False while an intro covers the page; the how-it-works steps wait for it. */
  revealed?: boolean;
  /** The member whose host link brought them here, if any. */
  referredBy?: string;
};

/** Three questions, then the pool-led estimate (Revision 02). */
export function EstimateFlow({ initial, startAtResult, embedded, onInputs, onCta, revealed = true, referredBy }: Props) {
  const insets = useInsets();
  const [inputs, setInputs] = useState<Inputs>(initial ?? DEFAULTS);
  const [step, setStep] = useState<Step>(startAtResult ? 4 : embedded ? 1 : 0);
  const [stage, setStage] = useState<Stage>('launch');
  const scroller = useRef<ScrollView>(null);

  const set = (patch: Partial<Inputs>) => {
    const next = { ...inputs, ...patch };
    setInputs(next);
    onInputs?.(next);
  };
  const go = (s: Step) => {
    setStep(s);
    scroller.current?.scrollTo({ y: 0, animated: false });
  };

  const rateLabel = `$${inputs.rate}${inputs.rate >= RATE_MAX ? '+' : ''}`;

  const body =
    step === 0 ? (
      <HowItWorks play={revealed} />
    ) : step === 1 ? (
      <Question eyebrow={embedded ? undefined : '1 of 3'} title="How many homes do you host?" help="Each home earns its own share of the pool.">
        <Chips options={HOMES} value={inputs.homes} onChange={(homes) => set({ homes })} columns={5} />
      </Question>
    ) : step === 2 ? (
      <Question eyebrow={embedded ? undefined : '2 of 3'} title="What's your average nightly rate?" help="Pricier homes earn a bigger share of the pool per night.">
        <View style={{ marginTop: 36, gap: 12 }}>
          <T variant="bodyStrong" style={{ fontSize: 56, lineHeight: 60, letterSpacing: -2.2, fontVariant: ['tabular-nums'] }}>
            {rateLabel}
            <T color="inkSecondary"> a night</T>
          </T>
          <Slider
            accessibilityLabel="Average nightly rate"
            minimumValue={RATE_MIN}
            maximumValue={RATE_MAX}
            step={10}
            value={inputs.rate}
            onValueChange={(rate) => set({ rate: Math.round(rate) })}
            minimumTrackTintColor={hs.ink}
            maximumTrackTintColor={hs.line}
            thumbTintColor={hs.ink}
            style={{ height: 40 }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: -8 }}>
            <T variant="caption" color="inkSecondary">${RATE_MIN}</T>
            <T variant="caption" color="inkSecondary">${RATE_MAX}+</T>
          </View>
        </View>
      </Question>
    ) : step === 3 ? (
      <Question
        eyebrow={embedded ? undefined : '3 of 3'}
        title="In a typical month, how many nights are still empty 5 days out?"
        help="Per home. These are the nights you'd usually lose."
      >
        <Chips options={OPEN} value={inputs.openPerMonth} onChange={(openPerMonth) => set({ openPerMonth })} columns={2} />
        <T variant="caption" color="inkSecondary" style={{ marginTop: 14 }}>No commitment. Pause a listing any time.</T>
      </Question>
    ) : (
      <EstimateResult inputs={inputs} stage={stage} onStage={setStage} />
    );

  const actions =
    step === 0 ? (
      <HostButton label="See what you'd earn" onPress={() => go(1)} />
    ) : step < 4 ? (
      <>
        <HostButton label={step === 3 ? 'See my estimate' : 'Continue'} onPress={() => go((step + 1) as Step)} />
        {step > 1 || !embedded ? <HostTextButton label="Back" onPress={() => go((step - 1) as Step)} /> : null}
      </>
    ) : embedded ? (
      <HostTextButton label="Adjust" onPress={() => go(1)} />
    ) : (
      <>
        <T variant="caption" color="inkSecondary" align="center" style={{ fontSize: 12, lineHeight: 17 }}>
          {referredBy ? `${referredBy} invited you. ` : ''}Each home you add opens a membership you can give to a guest.
        </T>
        <HostButton label="Opt in on Hostshare" onPress={onCta} />
        <HostTextButton label="Start over" onPress={() => go(1)} />
        <T variant="caption" color="inkSecondary" align="center" style={{ fontSize: 12, lineHeight: 17 }}>
          An estimate from current network activity, not a guarantee.
        </T>
      </>
    );

  if (embedded) {
    return (
      <View>
        {body}
        <View style={{ marginTop: 20, gap: 8 }}>{actions}</View>
      </View>
    );
  }

  // Full-width page on desktop web; the estimate itself stays a phone-width column.
  return (
    <View style={{ flex: 1, backgroundColor: hs.card, paddingTop: insets.top - 8 }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center' }}>
      <StatusBar style="dark" />
      <View style={{ paddingHorizontal: 24 }}>
        <View style={{ height: 44, marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable accessibilityRole="link" accessibilityLabel="hostmenow home" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
            <T variant="calloutStrong" style={{ letterSpacing: -0.3 }}>hostmenow</T>
          </Pressable>
          <T variant="caption" color="inkSecondary">For Hostshare hosts</T>
        </View>
        {step === 0 ? <View style={{ height: 2 }} /> : <Progress step={step} />}
      </View>
      <ScrollView ref={scroller} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: step === 4 ? 28 : 40, paddingBottom: 24 }}>
        {body}
      </ScrollView>
      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 16) + 12, gap: 8 }}>{actions}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flex: 1, height: 56, borderRadius: 16, borderWidth: 1, borderColor: hs.line, backgroundColor: hs.card, alignItems: 'center', justifyContent: 'center' },
  pool: { marginTop: 20, borderRadius: 20, padding: 22, backgroundColor: hs.ink, gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, paddingVertical: 14 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: hs.line },
  howIcon: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: hs.line, alignItems: 'center', justifyContent: 'center', backgroundColor: hs.card },
});

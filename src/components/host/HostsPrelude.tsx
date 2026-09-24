import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, View, type TextStyle } from 'react-native';

import { PrimaryButton } from '@/components/Buttons';
import { HouseBackdrop, ramp, TypedLine, usePreludeClock } from '@/components/Typewriter';
import { colors, type } from '@/theme';

/** ms per typed character. */
const CH = 36;

const L1 = 'What if';
const L2 = 'your unbooked nights paid you.';
const L3A = 'Whether anyone booked them';
const L3B = ' or not.';
const L4 = 'Now they can.';

/** The script as one timeline (ms from start). */
function buildTimeline() {
  let t = 500;
  const l1 = { at: t, end: t + L1.length * CH };
  t = l1.end + 900; // pause
  const l2 = { at: t, end: t + L2.length * CH };
  t = l2.end + 1100; // pause
  const l3a = { at: t, end: t + L3A.length * CH };
  t = l3a.end + 1600; // a longer pause, for effect
  const l3b = { at: t, end: t + L3B.length * CH };
  t = l3b.end + 1500; // let it land
  const clear = [t, t + 600] as const;
  t = clear[1] + 450;
  const l4 = { at: t, end: t + L4.length * 60 }; // slower, deliberate
  const lightsOn = [l4.at, l4.at + 1500] as const;
  // Then one button, and the intro waits for it.
  const buttonAt = l4.end + 900;
  const holdAt = buttonAt + 500;
  const reveal = [holdAt + 50, holdAt + 850] as const;
  return { l1, l2, l3a, l3b, clear, l4, lightsOn, buttonAt, holdAt, reveal, end: reveal[1] };
}

const TL = buildTimeline();

const typed = (now: number, text: string, at: number, perChar = CH) =>
  now < at ? 0 : Math.min(text.length, Math.floor((now - at) / perChar) + 1);

/** "What if your unbooked nights paid you…" before the host estimate. Tap to skip. */
export function HostsPrelude({ onDone }: { onDone: () => void }) {
  // Size to the space the intro actually has (on desktop web /hosts sits in a phone-width column).
  const [width, setWidth] = useState(0);
  const wide = width >= 700;
  const { now, skipTo, release } = usePreludeClock(TL.end, onDone, TL.holdAt);
  // Skipping before the button skips the whole intro, button included.
  const skip = () => skipTo(TL.reveal[1] - 350);
  const buttonIn = ramp(now, TL.buttonAt, TL.buttonAt + 500);

  const blink = Math.floor(now / 450) % 2 === 0;
  const size = wide ? 34 : 26;
  const lineStyle: TextStyle = { ...(type.body as TextStyle), color: colors.dark.ink, fontSize: size, lineHeight: Math.round(size * 1.3) };
  // "Now they can." must fit on one line, so it stays truly centered.
  const bigSize = width > 0 ? Math.max(28, Math.min(56, Math.floor((width - 56) / 9.4))) : 40;
  const bigStyle: TextStyle = {
    ...(type.display as TextStyle),
    color: colors.dark.ink,
    fontSize: bigSize,
    lineHeight: Math.round(bigSize * 1.1),
    letterSpacing: -bigSize * 0.02,
    textAlign: 'center',
  };

  // Line 3 types "Whether anyone booked them", holds, then finishes " or not."
  const l3 = L3A + L3B;
  const l3shown = now < TL.l3b.at ? typed(now, L3A, TL.l3a.at) : L3A.length + typed(now, L3B, TL.l3b.at);

  const newest = now >= TL.l3a.at ? 3 : now >= TL.l2.at ? 2 : now >= TL.l1.at ? 1 : 0;
  const caretOn = (line: number, typing: boolean) => newest === line && now < TL.clear[0] && (typing || blink);
  const sceneOne = now < TL.clear[1];
  const fadeOut = 1 - ramp(now, TL.reveal[0], TL.reveal[1]);

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.dark.bg, opacity: fadeOut, zIndex: 10 }]}
      // One readable block while it plays; once the button is up, it must be reachable on its own.
      accessible={now < TL.buttonAt}
      accessibilityLabel={`${L1} ${L2} ${l3} ${L4}`}
    >
      <StatusBar style="light" />
      {/* Unbooked nights are dark ones; the lights come on at "Now they can." */}
      <HouseBackdrop now={now} lightsOn={TL.lightsOn} />

      {sceneOne ? (
        <View style={[styles.column, { maxWidth: wide ? 640 : 520, opacity: 1 - ramp(now, ...TL.clear) }]}>
          {now >= TL.l1.at - 200 ? (
            <TypedLine text={L1} shown={typed(now, L1, TL.l1.at)} caret={caretOn(1, now < TL.l1.end)} style={lineStyle} dim={newest > 1 ? 0.45 : 1} />
          ) : null}
          {now >= TL.l2.at - 200 ? (
            <TypedLine text={L2} shown={typed(now, L2, TL.l2.at)} caret={caretOn(2, now < TL.l2.end)} style={lineStyle} dim={newest > 2 ? 0.45 : 1} />
          ) : null}
          {now >= TL.l3a.at - 200 ? (
            <TypedLine
              text={l3}
              shown={l3shown}
              caret={caretOn(3, (now >= TL.l3a.at && now < TL.l3a.end) || (now >= TL.l3b.at && now < TL.l3b.end))}
              style={lineStyle}
            />
          ) : null}
        </View>
      ) : (
        <View style={[styles.column, { alignItems: 'center', maxWidth: wide ? 720 : 520 }]}>
          <TypedLine text={L4} shown={typed(now, L4, TL.l4.at, 60)} caret={now >= TL.l4.at && now < TL.buttonAt && (now < TL.l4.end || blink)} style={{ ...bigStyle, flexShrink: 0 }} />
          <View style={{ marginTop: 32, width: 200, opacity: buttonIn, transform: [{ translateY: 8 * (1 - buttonIn) }] }}>
            {now >= TL.buttonAt ? <PrimaryButton tone="dark" label="Prove it" onPress={release} /> : null}
          </View>
        </View>
      )}

      {/* Invisible: until the button appears, a tap anywhere skips to the estimate. */}
      {now < TL.buttonAt ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Skip intro" onPress={skip} style={StyleSheet.absoluteFill} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, width: '100%', alignSelf: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 16 },
});

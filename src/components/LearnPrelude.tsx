import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions, type TextStyle } from 'react-native';

import { useChloe } from '@/store/chloe';
import { colors, type } from '@/theme';
import { HouseBackdrop, ramp, TypedLine, usePreludeClock } from './Typewriter';

/** ms per typed character, and the pause after a line finishes. */
const CH = 32;
const HOLD = 1050;
const BEAT = 450; // between "host", "me" and "now"
const LETTER = 100;

const STORY = [
  'It started with hosts sharing their last-minute openings.',
  'Then it grew into hosts sharing stays booked well in advance.',
  "Now it's not just for hosts. It's for everyone.",
];
const LEAD = 'From the people who brought you Hostshare,';
const WORD = ['host', 'me', 'now'];
const CLOSE = ['Last-minute vacancies become last-minute memories,', 'for a fraction of the cost.'];

type Line = { text: string; at: number; end: number };
const typed = (text: string, at: number) => ({ text, at, end: at + text.length * CH });

/** The whole script as one timeline (ms from start). */
function buildTimeline() {
  let t = 600;
  const story: Line[] = STORY.map((text) => {
    const line = typed(text, t);
    t = line.end + HOLD;
    return line;
  });
  const storyOut = t + 700; // hold the full stack a moment, then clear
  t = storyOut + 1000;

  const lead = typed(LEAD, t);
  t = lead.end + 550;

  // The wordmark types in three beats, like the landing.
  const letterAt: number[] = [];
  WORD.forEach((w, i) => {
    if (i > 0) t += BEAT;
    for (let k = 0; k < w.length; k++) {
      letterAt.push(t);
      t += LETTER;
    }
  });
  t += 800;

  const close1 = typed(CLOSE[0], t);
  t = close1.end + 850;
  const close2 = typed(CLOSE[1], t);
  t = close2.end;

  const lightsOn = [close1.at, close1.at + 1400] as const;
  const reveal = [t + 2000, t + 2900] as const;
  return { story, storyOut, lead, letterAt, close1, close2, lightsOn, reveal, end: reveal[1] };
}

const TL = buildTimeline();

const count = (now: number, line: Line) => (now < line.at ? 0 : Math.min(line.text.length, Math.floor((now - line.at) / CH) + 1));

/** Typed prologue on Learn More. Tap to skip. Calls onDone once it has faded away. */
export function LearnPrelude({ onDone }: { onDone: () => void }) {
  const { width } = useWindowDimensions();
  const wide = width >= 700;
  const { now, skipTo } = usePreludeClock(TL.end, onDone);
  // No help launcher over the story.
  useEffect(() => useChloe.getState().hide(), []);
  // Jump to the reveal and let the fade play quickly.
  const skip = () => skipTo(TL.reveal[1] - 350);

  const blink = Math.floor(now / 450) % 2 === 0;
  const storySize = wide ? 30 : 22;
  const storyStyle: TextStyle = { ...(type.body as TextStyle), color: colors.dark.ink, fontSize: storySize, lineHeight: Math.round(storySize * 1.35) };
  const closeSize = wide ? 22 : 18;
  const closeStyle: TextStyle = { ...(type.body as TextStyle), color: colors.dark.ink, fontSize: closeSize, lineHeight: Math.round(closeSize * 1.4), textAlign: 'center' };
  const wmSize = wide ? 64 : 44;
  const wmStyle: TextStyle = { ...(type.wordmark(wmSize) as TextStyle), color: colors.dark.ink, lineHeight: Math.round(wmSize * 1.15), textAlign: 'center' };

  // Which story line is newest (it holds the caret; older lines dim).
  const newest = TL.story.reduce((n, l, i) => (now >= l.at ? i : n), -1);
  const storyOpacity = 1 - ramp(now, TL.storyOut, TL.storyOut + 600);
  const sceneTwo = now >= TL.storyOut + 600;
  const letters = TL.letterAt.filter((a) => now >= a).length;
  const wmCaret = now >= TL.lead.end + 150 && now < TL.close1.at && (letters < TL.letterAt.length || blink);
  const fadeOut = 1 - ramp(now, TL.reveal[0], TL.reveal[1]);

  const script = [...STORY, LEAD, 'hostmenow.', ...CLOSE].join(' ');

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.dark.bg, opacity: fadeOut, zIndex: 10 }]} accessible accessibilityLabel={script}>
      <StatusBar style="light" />
      {/* The landing's house, lights off, then on for the last line. */}
      <HouseBackdrop now={now} lightsOn={TL.lightsOn} />

      {!sceneTwo ? (
        <View style={[styles.column, { opacity: storyOpacity, maxWidth: wide ? 640 : 520 }]}>
          {TL.story.map((l, i) =>
            now >= l.at - 200 ? (
              <TypedLine
                key={l.text}
                text={l.text}
                shown={count(now, l)}
                caret={i === newest && (now < l.end || blink) && now < TL.storyOut}
                style={storyStyle}
                dim={i < newest ? 0.45 : 1}
              />
            ) : null,
          )}
        </View>
      ) : (
        <View style={[styles.column, { alignItems: 'center', maxWidth: wide ? 720 : 520, gap: wide ? 20 : 16 }]}>
          <TypedLine
            text={LEAD}
            shown={count(now, TL.lead)}
            caret={now >= TL.lead.at && now < TL.lead.end + 150}
            style={{ ...closeStyle, color: colors.dark.inkSecondary }}
          />
          <TypedLine text="hostmenow" shown={letters} caret={wmCaret} style={wmStyle} />
          <View style={{ gap: 2, marginTop: wide ? 8 : 4 }}>
            <TypedLine text={CLOSE[0]} shown={count(now, TL.close1)} caret={now >= TL.close1.at && now < TL.close2.at && (now < TL.close1.end || blink)} style={closeStyle} />
            <TypedLine text={CLOSE[1]} shown={count(now, TL.close2)} caret={now >= TL.close2.at && (now < TL.close2.end || blink)} style={closeStyle} />
          </View>
        </View>
      )}

      {/* Invisible: a tap anywhere skips to the page. */}
      <Pressable accessibilityRole="button" accessibilityLabel="Skip intro" onPress={skip} style={StyleSheet.absoluteFill} />
    </View>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, width: '100%', alignSelf: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 18 },
});

import { Text, View, type TextStyle } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { INTRO, LETTER_AT } from '@/lib/intro';
import { colors, type } from '@/theme';

const WORD = 'hostmenow';
const BLINK = 350;

function Letter({ ch, i, clock, style, size }: { ch: string; i: number; clock: SharedValue<number>; style: TextStyle; size: number }) {
  const at = LETTER_AT[i];
  const next = LETTER_AT[i + 1] ?? Infinity;
  const letter = useAnimatedStyle(() => ({ opacity: interpolate(clock.value, [at, at + 40], [0, 1], 'clamp') }));
  // The caret sits after the newest letter: solid while a word types, blinking in the
  // pauses between "host", "me" and "now", then two blinks at the end and gone.
  const caret = useAnimatedStyle(() => {
    const c = clock.value;
    const last = i === WORD.length - 1;
    const current = c >= at && (last ? c < INTRO.caretEnd : c < next);
    const settled = at + INTRO.letterStep;
    const blinkOn = c < settled || Math.floor((c - settled) / BLINK) % 2 === 0;
    return { opacity: current && blinkOn ? 1 : 0 };
  });
  // Before typing starts, a caret waits where the first letter will go.
  const lead = useAnimatedStyle(() => {
    const c = clock.value;
    const on = i === 0 && c >= INTRO.caretAppear && c < INTRO.typeStart && Math.floor((c - INTRO.caretAppear) / BLINK) % 2 === 0;
    return { opacity: on ? 1 : 0 };
  });
  const caretStyle = { position: 'absolute' as const, top: size * 0.12, width: 1.5, height: size * 0.95, backgroundColor: colors.dark.ink };
  return (
    <View>
      <Animated.View style={letter}>
        <Text style={style}>{ch}</Text>
      </Animated.View>
      <Animated.View style={[caretStyle, { right: -3 }, caret]} />
      {i === 0 ? <Animated.View style={[caretStyle, { left: -3 }, lead]} /> : null}
    </View>
  );
}

/** "hostmenow", typed in on the intro clock (ms). At the end it is the plain wordmark. */
export function TypedWordmark({ size, clock }: { size: number; clock: SharedValue<number> }) {
  const style: TextStyle = { ...(type.wordmark(size) as TextStyle), color: colors.dark.ink, lineHeight: Math.round(size * 1.15) };
  return (
    <View accessible accessibilityRole="header" accessibilityLabel={WORD} style={{ flexDirection: 'row' }}>
      {WORD.split('').map((ch, i) => (
        <Letter key={i} ch={ch} i={i} clock={clock} style={style} size={size} />
      ))}
    </View>
  );
}

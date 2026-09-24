import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, type TextStyle } from 'react-native';

import { colors } from '@/theme';
import { DriftBackground } from './DriftBackground';

/** Shared pieces for the typed prologues (Learn More, Earn as a Host). */

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ramp = (now: number, a: number, b: number) => clamp01((now - a) / (b - a));

export const CARET = '▏';

/**
 * Types `text` in place: the untyped rest is laid out but transparent, so lines
 * wrap where they'll finish and nothing shifts while typing. The caret always
 * holds its space; centered lines get a matching invisible one in front so they
 * stay truly centered.
 */
export function TypedLine({ text, shown, caret, style, dim }: { text: string; shown: number; caret: boolean; style: TextStyle; dim?: number }) {
  const centered = style.textAlign === 'center';
  return (
    <Text style={[style, dim !== undefined ? { opacity: dim } : null]}>
      {centered ? <Text style={{ color: 'transparent' }}>{CARET}</Text> : null}
      {text.slice(0, shown)}
      <Text style={{ color: caret ? colors.dark.ink : 'transparent' }}>{CARET}</Text>
      <Text style={{ color: 'transparent' }}>{text.slice(shown)}</Text>
    </Text>
  );
}

/**
 * A clock for a prologue (ms since it started), ending at `end` and calling
 * `onDone` once. With `holdAt`, the clock stops there until `release()` is
 * called (e.g. a "Prove it" button). `skipTo(ms)` jumps ahead and releases any hold.
 */
export function usePreludeClock(end: number, onDone: () => void, holdAt?: number) {
  const [now, setNow] = useState(0);
  const start = useRef<number | null>(null);
  const offset = useRef(0);
  const released = useRef(holdAt === undefined);
  const done = useRef(false);

  useEffect(() => {
    let raf = 0;
    const tick = (ts: number) => {
      if (start.current === null) start.current = ts;
      let t = ts - start.current + offset.current;
      if (!released.current && holdAt !== undefined && t > holdAt) {
        // Hold: pull the clock back so it resumes from holdAt when released.
        offset.current -= t - holdAt;
        t = holdAt;
      }
      setNow(t);
      if (t >= end) {
        if (!done.current) {
          done.current = true;
          onDone();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, onDone, holdAt]);

  const release = () => {
    released.current = true;
  };
  const skipTo = (target: number) => {
    released.current = true;
    if (now < target) offset.current += target - now;
  };
  return { now, skipTo, release };
}

/**
 * The landing's house behind a prologue: lights off, then on across `lightsOn`
 * (ms), under a dark overlay that lifts a little as they come on.
 */
export function HouseBackdrop({ now, lightsOn }: { now: number; lightsOn: readonly [number, number] }) {
  return (
    <View style={[StyleSheet.absoluteFill, { opacity: 0.9 * ramp(now, 0, 900) }]}>
      <DriftBackground source={require('../../assets/photos/landing.jpg')} cropX={51} overlay={0} />
      <View style={[StyleSheet.absoluteFill, { opacity: 1 - ramp(now, ...lightsOn) }]}>
        <DriftBackground source={require('../../assets/photos/landing-dark.jpg')} cropX={51} overlay={0} />
      </View>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: 0.82 - 0.22 * ramp(now, ...lightsOn) }]} />
    </View>
  );
}

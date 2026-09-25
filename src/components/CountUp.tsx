import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

/** Long soft landing: most of the travel early, the last few steps taking their time. */
const settle = (p: number) => 1 - Math.pow(1 - p, 4);

/**
 * A number that settles into place. Counts from `from` (or wherever it last was)
 * to `value` after `delay` ms, then follows it calmly when it changes.
 * Reduce Motion: shows the value straight away.
 */
export function useCountUp(value: number, { from = 0, duration = 1400, delay = 0 }: { from?: number; duration?: number; delay?: number } = {}) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : from);
  const last = useRef(reduce ? value : from);
  const started = useRef(false);
  useEffect(() => {
    if (reduce) {
      last.current = value;
      return;
    }
    let raf = 0;
    let start = 0;
    const a = last.current;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const v = a + (value - a) * settle(p);
      last.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    // The delay is for the first count only; later changes follow straight away.
    const timer = setTimeout(() => {
      started.current = true;
      raf = requestAnimationFrame(tick);
    }, started.current ? 0 : delay);
    // Frames don't run in a hidden tab or window; land on the value anyway.
    const guard = setTimeout(() => {
      cancelAnimationFrame(raf);
      last.current = value;
      setShown(value);
    }, (started.current ? 0 : delay) + duration + 300);
    return () => {
      clearTimeout(timer);
      clearTimeout(guard);
      cancelAnimationFrame(raf);
    };
  }, [value, reduce, duration, delay]);
  return reduce ? value : shown;
}

import { Platform } from 'react-native';

/**
 * The landing intro: the house's lights come on, the wordmark types itself,
 * then the tagline and invite field appear. Times in ms on one clock.
 */
const WORD_BEATS = ['host', 'me', 'now'];
const LETTER_STEP = 95;
/** The pause between "host", "me" and "now", so it reads as three words. */
const BEAT_PAUSE = 420;
const TYPE_START = 1300;

/** When each letter of "hostmenow" appears. */
export const LETTER_AT: number[] = (() => {
  const at: number[] = [];
  let t = TYPE_START;
  WORD_BEATS.forEach((word, w) => {
    if (w > 0) t += BEAT_PAUSE;
    for (let i = 0; i < word.length; i++) {
      at.push(t);
      t += LETTER_STEP;
    }
  });
  return at;
})();

/** When the last letter has finished appearing. */
export const TYPE_END = LETTER_AT[LETTER_AT.length - 1] + LETTER_STEP;

export const INTRO = {
  /** Lights-off photo fades out, revealing the lit windows. */
  lightsStart: 400,
  lightsEnd: 1400,
  /** The black overlay lifts from dark to its resting level. */
  liftStart: 900,
  liftEnd: 2000,
  darkOverlay: 0.78,
  /** A caret waits, then "host", "me", "now" type in three beats. */
  caretAppear: 900,
  typeStart: TYPE_START,
  letterStep: LETTER_STEP,
  caretEnd: TYPE_END + 700,
  taglineAt: TYPE_END + 150,
  fieldAt: TYPE_END + 450,
  fade: 450,
  total: TYPE_END + 450 + 450,
  /** How fast a tap skips to the end. */
  skip: 250,
} as const;

const KEY = 'hmn-intro-seen';
let seenThisLaunch = false;

/** Plays once per visit on web (per tab), once per launch in the app. */
export function introSeen(): boolean {
  if (seenThisLaunch) return true;
  if (Platform.OS === 'web') {
    try {
      return window.sessionStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  }
  return false;
}

export function markIntroSeen() {
  seenThisLaunch = true;
  if (Platform.OS === 'web') {
    try {
      window.sessionStorage.setItem(KEY, '1');
    } catch {
      // Private mode or blocked storage: the in-memory flag still covers this page.
    }
  }
}

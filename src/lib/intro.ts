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
  /** "5 nights free." then a pause, then "5 days out." */
  taglineAt: TYPE_END + 150,
  taglineSecondAt: TYPE_END + 150 + 700,
  fieldAt: TYPE_END + 150 + 700 + 400,
  fade: 450,
  /** Everything has stopped moving and the field is usable. */
  settled: TYPE_END + 150 + 700 + 400 + 450,
  /** "beta" arrives quietly, two seconds after everything settles. */
  betaAt: TYPE_END + 150 + 700 + 400 + 450 + 2000,
  betaFade: 700,
  total: TYPE_END + 150 + 700 + 400 + 450 + 2000 + 700,
  /** How fast a tap skips to the end. */
  skip: 250,
} as const;

let seenThisLoad = false;

/**
 * Plays on every page load (web) or app launch (native). Moving around inside
 * the site and coming back to the landing doesn't replay it.
 */
export function introSeen(): boolean {
  return seenThisLoad;
}

export function markIntroSeen() {
  seenThisLoad = true;
}

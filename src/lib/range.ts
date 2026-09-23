/** A stay as day offsets from today. `start` is the first night, `end` the last night (inclusive). */
export type Range = { start: number; end: number };

export const nightsIn = (r: Range) => r.end - r.start + 1;

export type RangeRules = {
  /** Latest day a stay can start (the 5-day booking window). */
  maxStart: number;
  maxNights: number;
  isOpen: (day: number) => boolean;
  /** Tapping a lone selected day clears it (Explore). */
  allowClear?: boolean;
};

const allOpen = (from: number, to: number, isOpen: (d: number) => boolean) => {
  for (let d = from; d <= to; d++) if (!isOpen(d)) return false;
  return true;
};

/** Can `day` become the last night of the current stay? */
export function canExtendTo(current: Range | null, day: number, rules: RangeRules): boolean {
  if (!current || day <= current.start) return false;
  if (day - current.start + 1 > rules.maxNights) return false;
  return allOpen(current.start, day, rules.isOpen);
}

/**
 * First tap picks the first night. A second, later tap picks the last night and
 * fills the days between. A tap after that starts a new stay, except on days past
 * the booking window, which can only ever be a last night.
 */
export function tapDay(current: Range | null, day: number, rules: RangeRules): Range | null {
  if (!rules.isOpen(day)) return current;
  const pendingEnd = current !== null && current.start === current.end;

  if (current && day === current.start && pendingEnd) return rules.allowClear ? null : current;
  if ((pendingEnd || day > rules.maxStart) && canExtendTo(current, day, rules)) return { start: current!.start, end: day };
  if (day <= rules.maxStart) return { start: day, end: day };
  return current;
}

/** Whether a chip can be tapped at all. */
export function isTappable(current: Range | null, day: number, rules: RangeRules): boolean {
  if (!rules.isOpen(day)) return false;
  return day <= rules.maxStart || canExtendTo(current, day, rules);
}

/** Every night of the range is open. */
export const rangeOpen = (r: Range, isOpen: (d: number) => boolean) => allOpen(r.start, r.end, isOpen);

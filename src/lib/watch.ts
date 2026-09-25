import { isOpenOn, type Listing } from '../data/mock.ts';
import { addDays, today } from './dates.ts';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** The first night (1..5) a home is open in the booking window, or null. */
export function firstOpenNight(l: Listing, isOpen: (l: Listing, day: number) => boolean = isOpenOn): number | null {
  return [1, 2, 3, 4, 5].find((d) => isOpen(l, d)) ?? null;
}

/** "tomorrow", "Saturday". */
export const nightName = (day: number) => (day === 1 ? 'tomorrow' : WEEKDAYS[addDays(today(), day).getDay()]);

/** A watched home's status line. */
export function watchStatus(l: Listing, isOpen?: (l: Listing, day: number) => boolean) {
  const d = firstOpenNight(l, isOpen);
  return d === null ? "Not open in the next 5 days. We'll tell you when it is." : `Open from ${nightName(d)}`;
}

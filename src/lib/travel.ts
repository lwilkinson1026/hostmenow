import type { Listing, Travel } from '../data/mock.ts';

/** "2h 15m drive", "45m drive", "2h 45m flight". */
export function travelLabel(t: Travel) {
  const h = Math.floor(t.mins / 60);
  const m = t.mins % 60;
  const time = h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`;
  return `${time} ${t.mode === 'drive' ? 'drive' : 'flight'}`;
}

/** Effort for sorting: a flight also costs the airport, so drives come first unless they're very long. */
export const travelEffort = (t: Travel) => (t.mode === 'fly' ? t.mins + 180 : t.mins);

/** Nearest first. */
export const byTravel = <L extends Pick<Listing, 'travel'>>(ls: L[]) => [...ls].sort((a, b) => travelEffort(a.travel) - travelEffort(b.travel));

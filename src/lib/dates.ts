const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Local midnight today. */
export function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Local midnight `n` calendar days after `d`. Calendar math, so daylight saving changes can't repeat or skip a day. */
export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/** Days from today +1. The booking window (check-in) is the first 5. */
export function windowDays(count = 5): { offset: number; date: Date; weekday: string; day: string }[] {
  const t = today();
  return Array.from({ length: count }, (_, i) => i + 1).map((offset) => {
    const date = addDays(t, offset);
    return { offset, date, weekday: WEEKDAYS[date.getDay()], day: String(date.getDate()) };
  });
}

export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function fromISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** "Thu, Sep 24" */
export const longDay = (d: Date) => `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;

/** "Sun 27" */
export const shortDay = (d: Date) => `${WEEKDAYS[d.getDay()]} ${d.getDate()}`;

/** "Sep 24 to 27" or "Sep 30 to Oct 2" */
export function shortRange(a: Date, b: Date): string {
  const start = `${MONTHS[a.getMonth()]} ${a.getDate()}`;
  const end = a.getMonth() === b.getMonth() ? `${b.getDate()}` : `${MONTHS[b.getMonth()]} ${b.getDate()}`;
  return `${start} to ${end}`;
}

/** "Thu, Sep 24 to Sun, Sep 27" */
export const longRange = (a: Date, b: Date) => `${longDay(a)} to ${longDay(b)}`;

/** "Sep 23, 2026" from "2026-09-23" */
export function fullDate(iso: string): string {
  const d = fromISODate(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** "Sep 2026" from "2026-09" or "2026-09-23" */
export function monthYear(iso: string): string {
  const [y, m] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** "Sep 22" */
export const monthDay = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Next monthly renewal on the same day of the month as `startIso`, after today. */
export function nextMonthly(startIso: string, from: Date = today()): Date {
  const day = fromISODate(startIso).getDate();
  const d = new Date(from.getFullYear(), from.getMonth(), day);
  if (d.getTime() <= from.getTime()) d.setMonth(d.getMonth() + 1);
  return d;
}

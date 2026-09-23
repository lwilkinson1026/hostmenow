const DAY = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Local midnight today. */
export function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d.getTime() + n * DAY);
  out.setHours(0, 0, 0, 0);
  return out;
}

/** The booking window: today +1 through today +5. */
export function windowDays(): { offset: number; date: Date; weekday: string; day: string }[] {
  const t = today();
  return [1, 2, 3, 4, 5].map((offset) => {
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

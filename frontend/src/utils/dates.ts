/**
 * Calendar-date helpers. Dates travel as plain 'YYYY-MM-DD' strings and all arithmetic is done in UTC, so the
 * device's time zone / DST never shifts a day. The backend interprets these dates in its business time zone.
 */
export type ISODate = string;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;
export const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
const DAY_MS = 86_400_000;

const pad2 = (n: number): string => String(n).padStart(2, '0');
export const toISO = (y: number, m: number, d: number): ISODate => `${y}-${pad2(m)}-${pad2(d)}`;

export function parseISO(s: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!match) return null;
  const y = Number(match[1]), m = Number(match[2]), d = Number(match[3]);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d ? { y, m, d } : null;
}

const utcMs = (s: ISODate): number => {
  const p = parseISO(s);
  return p ? Date.UTC(p.y, p.m - 1, p.d) : NaN;
};

/** The device's local calendar date (used only to cap the date pickers; presets are resolved by the backend). */
export const todayISO = (now: Date = new Date()): ISODate => toISO(now.getFullYear(), now.getMonth() + 1, now.getDate());

export function addDays(s: ISODate, n: number): ISODate {
  const dt = new Date(utcMs(s) + n * DAY_MS);
  return toISO(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

/** Number of calendar days from a to b, both inclusive. */
export const daysInRange = (a: ISODate, b: ISODate): number => Math.round((utcMs(b) - utcMs(a)) / DAY_MS) + 1;

export function formatDate(s: ISODate): string {
  const p = parseISO(s);
  return p ? `${p.d} ${MONTHS[p.m - 1]} ${p.y}` : s;
}

export function formatDayMonth(s: ISODate): string {
  const p = parseISO(s);
  return p ? `${p.d} ${MONTHS[p.m - 1]}` : s;
}

/** '12 Oct 2026' | '6 Oct – 12 Oct 2026' | '28 Dec 2025 – 3 Jan 2026' */
export function formatRange(a: ISODate, b: ISODate): string {
  if (a === b) return formatDate(a);
  const pa = parseISO(a), pb = parseISO(b);
  if (pa && pb && pa.y === pb.y) return `${formatDayMonth(a)} – ${formatDate(b)}`;
  return `${formatDate(a)} – ${formatDate(b)}`;
}

export const MIN_CUSTOM_DATE: ISODate = '2000-01-01';
export const MAX_RANGE_DAYS = 366;

/** Returns a user-facing message, or null when the range is valid. Mirrors the backend rules. */
export function validateCustomRange(start: ISODate, end: ISODate): string | null {
  if (!parseISO(start) || !parseISO(end)) return 'Please choose a valid start and end date.';
  if (start > end) return 'Start date must be on or before the end date.';
  if (start < MIN_CUSTOM_DATE) return `Dates before ${formatDate(MIN_CUSTOM_DATE)} are not supported.`;
  if (daysInRange(start, end) > MAX_RANGE_DAYS) return `Please choose a range of ${MAX_RANGE_DAYS} days or fewer.`;
  return null;
}

/** Weeks (Sunday first) of a month; leading/trailing blanks are null. */
export function monthGrid(year: number, month: number): (ISODate | null)[][] {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const total = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (ISODate | null)[] = [...Array<null>(first).fill(null), ...Array.from({ length: total }, (_, i) => toISO(year, month, i + 1))];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (ISODate | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

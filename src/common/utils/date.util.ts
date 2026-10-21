/**
 * Calendar-date helpers for strict `YYYY-MM-DD` strings.
 *
 * Every function works on explicit dates only. `new Date` / `Date.UTC` are
 * used purely as UTC calendar arithmetic and never to obtain "today";
 * "today" always comes from AppConfigService.
 */
const MS_PER_DAY = 86_400_000;

export function isValidDateString(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Convert YYYY-MM-DD to a day number (days since Unix epoch, UTC). */
export function toEpochDay(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return Math.round(Date.UTC(year, month - 1, day) / MS_PER_DAY);
}

/** Convert a day number back to YYYY-MM-DD. */
export function fromEpochDay(epochDay: number): string {
  const date = new Date(epochDay * MS_PER_DAY);
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  const day = `${date.getUTCDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date: string, days: number): string {
  return fromEpochDay(toEpochDay(date) + days);
}

/** Signed difference `to - from` in whole days. */
export function diffInDays(from: string, to: string): number {
  return toEpochDay(to) - toEpochDay(from);
}

/** Inclusive list of every YYYY-MM-DD between `from` and `to`. */
export function eachDay(from: string, to: string): string[] {
  const days: string[] = [];
  for (let day = toEpochDay(from); day <= toEpochDay(to); day += 1) {
    days.push(fromEpochDay(day));
  }
  return days;
}

/** Round an hours value to one decimal place to avoid float noise. */
export function roundHours(value: number): number {
  return Math.round(value * 10) / 10;
}

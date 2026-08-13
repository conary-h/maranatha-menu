/**
 * Dates are handled as `YYYY-MM-DD` strings in the device's local calendar.
 * Passing them through `new Date('2026-08-10')` would parse as UTC and show up
 * as the 9th in Honduras (UTC-6), so every conversion here is explicit.
 */

const LOCALE = 'es-HN'

export function todayIso(): string {
  return toIso(new Date())
}

export function toIso(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** `YYYY-MM-DD` → local `Date` at midnight. Returns today for malformed input. */
export function fromIso(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return new Date()
  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

export function isValidIsoDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  return toIso(fromIso(iso)) === iso
}

/** "Lunes 10 de agosto" — the headline date used on the printed menu. */
export function formatLongDate(iso: string): string {
  const text = new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(fromIso(iso))
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatWeekday(iso: string): string {
  const text = new Intl.DateTimeFormat(LOCALE, { weekday: 'long' }).format(fromIso(iso))
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** "10 de agosto" without the weekday. */
export function formatDayMonth(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long' }).format(fromIso(iso))
}

/** "12" — the day alone, as the almanac leaf prints it. */
export function dayOfMonth(iso: string): string {
  return String(fromIso(iso).getDate())
}

/** "mié" — the clipped weekday of an almanac's marginal column. */
export function formatWeekdayShort(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, { weekday: 'short' }).format(fromIso(iso)).replace('.', '')
}

/** "agosto" */
export function formatMonth(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, { month: 'long' }).format(fromIso(iso))
}

/** "agosto 2026" — the divider that groups torn-off leaves in the archive. */
export function formatMonthYear(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' }).format(fromIso(iso))
}

/** `YYYY-MM`, so grouping never depends on how a locale spells a month. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

/** "2026" — el año, que encabeza la columna marginal del taco. */
export function yearOf(iso: string): number {
  return fromIso(iso).getFullYear()
}

/** "224" — el ordinal del día, que todo almanaque imprime en su columna. */
export function dayOfYear(iso: string): number {
  const date = fromIso(iso)
  const start = new Date(date.getFullYear(), 0, 1)
  // Diferencia en días de calendario local; ambos extremos están a medianoche,
  // así que el cambio de horario de verano no puede descuadrar la cuenta.
  return Math.round((date.getTime() - start.getTime()) / 86_400_000) + 1
}

/** Los días que le quedan al año, la otra mitad de esa misma línea. */
export function daysLeftInYear(iso: string): number {
  const year = fromIso(iso).getFullYear()
  const total = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365
  return total - dayOfYear(iso)
}

/** Sundays print in red on an almanac leaf, and so do they here. */
export function isSunday(iso: string): boolean {
  return fromIso(iso).getDay() === 0
}

export function relativeDayLabel(iso: string): string | undefined {
  const today = todayIso()
  if (iso === today) return 'Hoy'
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (iso === toIso(tomorrow)) return 'Mañana'
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (iso === toIso(yesterday)) return 'Ayer'
  return undefined
}

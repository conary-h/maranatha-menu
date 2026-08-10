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

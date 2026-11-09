/**
 * Date helpers. Itinerary dates are plain ISO dates ("2026-12-01") without a
 * timezone, so they are parsed as local calendar dates to avoid off-by-one
 * shifts across timezones.
 */

function parseIsoDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

/** "Dec 1" */
export function formatShortDate(iso: string): string {
  const date = parseIsoDate(iso)
  if (!date) return iso
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** "Tuesday, December 1" */
export function formatLongDate(iso: string): string {
  const date = parseIsoDate(iso)
  if (!date) return iso
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

/** "Tue" */
export function formatWeekday(iso: string): string {
  const date = parseIsoDate(iso)
  if (!date) return ''
  return date.toLocaleDateString(undefined, { weekday: 'short' })
}

/** "December 1–5, 2026" or "Dec 30, 2026 – Jan 2, 2027" */
export function formatDateRange(startIso: string, endIso: string): string {
  const start = parseIsoDate(startIso)
  const end = parseIsoDate(endIso)
  if (!start || !end) return [startIso, endIso].filter(Boolean).join(' – ')

  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    const month = start.toLocaleDateString(undefined, { month: 'long' })
    return start.getDate() === end.getDate()
      ? `${month} ${start.getDate()}, ${start.getFullYear()}`
      : `${month} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`
  }
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`
}

/** Adds days to an ISO date and returns a new ISO date. */
export function addDaysIso(iso: string, days: number): string {
  const date = parseIsoDate(iso) ?? new Date()
  date.setDate(date.getDate() + days)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** "01" */
export function padNumber(value: number): string {
  return String(value).padStart(2, '0')
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}

import { locale } from '@/features/core/i18n'
import { useTimeZone } from '@/features/core/preferences'

export { useTimeZone }

export const DATE_LONG: Intl.DateTimeFormatOptions = { dateStyle: 'long' }
export const DATE_MEDIUM: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }

export const DATE_TIME_SHORT: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
}

export const DATE_TIME_MEDIUM: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'medium',
}

/**
 * `value` in the active locale, `timeZone` from the preferences store (pass `useTimeZone()`;
 * `undefined` defers to the runtime's own zone). `options` is a module-level constant: one of the
 * presets above, or an equivalent `Intl.DateTimeFormatOptions` built once outside render.
 */
export function formatDate(
  value: Date | string | null,
  options: Intl.DateTimeFormatOptions,
  timeZone: string | undefined,
): string | null {
  if (value === null) return null

  const date = value instanceof Date ? value : new Date(value)

  return new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(date)
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['week', 7 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
]

const relativeFormat = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

/**
 * `date` relative to now in the largest unit that fits, as "3 hours ago" or "yesterday". A
 * relative difference doesn't depend on the viewer's time zone.
 */
export function relativeTime(date: Date) {
  const seconds = (date.getTime() - Date.now()) / 1000

  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) return relativeFormat.format(Math.round(seconds / size), unit)
  }

  return relativeFormat.format(0, 'second')
}

function offsetLabel(timeZone: string, date: Date): string {
  const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(date)
    .find(p => p.type === 'timeZoneName')

  return (part?.value ?? 'GMT+00:00').replace('GMT', 'UTC')
}

function offsetMinutes(label: string): number {
  const match = /^UTC([+-])(\d{2}):(\d{2})$/.exec(label)

  if (!match) return 0

  const sign = match[1] === '-' ? -1 : 1

  return sign * (Number(match[2]) * 60 + Number(match[3]))
}

/** Every IANA time zone, labelled with its current UTC offset, sorted by offset then name. */
export const TIME_ZONES: { value: string; label: string }[] = Intl.supportedValuesOf('timeZone')
  .map(zone => {
    const offset = offsetLabel(zone, new Date())

    return { value: zone, label: `(${offset}) ${zone}`, minutes: offsetMinutes(offset) }
  })
  .sort((a, b) => a.minutes - b.minutes || a.value.localeCompare(b.value))
  .map(({ value, label }) => ({ value, label }))

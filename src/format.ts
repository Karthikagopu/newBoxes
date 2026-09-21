// en-IE gives "€480,000" (symbol first, comma grouping), matching the spec.
const eur = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})
export const formatEur = (n: number) => eur.format(n)

export const formatCount = (n: number) => n.toLocaleString('en-IE')

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'always' })
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 86_400_000],
  ['month', 30 * 86_400_000],
  ['week', 7 * 86_400_000],
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
]

export function formatRelative(ts: number, now = Date.now()): string {
  const diff = ts - now
  if (Math.abs(diff) < 60_000) return 'just now'
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms) return rtf.format(Math.round(diff / ms), unit)
  }
  return 'just now'
}

const dateTime = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
export const formatAbsolute = (ts: number) => dateTime.format(ts)

export const capitalise = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s)

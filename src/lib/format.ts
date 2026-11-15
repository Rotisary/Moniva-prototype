import { format, parseISO } from 'date-fns'
import type { Channel, PaymentChannel } from '../data/types.ts'

const whole = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 })

/** `₦1,250,000` */
export function formatNaira(amount: number): string {
  return `${amount < 0 ? '-' : ''}₦${whole.format(Math.abs(amount))}`
}

const trimZero = (value: string) => value.replace(/\.0+$/, '')

/** `₦2.10m`, `₦412k`, `₦318.5k`. For metric cards and chart axes only. */
export function formatNairaCompact(amount: number): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}₦${(abs / 1_000_000).toFixed(2)}m`
  if (abs >= 1_000) return `${sign}₦${trimZero((abs / 1_000).toFixed(1))}k`
  return `${sign}₦${whole.format(abs)}`
}

export const formatCount = (n: number) => whole.format(n)

/** A ratio from 0 to 1 as `35.0%`. */
export const formatPercent = (ratio: number, digits = 1) => `${(ratio * 100).toFixed(digits)}%`

/**
 * A change against the previous period: `+8.4%` for amounts and counts (a relative change),
 * `+0.1 pts` for rates. A null percent change means there was nothing to compare with.
 */
export function formatDelta(change: number | null, kind: 'percent' | 'points'): string {
  if (change === null) return 'New'
  const value = kind === 'percent' ? change * 100 : change
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${Math.abs(value).toFixed(1)}${kind === 'percent' ? '%' : ' pts'}`
}

export const formatDate = (iso: string, pattern = 'd MMM yyyy') => format(parseISO(iso), pattern)

export const formatDateTime = (iso: string) => format(parseISO(iso), 'd MMM, HH:mm')

export const CHANNEL_LABELS: Record<Channel, string> = { whatsapp: 'WhatsApp', instagram: 'Instagram' }

export const PAYMENT_CHANNEL_LABELS: Record<PaymentChannel, string> = {
  bank_transfer: 'Bank transfer',
  pos: 'POS',
  card: 'Card',
  cash: 'Cash',
}

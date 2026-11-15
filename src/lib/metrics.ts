import { DEMO_TODAY } from '../data/seed.ts'
import type { Channel, DemoDataset, Order, Transaction } from '../data/types.ts'

/** `YYYY-MM`. Periods are calendar months measured from DEMO_TODAY. */
export type MonthKey = string

export const CURRENT_MONTH: MonthKey = DEMO_TODAY.slice(0, 7)

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function shiftMonth(month: MonthKey, delta: number): MonthKey {
  const [year, m] = month.split('-').map(Number)
  const d = new Date(year, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export const previousMonth = (month: MonthKey) => shiftMonth(month, -1)

/** The `count` months ending at `end`, oldest first. */
export function lastMonths(count: number, end: MonthKey = CURRENT_MONTH): MonthKey[] {
  return Array.from({ length: count }, (_, i) => shiftMonth(end, i - count + 1))
}

export function monthLabel(month: MonthKey, style: 'short' | 'long' = 'short'): string {
  const [year, m] = month.split('-').map(Number)
  return style === 'short' ? MONTH_SHORT[m - 1] : `${MONTH_LONG[m - 1]} ${year}`
}

const inMonth = (date: string, month?: MonthKey) => !month || date.startsWith(month)
const sum = (values: number[]) => values.reduce((total, v) => total + v, 0)
const sumAmounts = (records: Array<{ amount: number }>) => sum(records.map((r) => r.amount))

/** n / d, or 0 when there is nothing to divide by. */
export const ratio = (n: number, d: number) => (d === 0 ? 0 : n / d)

export const completedOrders = (data: DemoDataset, month?: MonthKey): Order[] =>
  data.orders.filter((o) => o.status === 'completed' && inMonth(o.date, month))

export const nonCancelledOrders = (data: DemoDataset, month?: MonthKey): Order[] =>
  data.orders.filter((o) => o.status !== 'cancelled' && inMonth(o.date, month))

/** Open orders: confirmed or awaiting verification. Never counted as revenue. */
export const openOrders = (data: DemoDataset): Order[] =>
  data.orders.filter((o) => o.status === 'confirmed' || o.status === 'awaiting_verification')

export const revenue = (data: DemoDataset, month?: MonthKey) => sumAmounts(completedOrders(data, month))

export const verifiedDigitalTransactions = (data: DemoDataset, month?: MonthKey): Transaction[] =>
  data.transactions.filter((t) => t.status === 'verified' && inMonth(t.date, month))

export const verifiedDigital = (data: DemoDataset, month?: MonthKey) =>
  sumAmounts(verifiedDigitalTransactions(data, month))

export const cashTransactions = (data: DemoDataset, month?: MonthKey): Transaction[] =>
  data.transactions.filter(
    (t) => t.status === 'merchant_confirmed' && t.paymentChannel === 'cash' && inMonth(t.date, month),
  )

export const cashSales = (data: DemoDataset, month?: MonthKey) => sumAmounts(cashTransactions(data, month))

export const receivables = (data: DemoDataset) => sumAmounts(openOrders(data))

export const enquiries = (data: DemoDataset, month?: MonthKey) =>
  data.conversations.filter((c) => inMonth(c.startedAt, month))

export const enquiryToSale = (data: DemoDataset, month?: MonthKey) =>
  ratio(completedOrders(data, month).length, enquiries(data, month).length)

export const enquiryToOrder = (data: DemoDataset, month?: MonthKey) =>
  ratio(nonCancelledOrders(data, month).length, enquiries(data, month).length)

export const orderToPayment = (data: DemoDataset, month?: MonthKey) =>
  ratio(completedOrders(data, month).length, nonCancelledOrders(data, month).length)

export const averageOrderValue = (data: DemoDataset, month?: MonthKey) =>
  ratio(revenue(data, month), completedOrders(data, month).length)

/** Customers with 2+ completed orders / customers with 1+, counting orders up to the end of `uptoMonth`. */
export function repeatCustomerRate(data: DemoDataset, uptoMonth: MonthKey = CURRENT_MONTH): number {
  const counts = new Map<string, number>()
  for (const o of data.orders) {
    if (o.status !== 'completed' || o.date.slice(0, 7) > uptoMonth) continue
    counts.set(o.customerId, (counts.get(o.customerId) ?? 0) + 1)
  }
  const values = [...counts.values()]
  return ratio(values.filter((c) => c >= 2).length, values.length)
}

export const expensesTotal = (data: DemoDataset, month?: MonthKey) =>
  sumAmounts(data.expenses.filter((e) => inMonth(e.date, month)))

export const operatingProfit = (data: DemoDataset, month?: MonthKey) =>
  revenue(data, month) - expensesTotal(data, month)

export interface MonthlyPoint {
  month: MonthKey
  label: string
  revenue: number
  expenses: number
}

export function monthlySeries(data: DemoDataset, months: MonthKey[]): MonthlyPoint[] {
  return months.map((month) => ({
    month,
    label: monthLabel(month),
    revenue: revenue(data, month),
    expenses: expensesTotal(data, month),
  }))
}

export interface ChannelStats {
  channel: Channel
  enquiries: number
  completed: number
  revenue: number
  conversion: number
}

export function channelBreakdown(data: DemoDataset, month?: MonthKey): ChannelStats[] {
  return (['whatsapp', 'instagram'] as const).map((channel) => {
    const channelEnquiries = enquiries(data, month).filter((c) => c.channel === channel).length
    const channelSales = completedOrders(data, month).filter((o) => o.channel === channel)
    return {
      channel,
      enquiries: channelEnquiries,
      completed: channelSales.length,
      revenue: sumAmounts(channelSales),
      conversion: ratio(channelSales.length, channelEnquiries),
    }
  })
}

/** Relative change, or null when the previous value is 0. */
export const percentChange = (current: number, previous: number): number | null =>
  previous === 0 ? null : (current - previous) / previous

/** Change between two ratios (0 to 1), in percentage points. */
export const pointsChange = (current: number, previous: number) => (current - previous) * 100

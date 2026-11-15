import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'
import { DEMO_TODAY } from '@/data/seed'
import type { Customer, DemoDataset, Order, ReorderReminder } from '@/data/types'
import { itemsLabel } from './activity'
// Same demo clock as share consent: the fixed demo date with the real time of day.
import { consentTimestamp as demoTimestamp } from './sharing'

export type WindowStatus = 'overdue' | 'due' | 'upcoming'

export interface RepeatPurchaseRecord {
  customer: Customer
  purchaseCount: number
  averageIntervalDays: number
  lastPurchaseDate: string
  lastOrder: Order
  averageOrderValue: number
  window: { start: string; end: string }
  windowStatus: WindowStatus
}

/** The predicted window spans 80% to 120% of the customer's usual gap between purchases. */
const WINDOW_SPREAD = 0.2

const day = (iso: string) => iso.slice(0, 10)
const shift = (date: string, days: number) => format(addDays(parseISO(date), days), 'yyyy-MM-dd')

/** One record per customer with 2+ completed orders up to the demo date, the same rule as the repeat customer rate. */
export function repeatPurchaseRecords(data: DemoDataset): RepeatPurchaseRecord[] {
  const byCustomer = new Map<string, Order[]>()
  for (const o of data.orders) {
    if (o.status !== 'completed' || day(o.date) > DEMO_TODAY) continue
    byCustomer.set(o.customerId, [...(byCustomer.get(o.customerId) ?? []), o])
  }

  const records: RepeatPurchaseRecord[] = []
  for (const customer of data.customers) {
    const orders = (byCustomer.get(customer.id) ?? []).sort((a, b) => a.date.localeCompare(b.date))
    if (orders.length < 2) continue
    const gaps = orders.slice(1).map((o, i) => differenceInCalendarDays(parseISO(o.date), parseISO(orders[i].date)))
    const interval = Math.max(1, Math.round(gaps.reduce((t, g) => t + g, 0) / gaps.length))
    const lastOrder = orders[orders.length - 1]
    const last = day(lastOrder.date)
    const window = {
      start: shift(last, Math.round(interval * (1 - WINDOW_SPREAD))),
      end: shift(last, Math.round(interval * (1 + WINDOW_SPREAD))),
    }
    records.push({
      customer,
      purchaseCount: orders.length,
      averageIntervalDays: interval,
      lastPurchaseDate: last,
      lastOrder,
      averageOrderValue: Math.round(orders.reduce((t, o) => t + o.amount, 0) / orders.length),
      window,
      windowStatus: window.end < DEMO_TODAY ? 'overdue' : window.start <= DEMO_TODAY ? 'due' : 'upcoming',
    })
  }
  return records.sort(
    (a, b) => a.window.start.localeCompare(b.window.start) || a.customer.name.localeCompare(b.customer.name),
  )
}

export function reminderMessage(data: DemoDataset, record: RepeatPurchaseRecord): string {
  const firstName = record.customer.name.split(' ')[0]
  const days = differenceInCalendarDays(parseISO(DEMO_TODAY), parseISO(record.lastPurchaseDate))
  return `Hi ${firstName}, it's ${data.business.name}. It has been ${days} days since you bought ${itemsLabel(data, record.lastOrder)}. Would you like to order again? Reply here and we will set one aside for you.`
}

export const reminderFor = (data: DemoDataset, customerId: string): ReorderReminder | undefined =>
  data.reorderReminders.find((r) => r.customerId === customerId)

/** Pure, so `now` is passed in. Unchanged when the customer is already reminded or is not a returning customer. */
export function addReminder(data: DemoDataset, customerId: string, now: Date): DemoDataset {
  if (reminderFor(data, customerId)) return data
  const record = repeatPurchaseRecords(data).find((r) => r.customer.id === customerId)
  if (!record) return data
  const reminder: ReorderReminder = { customerId, message: reminderMessage(data, record), remindedAt: demoTimestamp(now) }
  return { ...data, reorderReminders: [...data.reorderReminders, reminder] }
}

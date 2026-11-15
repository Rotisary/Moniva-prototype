import { DEMO_TODAY } from '../data/seed.ts'
import type { DemoDataset } from '../data/types.ts'
import { cashSales, revenue, verifiedDigital } from './metrics.ts'

const COMPLETING = new Set(['verified', 'merchant_confirmed'])

/** Returns a description of every record that breaks the dataset rules. Empty means consistent. */
export function checkDatasetInvariants(data: DemoDataset): string[] {
  const violations: string[] = []
  const orders = new Map(data.orders.map((o) => [o.id, o]))

  const completingByOrder = new Map<string, number>()
  for (const t of data.transactions) {
    if (!COMPLETING.has(t.status)) continue
    if (!t.orderId) {
      violations.push(`${t.reference} is ${t.status} but linked to no order`)
      continue
    }
    const order = orders.get(t.orderId)
    if (!order) violations.push(`${t.reference} links to missing order ${t.orderId}`)
    else if (order.status !== 'completed') violations.push(`${t.reference} is ${t.status} but ${order.id} is ${order.status}`)
    else if (order.amount !== t.amount) violations.push(`${t.reference} amount differs from ${order.id}`)
    completingByOrder.set(t.orderId, (completingByOrder.get(t.orderId) ?? 0) + 1)
  }

  for (const o of data.orders) {
    const completing = completingByOrder.get(o.id) ?? 0
    if (o.status === 'completed' && completing !== 1) {
      violations.push(`${o.id} is completed with ${completing} completing transactions (expected 1)`)
    }
    const itemsTotal = o.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
    if (itemsTotal !== o.amount) violations.push(`${o.id} amount ${o.amount} does not equal its items ${itemsTotal}`)
  }

  for (const t of data.transactions) {
    if (t.status !== 'pending_verification' || !t.orderId) continue
    const status = orders.get(t.orderId)?.status
    if (status !== 'awaiting_verification') violations.push(`${t.reference} is pending but ${t.orderId} is ${status}`)
  }

  const pendingByOrder = new Map<string, number>()
  for (const t of data.transactions) {
    if (t.status === 'pending_verification' && t.orderId) {
      pendingByOrder.set(t.orderId, (pendingByOrder.get(t.orderId) ?? 0) + 1)
    }
  }
  for (const o of data.orders) {
    const pending = pendingByOrder.get(o.id) ?? 0
    if (o.status === 'awaiting_verification' && pending !== 1) {
      violations.push(`${o.id} is awaiting verification with ${pending} pending transactions (expected 1)`)
    }
  }

  const references = new Set<string>()
  for (const t of data.transactions) {
    if (references.has(t.reference)) violations.push(`Duplicate transaction reference ${t.reference}`)
    references.add(t.reference)
  }

  const total = revenue(data)
  const paid = verifiedDigital(data) + cashSales(data)
  if (total !== paid) violations.push(`Revenue ${total} does not equal verified digital plus cash ${paid}`)

  const dated: Array<[string, string]> = [
    ...data.conversations.map((c): [string, string] => [c.id, c.startedAt]),
    ...data.orders.map((o): [string, string] => [o.id, o.date]),
    ...data.transactions.map((t): [string, string] => [t.reference, t.date]),
    ...data.expenses.map((e): [string, string] => [e.id, e.date]),
  ]
  for (const [id, date] of dated) {
    if (date.slice(0, 10) > DEMO_TODAY) violations.push(`${id} is dated after the demo date (${date})`)
  }

  return violations
}

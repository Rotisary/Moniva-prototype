import type { DemoDataset, Order, TransactionStatus } from '@/data/types'
import { CHANNEL_LABELS, PAYMENT_CHANNEL_LABELS } from './format'
import { ACTIVITY_TYPE_LABELS } from './social'

export type ActivityKind = 'order' | 'payment' | 'enquiry'

export interface ActivityEvent {
  id: string
  kind: ActivityKind
  at: string
  customerName: string
  title: string
  meta: string
  amount?: number
  tag?: { label: string; emphasis?: boolean }
  status?: TransactionStatus
}

const INTENT_LABELS = { yes: 'Purchase intent', no: 'No purchase intent', undetermined: 'Intent undetermined' }

const firstName = (name: string) => name.split(' ')[0]

export function itemsLabel(data: DemoDataset, order: Order): string {
  return order.items.map((i) => data.products.find((p) => p.id === i.productId)?.name ?? 'Item').join(' + ')
}

/** Business events derived from conversations, orders, and transactions, newest first. */
export function activityEvents(data: DemoDataset): ActivityEvent[] {
  const customers = new Map(data.customers.map((c) => [c.id, c.name]))
  const products = new Map(data.products.map((p) => [p.id, p.name]))
  const nameOf = (id: string) => customers.get(id) ?? 'Unknown customer'
  const events: ActivityEvent[] = []

  for (const c of data.conversations) {
    const name = nameOf(c.customerId)
    const { extraction: x } = c
    const repeat = x.activityType === 'repeat_purchase_enquiry'
    const product = (x.productId && products.get(x.productId)) || x.productName || 'Unspecified product'
    events.push({
      id: c.id,
      kind: 'enquiry',
      at: c.startedAt,
      customerName: name,
      title: `${repeat ? 'Repeat enquiry' : 'Enquiry'} from ${firstName(name)}`,
      meta: `${CHANNEL_LABELS[c.channel]} · ${product} · ${ACTIVITY_TYPE_LABELS[x.activityType]} · ${INTENT_LABELS[x.purchaseIntent]}`,
      amount: x.price,
      tag: { label: x.customerClassification === 'returning' ? 'Returning' : 'Enquiry' },
    })
  }

  for (const o of data.orders) {
    if (o.status === 'cancelled') continue
    const name = nameOf(o.customerId)
    events.push({
      id: o.id,
      kind: 'order',
      at: o.date,
      customerName: name,
      title: `${firstName(name)} confirmed an order`,
      meta: `${CHANNEL_LABELS[o.channel]} · ${itemsLabel(data, o)} · extracted from chat`,
      amount: o.amount,
      tag: { label: 'Order', emphasis: true },
    })
  }

  for (const t of data.transactions) {
    const name = nameOf(t.customerId)
    const first = firstName(name)
    const titles: Record<TransactionStatus, [string, string]> = {
      pending_verification: [`Receipt received from ${first}`, `${t.reference} · awaiting bank verification`],
      verified: [`Payment from ${first} verified`, `Matched to bank record ${t.reference}`],
      merchant_confirmed: [`Cash sale recorded for ${first}`, `${t.reference} · confirmed by merchant`],
      unmatched: [`Receipt from ${first} not matched`, `${t.reference} · no matching bank record`],
      failed: [`Payment from ${first} failed`, `${t.reference} · ${PAYMENT_CHANNEL_LABELS[t.paymentChannel]}`],
    }
    const [title, meta] = titles[t.status]
    events.push({ id: t.reference, kind: 'payment', at: t.date, customerName: name, title, meta, amount: t.amount, status: t.status })
  }

  return events.sort((a, b) => b.at.localeCompare(a.at))
}

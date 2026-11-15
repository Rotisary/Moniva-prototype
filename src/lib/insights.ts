import type { DemoDataset, ExpenseCategory } from '@/data/types'
import { CHANNEL_LABELS, EXPENSE_CATEGORY_LABELS, formatNaira, formatPercent } from './format'
import {
  channelBreakdown,
  completedOrders,
  expensesTotal,
  openOrders,
  percentChange,
  previousMonth,
  ratio,
  receivables,
  repeatCustomerRate,
  revenue,
  verifiedDigital,
  type MonthKey,
} from './metrics'

export interface CustomerMix {
  new: number
  returning: number
}

/** Customers with a completed order in `month`: returning if they also completed one in an earlier month. */
export function customerMix(data: DemoDataset, month: MonthKey): CustomerMix {
  const buyers = new Set(completedOrders(data, month).map((o) => o.customerId))
  const earlier = new Set(
    data.orders.filter((o) => o.status === 'completed' && o.date.slice(0, 7) < month).map((o) => o.customerId),
  )
  let returning = 0
  for (const id of buyers) if (earlier.has(id)) returning++
  return { new: buyers.size - returning, returning }
}

export interface ProductRevenue {
  productId: string
  name: string
  revenue: number
  sales: number
}

/** Completed-order revenue per product in `month`, highest first. Ties sort by name so the order is stable. */
export function productRevenue(data: DemoDataset, month: MonthKey): ProductRevenue[] {
  const byProduct = new Map<string, ProductRevenue>()
  for (const order of completedOrders(data, month)) {
    for (const item of order.items) {
      const entry = byProduct.get(item.productId) ?? {
        productId: item.productId,
        name: data.products.find((p) => p.id === item.productId)?.name ?? 'Unlisted product',
        revenue: 0,
        sales: 0,
      }
      entry.revenue += item.quantity * item.unitPrice
      entry.sales += 1
      byProduct.set(item.productId, entry)
    }
  }
  return [...byProduct.values()].sort((a, b) => b.revenue - a.revenue || a.name.localeCompare(b.name))
}

export interface Recommendation {
  id: string
  title: string
  body: string
  link?: { to: string; label: string }
}

/** A near-tie between channels is not worth a card. */
const CHANNEL_GAP_POINTS = 5

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
const pct = (r: number) => formatPercent(r, 0)
const sum = (values: number[]) => values.reduce((total, v) => total + v, 0)

/** Fixed rule templates filled with calculated values. A rule appears only when its condition holds. */
export function recommendations(data: DemoDataset, month: MonthKey): Recommendation[] {
  const cards: Recommendation[] = []
  const monthRevenue = revenue(data, month)
  const transactionsLink = { to: '/transactions', label: 'Open Transactions' }

  const pending = data.transactions.filter((t) => t.status === 'pending_verification')
  if (pending.length > 0) {
    cards.push({
      id: 'verify_receipts',
      title: `Verify ${plural(pending.length, 'pending receipt', 'pending receipts')}`,
      body: `${formatNaira(sum(pending.map((t) => t.amount)))} in customer receipts is waiting for a bank match. Verifying them moves this money into verified digital volume, which is ${pct(ratio(verifiedDigital(data, month), monthRevenue))} of this month's revenue today.`,
      link: transactionsLink,
    })
  }

  const open = openOrders(data)
  if (open.length > 0) {
    cards.push({
      id: 'follow_up_orders',
      title: `Follow up on ${plural(open.length, 'open order', 'open orders')}`,
      body: `${formatNaira(receivables(data))} is confirmed or awaiting payment. It counts as receivables, not revenue, until the customers pay.`,
      link: transactionsLink,
    })
  }

  const [top] = productRevenue(data, month)
  if (top) {
    cards.push({
      id: 'top_product',
      title: `${top.name} is your top seller`,
      body: `${top.name} brought in ${formatNaira(top.revenue)} from ${plural(top.sales, 'sale', 'sales')} this month, ${pct(ratio(top.revenue, monthRevenue))} of revenue. Keep it in stock.`,
    })
  }

  const channels = channelBreakdown(data, month)
  if (channels.every((c) => c.enquiries > 0)) {
    const [stronger, weaker] = [...channels].sort((a, b) => b.conversion - a.conversion)
    if ((stronger.conversion - weaker.conversion) * 100 >= CHANNEL_GAP_POINTS) {
      const strong = CHANNEL_LABELS[stronger.channel]
      const weak = CHANNEL_LABELS[weaker.channel]
      cards.push({
        id: 'channel_gap',
        title: `${strong} converts better than ${weak}`,
        body: `${strong} turns ${pct(stronger.conversion)} of enquiries into sales, against ${pct(weaker.conversion)} on ${weak}. Look at how ${weak} enquiries are answered.`,
        link: { to: '/social-commerce', label: 'Open Social Commerce' },
      })
    }
  }

  const prev = previousMonth(month)
  const expenseChange = percentChange(expensesTotal(data, month), expensesTotal(data, prev))
  const revenueChange = percentChange(monthRevenue, revenue(data, prev))
  // Only when expenses actually rose, so the "growing" wording stays true.
  if (expenseChange !== null && revenueChange !== null && expenseChange > 0 && expenseChange > revenueChange) {
    const byCategory = new Map<ExpenseCategory, number>()
    for (const e of data.expenses) {
      if (e.date.startsWith(month)) byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount)
    }
    const [largest] = [...byCategory.entries()].sort((a, b) => b[1] - a[1])
    if (largest) {
      cards.push({
        id: 'expense_growth',
        title: 'Expenses are growing faster than revenue',
        body: `Expenses rose ${formatPercent(expenseChange)} against revenue growth of ${formatPercent(revenueChange)}. ${EXPENSE_CATEGORY_LABELS[largest[0]]} was the largest cost this month at ${formatNaira(largest[1])}.`,
      })
    }
  }

  const mix = customerMix(data, month)
  if (mix.returning > 0) {
    cards.push({
      id: 'returning_customers',
      title: `${plural(mix.returning, 'returning customer', 'returning customers')} bought this month`,
      body: `Your repeat customer rate is ${formatPercent(repeatCustomerRate(data, month))}. Returning buyers are worth reminding when their usual reorder time comes round.`,
      link: { to: '/repeat-customers', label: 'Open Repeat Customers' },
    })
  }

  return cards
}

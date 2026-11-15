import { differenceInCalendarDays, differenceInMonths, parseISO } from 'date-fns'
import { DEMO_TODAY } from '@/data/seed'
import type { DemoDataset } from '@/data/types'
import { formatNaira, formatPercent } from './format'
import {
  CURRENT_MONTH,
  expensesTotal,
  lastMonths,
  monthLabel,
  openOrders,
  ratio,
  receivables,
  type MonthKey,
} from './metrics'

/** The profile covers the 12 months ending at the demo date. */
export const PROFILE_MONTHS: MonthKey[] = lastMonths(12)

export const operatingMonths = (data: DemoDataset) =>
  differenceInMonths(parseISO(DEMO_TODAY), parseISO(data.business.operatingSince))

export interface ProfileMonth {
  month: MonthKey
  label: string
  verified: number
  cash: number
  revenue: number
  expenses: number
}

export interface ProfileSummary {
  months: ProfileMonth[]
  revenue: number
  verified: number
  cash: number
  expenses: number
  profit: number
  margin: number
  mean: number
  cv: number
  lowest: ProfileMonth
  highest: ProfileMonth
  salesCount: number
  avgSalesPerMonth: number
  paymentsPerWeek: number
  payers: number
  returning: number
  repeatRate: number
  completeness: number
  pendingReceipts: number
  receivables: number
  openOrderCount: number
  operatingMonths: number
}

const sum = (values: number[]) => values.reduce((total, v) => total + v, 0)

/**
 * 12-month profile figures. Each month's revenue is split by how its completed orders were paid
 * (bank-verified or merchant-confirmed cash), so verified + cash always equals revenue.
 */
export function profileSummary(data: DemoDataset): ProfileSummary {
  const inPeriod = (date: string) => PROFILE_MONTHS.includes(date.slice(0, 7))
  const completingStatus = new Map<string, string>()
  for (const t of data.transactions) {
    if (t.orderId && (t.status === 'verified' || t.status === 'merchant_confirmed')) {
      completingStatus.set(t.orderId, t.status)
    }
  }
  const completed = data.orders.filter((o) => o.status === 'completed' && inPeriod(o.date))

  const months = PROFILE_MONTHS.map((month): ProfileMonth => {
    const orders = completed.filter((o) => o.date.startsWith(month))
    const verified = sum(orders.filter((o) => completingStatus.get(o.id) === 'verified').map((o) => o.amount))
    const revenue = sum(orders.map((o) => o.amount))
    return { month, label: monthLabel(month), verified, cash: revenue - verified, revenue, expenses: expensesTotal(data, month) }
  })

  const revenue = sum(months.map((m) => m.revenue))
  const verified = sum(months.map((m) => m.verified))
  const expenses = sum(months.map((m) => m.expenses))
  const mean = revenue / months.length
  const sd = Math.sqrt(sum(months.map((m) => (m.revenue - mean) ** 2)) / months.length)
  const byRevenue = [...months].sort((a, b) => a.revenue - b.revenue)

  const ordersByCustomer = new Map<string, number>()
  for (const o of data.orders) {
    if (o.status !== 'completed' || o.date.slice(0, 7) > CURRENT_MONTH) continue
    ordersByCustomer.set(o.customerId, (ordersByCustomer.get(o.customerId) ?? 0) + 1)
  }
  const payers = ordersByCustomer.size
  const returning = [...ordersByCustomer.values()].filter((n) => n >= 2).length

  const payments = data.transactions.filter(
    (t) => (t.status === 'verified' || t.status === 'merchant_confirmed') && inPeriod(t.date),
  ).length
  const days = differenceInCalendarDays(parseISO(DEMO_TODAY), parseISO(`${PROFILE_MONTHS[0]}-01`)) + 1

  return {
    months,
    revenue,
    verified,
    cash: revenue - verified,
    expenses,
    profit: revenue - expenses,
    margin: ratio(revenue - expenses, revenue),
    mean,
    cv: ratio(sd, mean),
    lowest: byRevenue[0],
    highest: byRevenue[byRevenue.length - 1],
    salesCount: completed.length,
    avgSalesPerMonth: completed.length / months.length,
    paymentsPerWeek: ratio(payments, days / 7),
    payers,
    returning,
    repeatRate: ratio(returning, payers),
    completeness: ratio(verified, revenue),
    pendingReceipts: data.transactions.filter((t) => t.status === 'pending_verification').length,
    receivables: receivables(data),
    openOrderCount: openOrders(data).length,
    operatingMonths: operatingMonths(data),
  }
}

/** Shown with the indicators on screen, in the report, and to institutions. Exact wording from the project plan. */
export const HEALTH_DISCLAIMER =
  "These indicators summarise Tolu Fashion House's recorded business activity in Moniva. They are not a credit score and do not predict loan repayment. Financial institutions make their own assessments."

export type HealthLabel = 'Strong' | 'Moderate' | 'Developing'

export interface HealthIndicator {
  id: string
  name: string
  score: number
  label: HealthLabel
  explanation: string
  formula: string
}

const clampScore = (x: number) => Math.min(100, Math.max(0, Math.round(x)))

export const healthLabel = (score: number): HealthLabel =>
  score >= 75 ? 'Strong' : score >= 50 ? 'Moderate' : 'Developing'

const pct = (ratioValue: number) => formatPercent(ratioValue, 0)

/** The five Financial Health Overview indicators, each scored 0 to 100. There is deliberately no overall score. */
export function healthIndicators(s: ProfileSummary): HealthIndicator[] {
  const empty = s.revenue === 0
  const indicator = (id: string, name: string, raw: number, explanation: string, formula: string): HealthIndicator => {
    const score = empty ? 0 : clampScore(raw)
    return {
      id,
      name,
      score,
      label: healthLabel(score),
      explanation: empty ? 'Not enough recorded activity yet.' : explanation,
      formula,
    }
  }

  return [
    indicator(
      'revenue-consistency',
      'Revenue consistency',
      100 - s.cv * 200,
      `Monthly revenue ranged from ${formatNaira(s.lowest.revenue)} (${s.lowest.label}) to ${formatNaira(s.highest.revenue)} (${s.highest.label}), varying about ${pct(s.cv)} around its ${formatNaira(Math.round(s.mean))} average.`,
      '100 − (variation of monthly revenue × 200)',
    ),
    indicator(
      'business-activity',
      'Business activity',
      (s.avgSalesPerMonth / 30) * 100,
      `An average of ${s.avgSalesPerMonth.toFixed(1)} completed sales a month (${s.salesCount} over 12 months). This demo uses 30 a month as its benchmark.`,
      'Average completed sales per month ÷ 30 × 100',
    ),
    indicator(
      'cash-flow',
      'Cash-flow indicators',
      (s.margin / 0.35) * 100,
      `${formatNaira(s.revenue)} revenue against ${formatNaira(s.expenses)} expenses leaves an estimated ${pct(s.margin)} operating margin. ${formatNaira(s.receivables)} is still owed by customers.`,
      'Estimated operating margin ÷ 35% × 100',
    ),
    indicator(
      'customer-retention',
      'Customer retention',
      (s.repeatRate / 0.5) * 100,
      `${pct(s.repeatRate)} of paying customers bought more than once (${s.returning} of ${s.payers}).`,
      'Repeat customer rate ÷ 50% × 100',
    ),
    indicator(
      'record-completeness',
      'Financial record completeness',
      s.completeness * 100,
      `${pct(s.completeness)} of recorded revenue is matched to trusted bank records. The rest (${formatNaira(s.cash)}) is cash confirmed by the merchant. ${s.pendingReceipts} receipts await verification.`,
      'Bank-verified share of recorded revenue × 100',
    ),
  ]
}

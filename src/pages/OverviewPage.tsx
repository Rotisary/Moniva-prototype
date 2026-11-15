import { MetricCard, type DeltaDirection } from '@/components/moniva/MetricCard'
import { ChannelPerformance } from '@/components/overview/ChannelPerformance'
import { RecentActivity, RecentTransactions } from '@/components/overview/RecentLists'
import { MonthlyRevenueChart, RevenueExpensesChart } from '@/components/overview/RevenueCharts'
import { formatCount, formatDelta, formatNairaCompact, formatPercent } from '@/lib/format'
import {
  cashSales,
  cashTransactions,
  completedOrders,
  CURRENT_MONTH,
  enquiries,
  enquiryToSale,
  monthLabel,
  openOrders,
  percentChange,
  pointsChange,
  previousMonth,
  receivables,
  repeatCustomerRate,
  revenue,
  verifiedDigital,
  verifiedDigitalTransactions,
} from '@/lib/metrics'
import { useDemoData } from '@/store/demo-data-context'

const direction = (change: number | null): DeltaDirection =>
  change === null || Math.abs(change) < 0.0005 ? 'flat' : change > 0 ? 'up' : 'down'

const amountDelta = (current: number, previous: number) => {
  const change = percentChange(current, previous)
  return { text: formatDelta(change, 'percent'), direction: direction(change) }
}

const rateDelta = (current: number, previous: number) => {
  const change = pointsChange(current, previous)
  return { text: formatDelta(change, 'points'), direction: direction(change / 100) }
}

export function OverviewPage() {
  const { data } = useDemoData()
  const month = CURRENT_MONTH
  const prev = previousMonth(month)
  const prevName = monthLabel(prev)

  const rev = revenue(data, month)
  const prevRev = revenue(data, prev)
  const sales = completedOrders(data, month).length
  const prevSales = completedOrders(data, prev).length
  const enquiryCount = enquiries(data, month).length
  const prevEnquiryCount = enquiries(data, prev).length
  const conversion = enquiryToSale(data, month)
  const repeatRate = repeatCustomerRate(data, month)
  const open = openOrders(data)

  return (
    <div className="flex flex-col gap-4">
      <section aria-label="Money this month" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          variant="inverse"
          label="Total recorded revenue"
          value={formatNairaCompact(rev)}
          delta={amountDelta(rev, prevRev)}
          footnote={`vs ${formatNairaCompact(prevRev)} in ${prevName}`}
        />
        <MetricCard
          variant="tint-1"
          label="Verified digital payments"
          value={formatNairaCompact(verifiedDigital(data, month))}
          delta={amountDelta(verifiedDigital(data, month), verifiedDigital(data, prev))}
          footnote={`${verifiedDigitalTransactions(data, month).length} payments matched to bank records`}
        />
        <MetricCard
          variant="tint-2"
          label="Recorded cash sales"
          value={formatNairaCompact(cashSales(data, month))}
          delta={amountDelta(cashSales(data, month), cashSales(data, prev))}
          footnote={`${cashTransactions(data, month).length} merchant-confirmed sales`}
        />
        <MetricCard
          variant="tint-3"
          label="Outstanding receivables"
          value={formatNairaCompact(receivables(data))}
          footnote={`${open.length} orders awaiting payment · not counted as revenue`}
        />
      </section>

      <section aria-label="Commerce this month" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Completed orders"
          value={formatCount(sales)}
          delta={amountDelta(sales, prevSales)}
          footnote={`vs ${prevSales} in ${prevName}`}
        />
        <MetricCard
          label="Customer enquiries"
          value={formatCount(enquiryCount)}
          delta={amountDelta(enquiryCount, prevEnquiryCount)}
          footnote={`vs ${prevEnquiryCount} in ${prevName}`}
        />
        <MetricCard
          label="Enquiry-to-sale conversion"
          value={formatPercent(conversion)}
          delta={rateDelta(conversion, enquiryToSale(data, prev))}
          footnote={`${sales} sales from ${enquiryCount} enquiries`}
        />
        <MetricCard
          label="Repeat customer rate"
          value={formatPercent(repeatRate)}
          delta={rateDelta(repeatRate, repeatCustomerRate(data, prev))}
          footnote="of paying customers have bought 2+ times"
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-12">
        <MonthlyRevenueChart className="lg:col-span-8" />
        <ChannelPerformance className="lg:col-span-4" />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <RevenueExpensesChart className="lg:col-span-5" />
        <RecentTransactions className="lg:col-span-7" />
      </div>

      <RecentActivity />
    </div>
  )
}

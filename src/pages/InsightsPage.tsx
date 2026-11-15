import { useMemo } from 'react'
import { RecommendationCard } from '@/components/insights/RecommendationCard'
import { MetricCard } from '@/components/moniva/MetricCard'
import { Panel } from '@/components/moniva/Panel'
import { SimulatedNotice } from '@/components/moniva/SimulatedNotice'
import { MonthlyRevenueChart } from '@/components/overview/RevenueCharts'
import { amountDelta, formatCount, formatNairaCompact, formatPercent, rateDelta } from '@/lib/format'
import { customerMix, recommendations } from '@/lib/insights'
import {
  averageOrderValue,
  cashSales,
  completedOrders,
  CURRENT_MONTH,
  enquiries,
  enquiryToOrder,
  expensesTotal,
  monthLabel,
  nonCancelledOrders,
  openOrders,
  operatingProfit,
  orderToPayment,
  previousMonth,
  receivables,
  revenue,
  verifiedDigital,
} from '@/lib/metrics'
import { useDemoData } from '@/store/demo-data-context'

const MONTH = CURRENT_MONTH
const PREV = previousMonth(MONTH)
const PREV_NAME = monthLabel(PREV)

export function InsightsPage() {
  const { data } = useDemoData()
  const cards = useMemo(() => recommendations(data, MONTH), [data])

  const count = (current: number, previous: number) => ({
    value: formatCount(current),
    delta: amountDelta(current, previous),
    footnote: `vs ${formatCount(previous)} in ${PREV_NAME}`,
  })
  const money = (current: number, previous: number) => ({
    value: formatNairaCompact(current),
    delta: amountDelta(current, previous),
    footnote: `vs ${formatNairaCompact(previous)} in ${PREV_NAME}`,
  })
  const rate = (current: number, previous: number) => ({
    value: formatPercent(current),
    delta: rateDelta(current, previous),
    footnote: `vs ${formatPercent(previous)} in ${PREV_NAME}`,
  })

  const mix = customerMix(data, MONTH)
  const prevMix = customerMix(data, PREV)
  const open = openOrders(data)

  return (
    <div className="flex flex-col gap-4">
      <section aria-labelledby="commerce-heading" className="flex flex-col gap-3">
        <h2 id="commerce-heading" className="text-lg font-semibold">
          Commerce performance · {monthLabel(MONTH, 'long')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            variant="inverse"
            label="Customer enquiries"
            {...count(enquiries(data, MONTH).length, enquiries(data, PREV).length)}
          />
          <MetricCard
            label="Confirmed orders"
            {...count(nonCancelledOrders(data, MONTH).length, nonCancelledOrders(data, PREV).length)}
          />
          <MetricCard
            label="Completed sales"
            {...count(completedOrders(data, MONTH).length, completedOrders(data, PREV).length)}
          />
          <MetricCard label="Average order value" {...money(averageOrderValue(data, MONTH), averageOrderValue(data, PREV))} />
          <MetricCard label="Enquiry-to-order rate" {...rate(enquiryToOrder(data, MONTH), enquiryToOrder(data, PREV))} />
          <MetricCard label="Order-to-payment rate" {...rate(orderToPayment(data, MONTH), orderToPayment(data, PREV))} />
          <MetricCard
            className="sm:col-span-2"
            label="New vs returning customers"
            value={`${mix.new} new · ${mix.returning} returning`}
            footnote={`${prevMix.new} new · ${prevMix.returning} returning in ${PREV_NAME}`}
          />
        </div>
      </section>

      <section aria-labelledby="financial-heading" className="flex flex-col gap-3">
        <h2 id="financial-heading" className="text-lg font-semibold">
          Financial performance · {monthLabel(MONTH, 'long')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard variant="inverse" label="Recorded revenue" {...money(revenue(data, MONTH), revenue(data, PREV))} />
          <MetricCard
            variant="tint-1"
            label="Verified digital volume"
            {...money(verifiedDigital(data, MONTH), verifiedDigital(data, PREV))}
          />
          <MetricCard variant="tint-2" label="Recorded cash sales" {...money(cashSales(data, MONTH), cashSales(data, PREV))} />
          <MetricCard
            variant="tint-3"
            label="Business expenses"
            {...money(expensesTotal(data, MONTH), expensesTotal(data, PREV))}
          />
          <MetricCard
            label="Estimated operating profit"
            {...money(operatingProfit(data, MONTH), operatingProfit(data, PREV))}
          />
          <MetricCard
            label="Outstanding receivables"
            value={formatNairaCompact(receivables(data))}
            footnote={`${open.length} orders awaiting payment · not counted as revenue`}
          />
        </div>
      </section>

      <MonthlyRevenueChart />

      <Panel title="Business insights">
        <SimulatedNotice>
          These recommendations are generated from fixed rules applied to the available sample data. They are not
          financial advice.
        </SimulatedNotice>
        {cards.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recommendations right now. They appear as your records change.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <RecommendationCard key={card.id} recommendation={card} />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}

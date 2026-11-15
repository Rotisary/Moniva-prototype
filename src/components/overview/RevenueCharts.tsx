import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/moniva/ChartCard'
import { ChartTooltip } from '@/components/moniva/ChartTooltip'
import { Money } from '@/components/moniva/Money'
import { formatNairaCompact } from '@/lib/format'
import { CURRENT_MONTH, lastMonths, monthLabel, monthlySeries, operatingProfit } from '@/lib/metrics'
import { useDemoData } from '@/store/demo-data-context'

const AXIS_TICK = { fill: 'var(--muted-foreground)', fontSize: 12 }

function Axes() {
  return (
    <>
      <CartesianGrid vertical={false} stroke="var(--border)" />
      <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS_TICK} />
      <YAxis tickFormatter={formatNairaCompact} tickLine={false} axisLine={false} tick={AXIS_TICK} width={60} />
      <Tooltip content={ChartTooltip} cursor={{ fill: 'var(--tint-1)' }} />
    </>
  )
}

export function MonthlyRevenueChart({ className }: { className?: string }) {
  const { data } = useDemoData()
  const series = monthlySeries(data, lastMonths(12))
  return (
    <ChartCard
      title="Monthly revenue"
      className={className}
      legend={[
        { label: 'This month', color: 'chart-1' },
        { label: 'Earlier months', color: 'chart-2' },
      ]}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            {Axes()}
            <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]} maxBarSize={28}>
              {series.map((point) => (
                <Cell key={point.month} fill={point.month === CURRENT_MONTH ? 'var(--chart-1)' : 'var(--chart-2)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

export function RevenueExpensesChart({ className }: { className?: string }) {
  const { data } = useDemoData()
  const series = monthlySeries(data, lastMonths(6))
  return (
    <ChartCard
      title="Revenue vs expenses"
      className={className}
      legend={[
        { label: 'Revenue', color: 'chart-1' },
        { label: 'Expenses', color: 'chart-2' },
      ]}
    >
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barGap={4}>
            {Axes()}
            <Bar dataKey="revenue" name="Revenue" fill="var(--chart-1)" radius={[6, 6, 0, 0]} maxBarSize={14} />
            <Bar dataKey="expenses" name="Expenses" fill="var(--chart-2)" radius={[6, 6, 0, 0]} maxBarSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="rounded-xl bg-tint-1 px-3.5 py-2.5 text-xs text-muted-foreground">
        Estimated operating profit in {monthLabel(CURRENT_MONTH, 'long')}:{' '}
        <Money amount={operatingProfit(data, CURRENT_MONTH)} className="font-semibold text-foreground" /> (revenue
        minus expenses)
      </p>
    </ChartCard>
  )
}

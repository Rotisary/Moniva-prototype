import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/moniva/ChartCard'
import { ChartTooltip } from '@/components/moniva/ChartTooltip'
import { formatNairaCompact } from '@/lib/format'
import type { ProfileMonth } from '@/lib/profile'

const AXIS_TICK = { fill: 'var(--muted-foreground)', fontSize: 12 }

export function RevenueHistoryChart({ months }: { months: ProfileMonth[] }) {
  return (
    <ChartCard
      title="Monthly revenue history"
      className="break-inside-avoid"
      legend={[
        { label: 'Bank-verified', color: 'chart-1' },
        { label: 'Cash (merchant-confirmed)', color: 'chart-2' },
      ]}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={months} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS_TICK} />
            <YAxis tickFormatter={formatNairaCompact} tickLine={false} axisLine={false} tick={AXIS_TICK} width={60} />
            <Tooltip content={(props) => <ChartTooltip {...props} showTotal />} cursor={{ fill: 'var(--tint-1)' }} />
            <Bar dataKey="verified" name="Bank-verified" stackId="revenue" fill="var(--chart-1)" maxBarSize={28} isAnimationActive={false} />
            <Bar
              dataKey="cash"
              name="Cash"
              stackId="revenue"
              fill="var(--chart-2)"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

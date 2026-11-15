import { Progress } from '@base-ui/react/progress'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { Panel } from '@/components/moniva/Panel'
import { CHANNEL_LABELS, formatNairaCompact, formatPercent } from '@/lib/format'
import { channelBreakdown, CURRENT_MONTH } from '@/lib/metrics'
import { cn } from '@/lib/utils'
import { useDemoData } from '@/store/demo-data-context'

const FILL = { whatsapp: 'var(--chart-1)', instagram: 'var(--chart-2)' }
const DOT = { whatsapp: 'bg-chart-1', instagram: 'bg-chart-2' }

export function ChannelPerformance({ className }: { className?: string }) {
  const { data } = useDemoData()
  const stats = channelBreakdown(data, CURRENT_MONTH)
  const totalSales = stats.reduce((sum, s) => sum + s.completed, 0)

  return (
    <Panel title="Channel performance" className={className}>
      <div className="relative mx-auto size-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={stats}
              dataKey="completed"
              nameKey="channel"
              innerRadius="68%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={false}
            >
              {stats.map((s) => (
                <Cell key={s.channel} fill={FILL[s.channel]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 grid place-content-center text-center">
          <span className="text-3xl font-bold tabular-nums">{totalSales}</span>
          <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Completed sales</span>
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {stats.map((s) => (
          <li key={s.channel} className="rounded-xl bg-background p-3">
            <div className="flex items-center gap-2 text-sm">
              <span aria-hidden className={cn('size-2 rounded-full', DOT[s.channel])} />
              <span className="font-semibold">{CHANNEL_LABELS[s.channel]}</span>
              <span className="ml-auto tabular-nums">
                {s.completed} sales · {formatNairaCompact(s.revenue)}
              </span>
            </div>
            <Progress.Root value={s.conversion * 100} className="mt-2 flex items-center gap-3">
              <Progress.Label className="sr-only">{CHANNEL_LABELS[s.channel]} enquiry-to-sale conversion</Progress.Label>
              <Progress.Track className="h-2 flex-1 overflow-hidden rounded-full bg-tint-2">
                <Progress.Indicator className="h-full rounded-full bg-primary" />
              </Progress.Track>
              <span className="w-28 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                {formatPercent(s.conversion)} of {s.enquiries}
              </span>
            </Progress.Root>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">Bars show enquiry-to-sale conversion for this month.</p>
    </Panel>
  )
}

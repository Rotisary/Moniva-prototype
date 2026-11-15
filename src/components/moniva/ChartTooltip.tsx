import type { TooltipContentProps } from 'recharts'
import { formatNaira } from '@/lib/format'

/** Recharts tooltip in the design-system style. Values are naira amounts. */
export function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs">
      {label !== undefined && <p className="mb-1 font-semibold">{label}</p>}
      {payload.map((item) => (
        <p key={String(item.dataKey)} className="flex justify-between gap-4">
          <span className="text-muted-foreground">{item.name}</span>
          <span className="font-semibold tabular-nums">{formatNaira(Number(item.value))}</span>
        </p>
      ))}
    </div>
  )
}

import type { TooltipContentProps } from 'recharts'
import { formatNaira } from '@/lib/format'

/** Recharts tooltip in the design-system style. Values are naira amounts. `showTotal` adds a sum line for stacked bars. */
export function ChartTooltip({ active, payload, label, showTotal = false }: TooltipContentProps & { showTotal?: boolean }) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((sum, item) => sum + Number(item.value ?? 0), 0)
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs">
      {label !== undefined && <p className="mb-1 font-semibold">{label}</p>}
      {payload.map((item) => (
        <p key={String(item.dataKey)} className="flex justify-between gap-4">
          <span className="text-muted-foreground">{item.name}</span>
          <span className="font-semibold tabular-nums">{formatNaira(Number(item.value))}</span>
        </p>
      ))}
      {showTotal && (
        <p className="mt-1 flex justify-between gap-4 border-t border-border pt-1">
          <span className="font-semibold">Total</span>
          <span className="font-semibold tabular-nums">{formatNaira(total)}</span>
        </p>
      )}
    </div>
  )
}

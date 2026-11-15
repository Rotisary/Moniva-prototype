import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { DeltaDirection } from '@/lib/format'
import { cn } from '@/lib/utils'

export type MetricVariant = 'tint-1' | 'tint-2' | 'tint-3' | 'inverse' | 'plain'

const VARIANTS: Record<MetricVariant, string> = {
  'tint-1': 'bg-tint-1',
  'tint-2': 'bg-tint-2',
  'tint-3': 'bg-tint-3',
  inverse: 'bg-primary text-primary-foreground',
  plain: 'bg-card',
}

// Muted grey fails contrast on tint-2 and tint-3, so footnotes stay black there.
const FOOTNOTE: Record<MetricVariant, string> = {
  'tint-1': 'text-muted-foreground',
  'tint-2': '',
  'tint-3': '',
  inverse: 'text-tint-3',
  plain: 'text-muted-foreground',
}

const ARROWS = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus }

interface MetricCardProps {
  label: string
  value: string
  variant?: MetricVariant
  /** A formatted change against the previous period, for example `+8.4%`. */
  delta?: { text: string; direction: DeltaDirection }
  footnote?: string
  className?: string
}

export function MetricCard({ label, value, variant = 'plain', delta, footnote, className }: MetricCardProps) {
  const Arrow = delta ? ARROWS[delta.direction] : null
  return (
    <div className={cn('flex min-h-34 flex-col gap-3 rounded-2xl p-5', VARIANTS[variant], className)}>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-4xl font-semibold tracking-tight tabular-nums">{value}</span>
      {(delta || footnote) && (
        <span className="mt-auto flex flex-wrap items-center gap-x-1.5 text-xs">
          {delta && Arrow && (
            <span className="inline-flex items-center gap-0.5 font-semibold tabular-nums">
              <Arrow aria-hidden className="size-3" strokeWidth={2.5} />
              {delta.text}
            </span>
          )}
          {footnote && <span className={FOOTNOTE[variant]}>{footnote}</span>}
        </span>
      )}
    </div>
  )
}

import { cn } from '@/lib/utils'
import { formatNaira, formatNairaCompact } from '@/lib/format'

interface MoneyProps {
  amount: number
  compact?: boolean
  className?: string
}

export function Money({ amount, compact = false, className }: MoneyProps) {
  return (
    <span className={cn('tabular-nums', className)}>
      {compact ? formatNairaCompact(amount) : formatNaira(amount)}
    </span>
  )
}

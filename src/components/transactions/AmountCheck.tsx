import { formatNaira } from '@/lib/format'
import { amountComparison } from '@/lib/reconciliation'
import { cn } from '@/lib/utils'

/** Receipt amount against order amount. Mismatches are shown in red with the difference. */
export function AmountCheck({ receiptAmount, orderAmount }: { receiptAmount: number; orderAmount: number }) {
  const result = amountComparison(receiptAmount, orderAmount)
  const message =
    result.kind === 'match'
      ? 'Amounts match.'
      : result.kind === 'short'
        ? `Amount mismatch: the receipt is ${formatNaira(result.difference)} less than the order.`
        : `Amount mismatch: the receipt is ${formatNaira(result.difference)} more than the order.`

  return (
    <div
      className={cn(
        'rounded-xl border p-3 text-sm',
        result.kind === 'match' ? 'border-border bg-background' : 'border-destructive text-destructive',
      )}
    >
      <div className="grid grid-cols-2 gap-2 tabular-nums">
        <span>
          Receipt <strong className="block text-base text-foreground">{formatNaira(receiptAmount)}</strong>
        </span>
        <span>
          Order <strong className="block text-base text-foreground">{formatNaira(orderAmount)}</strong>
        </span>
      </div>
      <p className="mt-2 font-semibold">{message}</p>
    </div>
  )
}

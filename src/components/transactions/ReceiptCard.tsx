import { CircleCheck } from 'lucide-react'
import { Tag } from '@/components/moniva/Tag'
import { DEMO_BANK } from '@/data/sample-receipts'
import { formatDateTime, formatNaira } from '@/lib/format'

interface ReceiptCardProps {
  sender: string
  reference: string
  amount: number
  date: string
  label: string
  fileName?: string
}

/** A simulated bank transfer receipt from the fictional Demo Bank. */
export function ReceiptCard({ sender, reference, amount, date, label, fileName }: ReceiptCardProps) {
  const rows: Array<[string, string]> = [
    ['Sender', sender],
    ['Beneficiary', 'Tolu Fashion House'],
    ['Reference', reference],
    ['Date', formatDateTime(date)],
  ]
  return (
    <div className="rounded-2xl border border-dashed border-chart-4 bg-tint-1 p-4">
      <div className="flex items-center gap-2">
        <span className="font-semibold">{DEMO_BANK}</span>
        <Tag className="ml-auto">{label}</Tag>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <CircleCheck aria-hidden className="size-3.5" />
        Transfer successful (as shown on the receipt)
      </p>
      <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{formatNaira(amount)}</p>
      <dl className="mt-3 grid gap-1.5 text-sm">
        {rows.map(([term, value]) => (
          <div key={term} className="flex gap-3">
            <dt className="w-24 shrink-0 text-muted-foreground">{term}</dt>
            <dd className="min-w-0 font-medium break-words">{value}</dd>
          </div>
        ))}
      </dl>
      {fileName && <p className="mt-3 text-xs text-muted-foreground">Uploaded file: {fileName} (image not stored)</p>}
    </div>
  )
}

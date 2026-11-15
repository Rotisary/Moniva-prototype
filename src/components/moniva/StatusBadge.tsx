import { BadgeCheck, CircleDashed, Clock, Sigma, Unlink, UserCheck, CircleX, type LucideIcon } from 'lucide-react'
import type { TransactionStatus, VerificationLabel } from '@/data/types'
import { cn } from '@/lib/utils'

export type BadgeStatus = TransactionStatus | VerificationLabel

const STYLES: Record<BadgeStatus, { label: string; icon: LucideIcon; className: string }> = {
  verified: { label: 'Verified', icon: BadgeCheck, className: 'bg-primary text-primary-foreground' },
  merchant_confirmed: { label: 'Merchant-confirmed', icon: UserCheck, className: 'border-foreground bg-card' },
  pending_verification: { label: 'Pending verification', icon: Clock, className: 'bg-tint-3' },
  unverified: {
    label: 'Unverified',
    icon: CircleDashed,
    className: 'border-dashed border-chart-4 bg-card text-muted-foreground',
  },
  unmatched: { label: 'Unmatched', icon: Unlink, className: 'border-foreground bg-card' },
  inferred: { label: 'Inferred', icon: Sigma, className: 'bg-tint-2' },
  failed: { label: 'Failed', icon: CircleX, className: 'border-destructive bg-card text-destructive' },
}

export function StatusBadge({ status, className }: { status: BadgeStatus; className?: string }) {
  const { label, icon: Icon, className: style } = STYLES[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-[10px] font-semibold tracking-wide whitespace-nowrap uppercase',
        style,
        className,
      )}
    >
      <Icon aria-hidden className="size-3" strokeWidth={2.5} />
      {label}
    </span>
  )
}

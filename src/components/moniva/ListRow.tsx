import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Initials } from './Initials'

interface ListRowProps {
  /** Person shown in the initials circle. */
  name: string
  title: ReactNode
  meta?: ReactNode
  badge?: ReactNode
  amount?: ReactNode
  className?: string
}

export function ListRow({ name, title, meta, badge, amount, className }: ListRowProps) {
  return (
    <li className={cn('flex items-center gap-3 border-b border-border py-2.5 last:border-b-0', className)}>
      <Initials name={name} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{title}</p>
        {meta && <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</p>}
      </div>
      {badge && <div className="shrink-0">{badge}</div>}
      {amount !== undefined && <div className="w-24 shrink-0 text-right font-semibold tabular-nums">{amount}</div>}
    </li>
  )
}

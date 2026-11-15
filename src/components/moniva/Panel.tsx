import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PanelProps {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

/** A white design-system card with a title row. Overrides the shadcn Card ring, since cards have no border. */
export function Panel({ title, action, children, className }: PanelProps) {
  return (
    <Card className={cn('gap-4 rounded-2xl p-5 ring-0', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action && <div className="ml-auto flex flex-wrap items-center gap-3">{action}</div>}
      </div>
      {children}
    </Card>
  )
}

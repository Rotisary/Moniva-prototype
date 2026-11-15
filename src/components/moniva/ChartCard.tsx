import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Panel } from './Panel'

export type ChartColor = 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5'

const DOT: Record<ChartColor, string> = {
  'chart-1': 'bg-chart-1',
  'chart-2': 'bg-chart-2',
  'chart-3': 'bg-chart-3',
  'chart-4': 'bg-chart-4',
  'chart-5': 'bg-chart-5',
}

interface ChartCardProps {
  title: string
  legend?: Array<{ label: string; color: ChartColor }>
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function ChartCard({ title, legend, action, children, className }: ChartCardProps) {
  const legendList = legend && (
    <ul className="flex flex-wrap gap-3.5">
      {legend.map((item) => (
        <li
          key={item.label}
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
        >
          <span aria-hidden className={cn('size-2 rounded-full', DOT[item.color])} />
          {item.label}
        </li>
      ))}
    </ul>
  )
  return (
    <Panel
      title={title}
      className={className}
      action={
        legend || action ? (
          <>
            {legendList}
            {action}
          </>
        ) : undefined
      }
    >
      {children}
    </Panel>
  )
}

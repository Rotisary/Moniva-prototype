import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TagProps {
  children: ReactNode
  emphasis?: boolean
  className?: string
}

export function Tag({ children, emphasis = false, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide whitespace-nowrap uppercase',
        emphasis ? 'bg-primary text-primary-foreground' : 'bg-tint-2 text-foreground',
        className,
      )}
    >
      {children}
    </span>
  )
}

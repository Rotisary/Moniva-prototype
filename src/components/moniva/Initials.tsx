import { cn } from '@/lib/utils'

const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

export function Initials({ name, dark = false, className }: { name: string; dark?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold',
        dark ? 'bg-primary text-primary-foreground' : 'bg-tint-2 text-foreground',
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  )
}

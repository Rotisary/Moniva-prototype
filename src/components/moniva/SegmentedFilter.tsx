import { cn } from '@/lib/utils'

interface SegmentedFilterProps<T extends string> {
  label: string
  options: Array<{ value: T; label: string }>
  value: T
  onChange: (value: T) => void
}

export function SegmentedFilter<T extends string>({ label, options, value, onChange }: SegmentedFilterProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              selected ? 'border-tint-2 bg-tint-2' : 'border-border bg-card hover:bg-tint-1',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

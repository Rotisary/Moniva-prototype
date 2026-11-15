import { Download } from 'lucide-react'
import { Tag } from '@/components/moniva/Tag'
import { Button } from '@/components/ui/button'
import type { Business } from '@/data/types'
import { CHANNEL_LABELS } from '@/lib/format'
import { monthLabel } from '@/lib/metrics'
import { PROFILE_MONTHS } from '@/lib/profile'

interface BusinessHeaderProps {
  business: Business
  operatingMonths: number
  onDownload: () => void
}

export function BusinessHeader({ business, operatingMonths, onDownload }: BusinessHeaderProps) {
  const since = monthLabel(business.operatingSince.slice(0, 7), 'long')
  const details: Array<[string, string]> = [
    ['Location', business.location],
    [
      'Sales channels',
      `${CHANNEL_LABELS[business.primaryChannel]} Business (primary), ${CHANNEL_LABELS[business.secondaryChannel]} (secondary)`,
    ],
    ['Operating history', `${operatingMonths} months (since ${since})`],
  ]

  return (
    <section className="flex break-inside-avoid flex-col gap-4 rounded-2xl bg-card p-5">
      <div className="flex flex-wrap items-start gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Merchant financial profile</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">{business.name}</h2>
          <Tag className="mt-2">{business.category}</Tag>
        </div>
        <Button className="ml-auto h-9 rounded-full px-4 print:hidden" onClick={onDownload}>
          <Download aria-hidden />
          Download Financial Report
        </Button>
      </div>
      <dl className="grid gap-3 sm:grid-cols-3">
        {details.map(([term, value]) => (
          <div key={term} className="rounded-xl bg-background p-3">
            <dt className="text-xs text-muted-foreground">{term}</dt>
            <dd className="mt-0.5 font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-muted-foreground">
        Based on recorded activity from {monthLabel(PROFILE_MONTHS[0], 'long')} to{' '}
        {monthLabel(PROFILE_MONTHS[PROFILE_MONTHS.length - 1], 'long')}.
      </p>
    </section>
  )
}

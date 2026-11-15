import { Panel } from '@/components/moniva/Panel'
import { formatNaira, formatPercent } from '@/lib/format'
import type { ProfileSummary } from '@/lib/profile'

export function ProfileDetails({ summary: s }: { summary: ProfileSummary }) {
  const rows: Array<[string, string]> = [
    [
      'Revenue consistency',
      `Average ${formatNaira(Math.round(s.mean))} a month. Lowest ${formatNaira(s.lowest.revenue)} (${s.lowest.label}), highest ${formatNaira(s.highest.revenue)} (${s.highest.label}). Varies about ${formatPercent(s.cv, 0)} month to month.`,
    ],
    [
      'Transaction frequency',
      `${s.avgSalesPerMonth.toFixed(1)} completed sales a month on average, and ${s.paymentsPerWeek.toFixed(1)} confirmed payments a week.`,
    ],
    [
      'Customer retention',
      `${formatPercent(s.repeatRate)} repeat customer rate: ${s.returning} of ${s.payers} paying customers bought more than once.`,
    ],
    [
      'Financial record completeness',
      `${formatPercent(s.completeness)} of recorded revenue is matched to trusted bank records. ${s.pendingReceipts} receipts are awaiting verification.`,
    ],
  ]

  return (
    <Panel title="Profile details" className="break-inside-avoid">
      <dl className="flex flex-col">
        {rows.map(([term, value]) => (
          <div key={term} className="grid gap-1 border-b border-border py-3 last:border-b-0 sm:grid-cols-[14rem_1fr]">
            <dt className="text-sm font-semibold">{term}</dt>
            <dd className="text-sm">{value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}

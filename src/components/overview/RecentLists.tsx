import { useMemo, useState } from 'react'
import { CardFooterLink } from '@/components/moniva/CardFooterLink'
import { ListRow } from '@/components/moniva/ListRow'
import { Money } from '@/components/moniva/Money'
import { Panel } from '@/components/moniva/Panel'
import { SegmentedFilter } from '@/components/moniva/SegmentedFilter'
import { SimulatedNotice } from '@/components/moniva/SimulatedNotice'
import { StatusBadge } from '@/components/moniva/StatusBadge'
import { Tag } from '@/components/moniva/Tag'
import { activityEvents, itemsLabel, type ActivityKind } from '@/lib/activity'
import { formatDate, formatDateTime, PAYMENT_CHANNEL_LABELS } from '@/lib/format'
import { useDemoData } from '@/store/demo-data-context'

export function RecentTransactions({ className }: { className?: string }) {
  const { data } = useDemoData()
  const latest = [...data.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  const nameOf = (id: string) => data.customers.find((c) => c.id === id)?.name ?? 'Unknown customer'

  return (
    <Panel title="Recent transactions" className={className}>
      {latest.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No transactions recorded yet.</p>
      ) : (
        <ul>
          {latest.map((t) => {
            const order = data.orders.find((o) => o.id === t.orderId)
            const name = nameOf(t.customerId)
            return (
              <ListRow
                key={t.reference}
                name={name}
                title={name}
                meta={[
                  t.reference,
                  PAYMENT_CHANNEL_LABELS[t.paymentChannel],
                  formatDate(t.date, 'd MMM'),
                  order ? itemsLabel(data, order) : 'No order linked',
                ].join(' · ')}
                badge={<StatusBadge status={t.status} />}
                amount={<Money amount={t.amount} />}
              />
            )
          })}
        </ul>
      )}
      <CardFooterLink to="/transactions">View all transactions</CardFooterLink>
    </Panel>
  )
}

type ActivityFilter = 'all' | ActivityKind

const FILTERS: Array<{ value: ActivityFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'order', label: 'Orders' },
  { value: 'payment', label: 'Payments' },
  { value: 'enquiry', label: 'Enquiries' },
]

export function RecentActivity({ className }: { className?: string }) {
  const { data } = useDemoData()
  const [filter, setFilter] = useState<ActivityFilter>('all')
  const events = useMemo(() => activityEvents(data), [data])
  const shown = events.filter((e) => filter === 'all' || e.kind === filter).slice(0, 6)

  return (
    <Panel
      title="Recent business activity"
      className={className}
      action={<SegmentedFilter label="Filter activity" options={FILTERS} value={filter} onChange={setFilter} />}
    >
      {shown.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No recent activity of this type.</p>
      ) : (
        <ul>
          {shown.map((e) => (
            <ListRow
              key={`${e.kind}-${e.id}`}
              name={e.customerName}
              title={e.title}
              meta={`${e.meta} · ${formatDateTime(e.at)}`}
              badge={e.status ? <StatusBadge status={e.status} /> : e.tag && <Tag emphasis={e.tag.emphasis}>{e.tag.label}</Tag>}
              amount={e.amount !== undefined ? <Money amount={e.amount} /> : <span className="text-muted-foreground">-</span>}
            />
          ))}
        </ul>
      )}
      <SimulatedNotice>
        WhatsApp and Instagram are simulated for this prototype. No real WhatsApp or Instagram account is connected,
        and activity is extracted from sample conversations.
      </SimulatedNotice>
    </Panel>
  )
}

import { Initials } from '@/components/moniva/Initials'
import { Panel } from '@/components/moniva/Panel'
import { Tag } from '@/components/moniva/Tag'
import type { Conversation, DemoDataset } from '@/data/types'
import { formatDateTime } from '@/lib/format'
import { linkedOrder, orderStatusLabel } from '@/lib/social'
import { cn } from '@/lib/utils'

interface ConversationListProps {
  data: DemoDataset
  conversations: Conversation[]
  total: number
  selectedId: string | undefined
  newIds: string[]
  onSelect: (id: string) => void
  onShowMore: () => void
  className?: string
}

export function ConversationList({
  data,
  conversations,
  total,
  selectedId,
  newIds,
  onSelect,
  onShowMore,
  className,
}: ConversationListProps) {
  const nameOf = (id: string) => data.customers.find((c) => c.id === id)?.name ?? 'Unknown customer'

  return (
    <Panel title="Conversations" className={className} action={<span className="text-sm text-muted-foreground">{total} this month</span>}>
      {total === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No conversations on this channel this month.</p>
      ) : (
        <ul className="-mx-2 flex flex-col gap-1 lg:max-h-[42rem] lg:overflow-y-auto">
          {conversations.map((c) => {
            const name = nameOf(c.customerId)
            const order = linkedOrder(data, c)
            const selected = c.id === selectedId
            return (
              <li key={c.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(c.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                    selected ? 'bg-tint-2' : 'hover:bg-tint-1',
                  )}
                >
                  <Initials name={name} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span className="truncate font-semibold">{name}</span>
                      <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
                        {formatDateTime(c.startedAt)}
                      </span>
                    </span>
                    <span className={cn('mt-0.5 block truncate text-xs', selected ? '' : 'text-muted-foreground')}>
                      {c.messages[0]?.text}
                    </span>
                    <span className="mt-1.5 flex flex-wrap gap-1">
                      {newIds.includes(c.id) && <Tag emphasis>New</Tag>}
                      {c.extraction.customerClassification === 'returning' && <Tag>Returning</Tag>}
                      <Tag emphasis={order !== undefined && order.status !== 'cancelled'}>{orderStatusLabel(order)}</Tag>
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {conversations.length < total && (
        <button
          type="button"
          onClick={onShowMore}
          className="rounded-xl bg-background p-3 text-center font-semibold transition-colors hover:bg-tint-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Show more ({total - conversations.length} more)
        </button>
      )}
    </Panel>
  )
}

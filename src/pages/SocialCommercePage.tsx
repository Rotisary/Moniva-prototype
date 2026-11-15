import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { MetricCard } from '@/components/moniva/MetricCard'
import { SegmentedFilter } from '@/components/moniva/SegmentedFilter'
import { ChannelCard } from '@/components/social/ChannelCard'
import { ConversationDetail } from '@/components/social/ConversationDetail'
import { ConversationList } from '@/components/social/ConversationList'
import { deliverNextIncoming, INCOMING_QUEUE, nextIncoming } from '@/data/incoming'
import { formatCount } from '@/lib/format'
import { CURRENT_MONTH, monthLabel } from '@/lib/metrics'
import { ACTIVITY_TYPE_LABELS, monthConversations, socialMetrics, type ChannelFilter } from '@/lib/social'
import { useDemoData } from '@/store/demo-data-context'

const PAGE_SIZE = 20

const CHANNEL_FILTERS: Array<{ value: ChannelFilter; label: string }> = [
  { value: 'all', label: 'All channels' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
]

export function SocialCommercePage() {
  const { data, update } = useDemoData()
  const [channel, setChannel] = useState<ChannelFilter>('all')
  const [selectedId, setSelectedId] = useState<string>()
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [newIds, setNewIds] = useState<string[]>([])
  const delivering = useRef(false)

  // A click is ignored until the previous delivery has reached the store.
  useEffect(() => {
    delivering.current = false
  }, [data])

  const conversations = useMemo(() => monthConversations(data, CURRENT_MONTH, channel), [data, channel])
  const metrics = useMemo(() => socialMetrics(data, CURRENT_MONTH, channel), [data, channel])
  const selected = conversations.find((c) => c.id === selectedId) ?? conversations[0]
  const next = nextIncoming(data)
  const remaining = next ? INCOMING_QUEUE.length - INCOMING_QUEUE.indexOf(next) : 0
  const period = monthLabel(CURRENT_MONTH, 'long')

  function changeChannel(value: ChannelFilter) {
    setChannel(value)
    setSelectedId(undefined)
    setVisible(PAGE_SIZE)
  }

  function simulate() {
    if (!next || delivering.current) return
    delivering.current = true
    update((current) => deliverNextIncoming(current) ?? current)
    if (channel === 'instagram') setChannel('all')
    setSelectedId(next.id)
    setNewIds((ids) => [...ids, next.id])
    const status = next.order ? 'Confirmed' : 'No confirmed order'
    toast.success(
      `New WhatsApp message from ${next.customerName.split(' ')[0]}: ${ACTIVITY_TYPE_LABELS[next.extraction.activityType]}, ${status}`,
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ChannelCard remaining={remaining} total={INCOMING_QUEUE.length} onSimulate={simulate} />

      <div className="flex flex-wrap items-center gap-3">
        <SegmentedFilter label="Filter by channel" options={CHANNEL_FILTERS} value={channel} onChange={changeChannel} />
        <span className="text-sm text-muted-foreground">Activity in {period}</span>
      </div>

      <section aria-label="Social-commerce activity this month" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          variant="inverse"
          label="Total enquiries"
          value={formatCount(metrics.enquiries)}
          footnote={`Conversations in ${period}`}
        />
        <MetricCard
          variant="tint-1"
          label="Purchase-intent conversations"
          value={formatCount(metrics.purchaseIntent)}
          footnote="Customer said they want to buy"
        />
        <MetricCard
          variant="tint-2"
          label="Confirmed orders"
          value={formatCount(metrics.confirmedOrders)}
          footnote="Chats that became an order"
        />
        <MetricCard
          variant="tint-3"
          label="Completed sales"
          value={formatCount(metrics.completedSales)}
          footnote="Orders paid and completed"
        />
        <MetricCard
          label="Unconverted enquiries"
          value={formatCount(metrics.unconverted)}
          footnote="No order, or order cancelled"
        />
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-12">
        <ConversationList
          className="lg:col-span-5"
          data={data}
          conversations={conversations.slice(0, visible)}
          total={conversations.length}
          selectedId={selected?.id}
          newIds={newIds}
          onSelect={setSelectedId}
          onShowMore={() => setVisible((v) => v + PAGE_SIZE)}
        />
        <div className="lg:col-span-7">
          {selected ? (
            <ConversationDetail data={data} conversation={selected} />
          ) : (
            <p className="rounded-2xl bg-card p-10 text-center text-sm text-muted-foreground">
              Select a conversation to see the chat and what Moniva extracted from it.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

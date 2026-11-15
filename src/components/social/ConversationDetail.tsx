import { Panel } from '@/components/moniva/Panel'
import { StatusBadge } from '@/components/moniva/StatusBadge'
import type { Conversation, DemoDataset } from '@/data/types'
import { CHANNEL_LABELS, formatDateTime } from '@/lib/format'
import {
  ACTIVITY_TYPE_LABELS,
  CLASSIFICATION_LABELS,
  INTENT_LABELS,
  linkedOrder,
  orderStatusLabel,
  priceLabel,
  productLabel,
} from '@/lib/social'
import { cn } from '@/lib/utils'

interface ConversationDetailProps {
  data: DemoDataset
  conversation: Conversation
}

export function ConversationDetail({ data, conversation }: ConversationDetailProps) {
  const name = data.customers.find((c) => c.id === conversation.customerId)?.name ?? 'Unknown customer'
  const x = conversation.extraction
  const fields: Array<[string, string]> = [
    ['Customer', name],
    ['Product', productLabel(data, x)],
    ['Price', priceLabel(x)],
    ['Activity type', ACTIVITY_TYPE_LABELS[x.activityType]],
    ['Purchase intent', INTENT_LABELS[x.purchaseIntent]],
    ['Order status', orderStatusLabel(linkedOrder(data, conversation))],
    ['Customer classification', CLASSIFICATION_LABELS[x.customerClassification]],
  ]

  return (
    <div className="flex flex-col gap-4">
      <Panel
        title={`Chat with ${name}`}
        action={
          <span className="text-sm text-muted-foreground">
            {CHANNEL_LABELS[conversation.channel]} · {formatDateTime(conversation.startedAt)}
          </span>
        }
      >
        <ol className="flex flex-col gap-3 rounded-xl bg-background p-4">
          {conversation.messages.map((m, i) => {
            const fromCustomer = m.sender === 'customer'
            return (
              <li key={i} className={cn('flex flex-col gap-1', fromCustomer ? 'items-start' : 'items-end')}>
                <p
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm',
                    fromCustomer ? 'rounded-bl-sm bg-tint-2' : 'rounded-br-sm bg-primary text-primary-foreground',
                  )}
                >
                  <span className="sr-only">{fromCustomer ? `${name}: ` : 'Merchant: '}</span>
                  {m.text}
                </p>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {fromCustomer ? name.split(' ')[0] : 'Tolu Fashion House'} · {formatDateTime(m.at)}
                </span>
              </li>
            )
          })}
        </ol>
      </Panel>

      <Panel title="Extraction" action={<StatusBadge status="inferred" />}>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label} className="border-b border-border pb-2">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-muted-foreground">
          Extracted from the conversation by Moniva&apos;s simulated extraction. Not independently verified.
        </p>
      </Panel>
    </div>
  )
}

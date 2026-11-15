import { Camera, MessageCircle, MessageSquarePlus } from 'lucide-react'
import { Panel } from '@/components/moniva/Panel'
import { SimulatedNotice } from '@/components/moniva/SimulatedNotice'
import { Button } from '@/components/ui/button'

const CHANNELS = [
  { name: 'WhatsApp Business', role: 'Primary channel', icon: MessageCircle },
  { name: 'Instagram', role: 'Secondary channel', icon: Camera },
]

interface ChannelCardProps {
  remaining: number
  total: number
  onSimulate: () => void
}

export function ChannelCard({ remaining, total, onSimulate }: ChannelCardProps) {
  return (
    <Panel
      title="Connected channels"
      action={
        <Button onClick={onSimulate} disabled={remaining === 0} className="h-9 rounded-full px-4">
          <MessageSquarePlus aria-hidden />
          Simulate incoming message
        </Button>
      }
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {CHANNELS.map(({ name, role, icon: Icon }) => (
          <li key={name} className="flex items-center gap-3 rounded-xl bg-background p-3">
            <span aria-hidden className="grid size-9 place-items-center rounded-full bg-card">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{name}</p>
              <p className="text-xs text-muted-foreground">{role}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-xs font-semibold">
              <span aria-hidden className="size-2 rounded-full bg-primary" />
              Connected (Demo)
            </span>
          </li>
        ))}
      </ul>
      <p className="text-sm" aria-live="polite">
        {remaining === 0
          ? `All ${total} sample messages have been delivered.`
          : `${remaining} of ${total} sample WhatsApp messages are waiting to be simulated.`}
      </p>
      <SimulatedNotice>
        This is a simulated WhatsApp Business and Instagram integration for the prototype. Moniva is not connected to a
        real WhatsApp or Instagram account. Messages are predefined samples, and extraction uses predefined results.
      </SimulatedNotice>
    </Panel>
  )
}

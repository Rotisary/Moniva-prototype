import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Panel } from '@/components/moniva/Panel'
import { Tag } from '@/components/moniva/Tag'
import { ResetDemoDialog } from '@/components/settings/ResetDemoDialog'
import { Button } from '@/components/ui/button'
import { DEMO_TODAY } from '@/data/seed'
import { CHANNEL_LABELS, formatDate } from '@/lib/format'
import { monthLabel } from '@/lib/metrics'
import { operatingMonths } from '@/lib/profile'
import { useDemoData } from '@/store/demo-data-context'

const INTEGRATIONS: Array<[string, string]> = [
  ['WhatsApp Business', 'Connected (Demo). Conversations are predefined samples; no real WhatsApp account is linked.'],
  ['Instagram', 'Connected (Demo). Conversations are predefined samples; no real Instagram account is linked.'],
  [
    'Bank records and verification',
    'Payments are checked against seeded "trusted" bank records from a fictional bank, not a real bank or Open Banking connection.',
  ],
  ['Receipt extraction', 'Receipt details come from sample receipts or what you type; no image is read or stored.'],
  [
    'Financial institution sharing',
    'Institutions are fictional and no data leaves this browser. Moniva does not approve loans or make lending decisions.',
  ],
  ['Reorder reminders', 'Reminders are previews only; no message is sent.'],
  ['Business insights', 'Recommendations come from fixed rules applied to the sample data, not from an AI model.'],
  [
    'Data storage',
    "All data is stored in this browser's local storage. Clearing site data or Reset demo data restores the sample dataset.",
  ],
]

export function SettingsPage() {
  const { data, resetDemoData } = useDemoData()
  const [confirming, setConfirming] = useState(false)
  const b = data.business

  const details: Array<[string, string]> = [
    ['Business name', b.name],
    ['Category', b.category],
    ['Location', b.location],
    ['Primary channel', `${CHANNEL_LABELS[b.primaryChannel]} Business`],
    ['Secondary channel', CHANNEL_LABELS[b.secondaryChannel]],
    ['Operating since', `${monthLabel(b.operatingSince.slice(0, 7), 'long')} (${operatingMonths(data)} months)`],
    ['Demo date', formatDate(DEMO_TODAY)],
  ]

  function reset() {
    resetDemoData()
    setConfirming(false)
    toast.success('Demo data reset to the original sample dataset.')
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel title="Business details">
        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {details.map(([term, value]) => (
            <div key={term} className="rounded-xl bg-background p-3">
              <dt className="text-xs text-muted-foreground">{term}</dt>
              <dd className="mt-0.5 font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-muted-foreground">Business details are read-only in this demo.</p>
      </Panel>

      <Panel title="Simulated integrations">
        <ul className="flex flex-col">
          {INTEGRATIONS.map(([name, explanation]) => (
            <li
              key={name}
              className="grid gap-1 border-b border-border py-3 last:border-b-0 sm:grid-cols-[16rem_1fr] sm:gap-4"
            >
              <span className="flex items-center gap-2 font-semibold">
                {name}
                <Tag>Simulated</Tag>
              </span>
              <span className="text-sm">{explanation}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Demo data">
        <p className="text-sm">
          Restore the original sample dataset for {b.name}. This clears every change made in this browser.
        </p>
        <Button variant="destructive" className="h-9 self-start rounded-full px-4" onClick={() => setConfirming(true)}>
          <RotateCcw aria-hidden />
          Reset demo data
        </Button>
      </Panel>

      <ResetDemoDialog open={confirming} businessName={b.name} onOpenChange={setConfirming} onConfirm={reset} />
    </div>
  )
}

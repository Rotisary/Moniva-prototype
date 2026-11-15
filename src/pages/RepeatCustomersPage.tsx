import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { MetricCard } from '@/components/moniva/MetricCard'
import { Panel } from '@/components/moniva/Panel'
import { SimulatedNotice } from '@/components/moniva/SimulatedNotice'
import { ReminderDialog } from '@/components/repeat/ReminderDialog'
import { RepeatCustomerTable } from '@/components/repeat/RepeatCustomerTable'
import { formatCount, formatNairaCompact, formatPercent } from '@/lib/format'
import { repeatCustomerRate } from '@/lib/metrics'
import { addReminder, repeatPurchaseRecords, type RepeatPurchaseRecord } from '@/lib/repeat'
import { useDemoData } from '@/store/demo-data-context'

export function RepeatCustomersPage() {
  const { data, update } = useDemoData()
  const records = useMemo(() => repeatPurchaseRecords(data), [data])
  const reminders = useMemo(() => new Map(data.reorderReminders.map((r) => [r.customerId, r])), [data])
  const [viewing, setViewing] = useState<string>()

  const due = records.filter((r) => r.windowStatus !== 'upcoming').length
  const potential = records.reduce((total, r) => total + r.averageOrderValue, 0)
  const viewingRecord = records.find((r) => r.customer.id === viewing)

  function generate(record: RepeatPurchaseRecord) {
    update((current) => addReminder(current, record.customer.id, new Date()))
    toast.success(`${record.customer.name} marked as reminded.`)
    setViewing(record.customer.id)
  }

  return (
    <div className="flex flex-col gap-4">
      <SimulatedNotice>
        Reorder windows are predicted from purchase history. Reminders are previews only: nothing is sent to customers.
      </SimulatedNotice>

      <section aria-label="Repeat customer summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          variant="inverse"
          label="Due for reorder"
          value={formatCount(due)}
          footnote="Due now or overdue against their usual interval"
        />
        <MetricCard
          variant="tint-1"
          label="Returning customers"
          value={formatCount(records.length)}
          footnote={`${formatPercent(repeatCustomerRate(data))} repeat customer rate`}
        />
        <MetricCard
          variant="tint-2"
          label="Potential repeat revenue"
          value={formatNairaCompact(potential)}
          footnote="if each returning customer reorders once"
        />
        <MetricCard
          variant="tint-3"
          label="Reminders sent"
          value={formatCount(data.reorderReminders.length)}
          footnote="Simulated previews"
        />
      </section>

      <Panel title="Returning customers">
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No customer has completed two or more purchases yet. Returning customers appear here as orders complete.
          </p>
        ) : (
          <RepeatCustomerTable
            records={records}
            reminders={reminders}
            onGenerate={generate}
            onView={(r) => setViewing(r.customer.id)}
          />
        )}
      </Panel>

      <ReminderDialog
        customerName={viewingRecord?.customer.name}
        reminder={viewing ? reminders.get(viewing) : undefined}
        onClose={() => setViewing(undefined)}
      />
    </div>
  )
}

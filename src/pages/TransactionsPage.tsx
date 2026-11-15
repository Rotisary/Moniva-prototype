import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { MetricCard } from '@/components/moniva/MetricCard'
import { Panel } from '@/components/moniva/Panel'
import { SegmentedFilter } from '@/components/moniva/SegmentedFilter'
import { SimulatedNotice } from '@/components/moniva/SimulatedNotice'
import { ReceiptIntakeDialog } from '@/components/transactions/ReceiptIntakeDialog'
import { TransactionSheet } from '@/components/transactions/TransactionSheet'
import { TransactionTable } from '@/components/transactions/TransactionTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { TransactionStatus } from '@/data/types'
import { formatCount, formatNaira, formatNairaCompact } from '@/lib/format'
import { CURRENT_MONTH, monthLabel, verifiedDigital, verifiedDigitalTransactions } from '@/lib/metrics'
import { useDemoData } from '@/store/demo-data-context'

const PAGE_SIZE = 25

type StatusFilter = 'all' | TransactionStatus

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'verified', label: 'Verified' },
  { value: 'pending_verification', label: 'Pending verification' },
  { value: 'unmatched', label: 'Unmatched' },
  { value: 'failed', label: 'Failed' },
  { value: 'merchant_confirmed', label: 'Merchant-confirmed' },
]

export function TransactionsPage() {
  const { data } = useDemoData()
  const [status, setStatus] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [openReference, setOpenReference] = useState<string>()
  const [intakeOpen, setIntakeOpen] = useState(false)

  const customerNames = useMemo(() => new Map(data.customers.map((c) => [c.id, c.name])), [data.customers])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.transactions
      .filter((t) => status === 'all' || t.status === status)
      .filter(
        (t) =>
          !q ||
          t.reference.toLowerCase().includes(q) ||
          (customerNames.get(t.customerId) ?? '').toLowerCase().includes(q),
      )
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [data.transactions, status, query, customerNames])

  const pending = data.transactions.filter((t) => t.status === 'pending_verification')
  const unmatched = data.transactions.filter((t) => t.status === 'unmatched')
  const failedThisMonth = data.transactions.filter((t) => t.status === 'failed' && t.date.startsWith(CURRENT_MONTH))
  const period = monthLabel(CURRENT_MONTH, 'long')

  return (
    <div className="flex flex-col gap-4">
      <section aria-label="Payment summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          variant="inverse"
          label="Verified this month"
          value={formatNairaCompact(verifiedDigital(data, CURRENT_MONTH))}
          footnote={`${verifiedDigitalTransactions(data, CURRENT_MONTH).length} payments matched to bank records in ${period}`}
        />
        <MetricCard
          variant="tint-1"
          label="Awaiting verification"
          value={formatCount(pending.length)}
          footnote={`${formatNaira(pending.reduce((sum, t) => sum + t.amount, 0))} in receipts not yet checked`}
        />
        <MetricCard
          variant="tint-2"
          label="Unmatched receipts"
          value={formatCount(unmatched.length)}
          footnote="No matching trusted bank record"
        />
        <MetricCard
          variant="tint-3"
          label="Failed payments"
          value={formatCount(failedThisMonth.length)}
          footnote={`Card or POS attempts that failed in ${period}`}
        />
      </section>

      <Panel
        title="All transactions"
        action={
          <Button className="h-9 rounded-full px-4" onClick={() => setIntakeOpen(true)}>
            <Plus aria-hidden />
            Record receipt
          </Button>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedFilter
            label="Filter by status"
            options={STATUS_FILTERS}
            value={status}
            onChange={(value) => {
              setStatus(value)
              setVisible(PAGE_SIZE)
            }}
          />
          <label className="relative ml-auto w-full sm:w-72">
            <span className="sr-only">Search by reference or customer</span>
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setVisible(PAGE_SIZE)
              }}
              placeholder="Search reference or customer"
              className="h-9 rounded-full bg-card pl-9"
            />
          </label>
        </div>

        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No transactions match these filters.</p>
        ) : (
          <TransactionTable
            data={data}
            transactions={filtered.slice(0, visible)}
            customerNames={customerNames}
            onOpen={setOpenReference}
          />
        )}

        {visible < filtered.length && (
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="rounded-xl bg-background p-3 text-center font-semibold transition-colors hover:bg-tint-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Show more ({filtered.length - visible} more)
          </button>
        )}

        <SimulatedNotice>
          Bank verification is simulated against seeded bank records. Moniva is not connected to any bank, and receipts are
          predefined samples or details you enter.
        </SimulatedNotice>
      </Panel>

      <TransactionSheet reference={openReference} onClose={() => setOpenReference(undefined)} />
      <ReceiptIntakeDialog
        open={intakeOpen}
        onOpenChange={setIntakeOpen}
        onSaved={(reference) => {
          setIntakeOpen(false)
          setOpenReference(reference)
        }}
      />
    </div>
  )
}

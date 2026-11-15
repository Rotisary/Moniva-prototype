import { Initials } from '@/components/moniva/Initials'
import { Money } from '@/components/moniva/Money'
import { Tag } from '@/components/moniva/Tag'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ReorderReminder } from '@/data/types'
import { formatDate } from '@/lib/format'
import type { RepeatPurchaseRecord, WindowStatus } from '@/lib/repeat'

const STATUS_TAG: Record<WindowStatus, { label: string; emphasis: boolean }> = {
  overdue: { label: 'Overdue', emphasis: true },
  due: { label: 'Due now', emphasis: false },
  upcoming: { label: 'Upcoming', emphasis: false },
}

const HEADERS = [
  'Customer',
  'Purchases',
  'Usual interval',
  'Last purchase',
  'Predicted reorder window',
  'Potential revenue',
  'Reminder',
]

interface RepeatCustomerTableProps {
  records: RepeatPurchaseRecord[]
  reminders: Map<string, ReorderReminder>
  onGenerate: (record: RepeatPurchaseRecord) => void
  onView: (record: RepeatPurchaseRecord) => void
}

export function RepeatCustomerTable({ records, reminders, onGenerate, onView }: RepeatCustomerTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {HEADERS.map((h) => (
            <TableHead
              key={h}
              className={
                h === 'Potential revenue'
                  ? 'text-right text-xs text-muted-foreground uppercase'
                  : 'text-xs text-muted-foreground uppercase'
              }
            >
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((r) => {
          const reminder = reminders.get(r.customer.id)
          const status = STATUS_TAG[r.windowStatus]
          return (
            <TableRow key={r.customer.id}>
              <TableCell>
                <span className="flex items-center gap-2.5">
                  <Initials name={r.customer.name} className="size-8" />
                  <span className="font-semibold">{r.customer.name}</span>
                </span>
              </TableCell>
              <TableCell className="tabular-nums">{r.purchaseCount}</TableCell>
              <TableCell className="tabular-nums">Every {r.averageIntervalDays} days</TableCell>
              <TableCell className="tabular-nums">{formatDate(r.lastPurchaseDate)}</TableCell>
              <TableCell>
                <span className="flex flex-wrap items-center gap-2">
                  <span className="tabular-nums">
                    {formatDate(r.window.start, 'd MMM')} to {formatDate(r.window.end, 'd MMM yyyy')}
                  </span>
                  <Tag emphasis={status.emphasis}>{status.label}</Tag>
                </span>
              </TableCell>
              <TableCell className="text-right font-semibold">
                <Money amount={r.averageOrderValue} />
              </TableCell>
              <TableCell>
                {reminder ? (
                  <span className="flex flex-wrap items-center gap-2">
                    <Tag emphasis>Reminded {formatDate(reminder.remindedAt, 'd MMM')}</Tag>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => onView(r)}
                      aria-label={`View reminder for ${r.customer.name}`}
                    >
                      View reminder
                    </Button>
                  </span>
                ) : (
                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() => onGenerate(r)}
                    aria-label={`Generate reorder reminder for ${r.customer.name}`}
                  >
                    Generate reorder reminder
                  </Button>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

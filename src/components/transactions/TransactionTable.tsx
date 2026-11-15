import { Money } from '@/components/moniva/Money'
import { StatusBadge } from '@/components/moniva/StatusBadge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { DemoDataset, Transaction } from '@/data/types'
import { itemsLabel } from '@/lib/activity'
import { formatDate, PAYMENT_CHANNEL_LABELS } from '@/lib/format'

interface TransactionTableProps {
  data: DemoDataset
  transactions: Transaction[]
  customerNames: Map<string, string>
  onOpen: (reference: string) => void
}

export function TransactionTable({ data, transactions, customerNames, onOpen }: TransactionTableProps) {
  const orders = new Map(data.orders.map((o) => [o.id, o]))
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {['Reference', 'Customer', 'Amount', 'Date', 'Channel', 'Order', 'Status'].map((h) => (
            <TableHead
              key={h}
              className={h === 'Amount' ? 'text-right text-xs text-muted-foreground uppercase' : 'text-xs text-muted-foreground uppercase'}
            >
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t) => {
          const order = t.orderId ? orders.get(t.orderId) : undefined
          return (
            <TableRow key={t.reference} className="cursor-pointer" onClick={() => onOpen(t.reference)}>
              <TableCell>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpen(t.reference)
                  }}
                  className="font-semibold underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label={`Open transaction ${t.reference}`}
                >
                  {t.reference}
                </button>
              </TableCell>
              <TableCell>{customerNames.get(t.customerId) ?? 'Unknown customer'}</TableCell>
              <TableCell className="text-right font-semibold">
                <Money amount={t.amount} />
              </TableCell>
              <TableCell className="tabular-nums">{formatDate(t.date, 'd MMM yyyy')}</TableCell>
              <TableCell>{PAYMENT_CHANNEL_LABELS[t.paymentChannel]}</TableCell>
              <TableCell className="max-w-48 truncate text-muted-foreground">
                {order ? itemsLabel(data, order) : 'No order linked'}
              </TableCell>
              <TableCell>
                <StatusBadge status={t.status} />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

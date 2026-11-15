import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Money } from '@/components/moniva/Money'
import { StatusBadge } from '@/components/moniva/StatusBadge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { DemoDataset, Transaction } from '@/data/types'
import { itemsLabel } from '@/lib/activity'
import { formatDateTime, PAYMENT_CHANNEL_LABELS } from '@/lib/format'
import { linkOrder, outcomeMessage, selectableOrders, unmatchedReason, verifyAgainstBank } from '@/lib/reconciliation'
import { cn } from '@/lib/utils'
import { useDemoData } from '@/store/demo-data-context'
import { AmountCheck } from './AmountCheck'
import { OrderPicker } from './OrderPicker'
import { ReceiptCard } from './ReceiptCard'

const SOURCE_LABELS = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  receipt_upload: 'Receipt sent by customer',
  bank_record: 'Bank record',
  manual_entry: 'Entered by merchant',
}

interface TransactionSheetProps {
  reference: string | undefined
  onClose: () => void
}

export function TransactionSheet({ reference, onClose }: TransactionSheetProps) {
  const { data } = useDemoData()
  const tx = reference ? data.transactions.find((t) => t.reference === reference) : undefined
  return (
    <Sheet open={tx !== undefined} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-xl">
        {tx && <TransactionDetail key={tx.reference} data={data} tx={tx} />}
      </SheetContent>
    </Sheet>
  )
}

function TransactionDetail({ data, tx }: { data: DemoDataset; tx: Transaction }) {
  const { update } = useDemoData()
  const [result, setResult] = useState<{ text: string; tone: 'good' | 'bad' | 'neutral' }>()
  const [linkChoice, setLinkChoice] = useState('')
  const customer = data.customers.find((c) => c.id === tx.customerId)?.name ?? 'Unknown customer'
  const order = tx.orderId ? data.orders.find((o) => o.id === tx.orderId) : undefined
  const canLink = selectableOrders(data).length > 0

  const fields: Array<[string, string]> = [
    ['Customer', customer],
    ['Date', formatDateTime(tx.date)],
    ['Payment channel', PAYMENT_CHANNEL_LABELS[tx.paymentChannel]],
    ['Source', SOURCE_LABELS[tx.source]],
  ]

  function verify() {
    const { outcome } = verifyAgainstBank(data, tx.reference)
    update((current) => verifyAgainstBank(current, tx.reference).data)
    const text = outcomeMessage(outcome, tx.reference)
    const tone = outcome.kind === 'verified' ? 'good' : outcome.kind === 'needs-order' ? 'neutral' : 'bad'
    setResult({ text, tone })
    if (tone === 'good') toast.success(text)
    else if (outcome.kind === 'order-amount-differs') toast.warning(text)
    else toast.error(text)
  }

  function link() {
    update((current) => linkOrder(current, tx.reference, linkChoice))
    setResult({ text: 'Receipt linked to the order. You can now verify it against the bank record.', tone: 'neutral' })
  }

  return (
    <>
      <SheetHeader className="gap-2 border-b border-border p-5">
        <SheetTitle className="text-lg font-semibold">{tx.reference}</SheetTitle>
        <SheetDescription className="flex flex-wrap items-center gap-2">
          <Money amount={tx.amount} className="text-2xl font-semibold text-foreground" />
          <StatusBadge status={tx.status} />
          <StatusBadge status={tx.verificationLabel} />
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-5 p-5">
        <dl className="grid grid-cols-2 gap-3">
          {fields.map(([term, value]) => (
            <div key={term}>
              <dt className="text-xs text-muted-foreground">{term}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        {tx.receipt && (
          <section className="flex flex-col gap-2">
            <h3 className="font-semibold">Receipt</h3>
            <ReceiptCard
              sender={customer}
              reference={tx.receipt.extracted.reference}
              amount={tx.receipt.extracted.amount}
              date={tx.receipt.extracted.date}
              label={tx.receipt.sampleId === 'upload' ? 'Uploaded receipt' : 'Sample receipt'}
              fileName={tx.receipt.fileName}
            />
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h3 className="font-semibold">Order</h3>
          {order ? (
            <>
              <p className="text-sm">
                {itemsLabel(data, order)} · <Money amount={order.amount} className="font-semibold" /> ·{' '}
                {formatDateTime(order.date)}
              </p>
              {tx.status !== 'failed' && <AmountCheck receiptAmount={tx.amount} orderAmount={order.amount} />}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No order linked.</p>
          )}
        </section>

        <section className="flex flex-col gap-3 rounded-2xl bg-background p-4">
          <h3 className="flex items-center gap-2 font-semibold">
            <ShieldCheck aria-hidden className="size-4" />
            Reconciliation
          </h3>
          {tx.status === 'pending_verification' && (
            <>
              <p className="text-sm text-muted-foreground">
                A receipt does not prove payment. Moniva checks it against a trusted bank record before the sale counts as
                paid.
              </p>
              {!order && (
                <div className="flex flex-col gap-2">
                  {canLink ? (
                    <>
                      <OrderPicker id={`link-${tx.reference}`} data={data} value={linkChoice} onChange={setLinkChoice} allowNone={false} />
                      <Button variant="outline" className="h-9 self-start rounded-full bg-card px-4" disabled={!linkChoice} onClick={link}>
                        Link to order
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm">There are no unpaid confirmed orders to link this receipt to.</p>
                  )}
                </div>
              )}
              <Button className="h-9 self-start rounded-full px-4" disabled={!order} onClick={verify}>
                Verify against bank record
              </Button>
              {!order && <p className="text-xs text-muted-foreground">Link this receipt to an order before verifying it.</p>}
            </>
          )}
          {tx.status === 'verified' && <p className="text-sm">Matched to bank record {tx.reference}.</p>}
          {tx.status === 'unmatched' && <p className="text-sm">{unmatchedReason(data, tx)}</p>}
          {tx.status === 'failed' && <p className="text-sm text-destructive">Payment failed. No money was received.</p>}
          {tx.status === 'merchant_confirmed' && (
            <p className="text-sm">Cash sale confirmed by the merchant. No bank record applies.</p>
          )}
          <p
            aria-live="polite"
            className={cn(
              'text-sm font-semibold',
              result?.tone === 'bad' && 'text-destructive',
              !result && 'sr-only',
            )}
          >
            {result?.text}
          </p>
        </section>
        <p className="text-xs text-muted-foreground">
          Bank verification is simulated against seeded records. Moniva is not connected to any bank.
        </p>
      </div>
    </>
  )
}

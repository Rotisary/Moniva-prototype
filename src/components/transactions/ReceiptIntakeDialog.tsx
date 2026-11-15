import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { SimulatedNotice } from '@/components/moniva/SimulatedNotice'
import { StatusBadge } from '@/components/moniva/StatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SAMPLE_RECEIPTS } from '@/data/sample-receipts'
import { DEMO_TODAY } from '@/data/seed'
import type { Transaction } from '@/data/types'
import { formatNaira } from '@/lib/format'
import { NO_ORDER, recordReceipt, selectableOrders, type ReceiptInput } from '@/lib/reconciliation'
import { cn } from '@/lib/utils'
import { useDemoData } from '@/store/demo-data-context'
import { AmountCheck } from './AmountCheck'
import { OrderPicker } from './OrderPicker'
import { ReceiptCard } from './ReceiptCard'

const OPERATING_SINCE = '2025-05-30'

const uploadSchema = z.object({
  sender: z
    .string()
    .trim()
    .min(2, 'Enter the sender name (at least 2 characters).')
    .max(60, 'Keep the sender name under 60 characters.'),
  reference: z
    .string()
    .trim()
    .min(4, 'Enter the transfer reference (at least 4 characters).')
    .max(40, 'Keep the reference under 40 characters.')
    .regex(/^[A-Za-z0-9-]+$/, 'Use letters, numbers, and hyphens only.'),
  amount: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Enter a whole naira amount, digits only.')
    .refine((v) => Number(v) >= 1 && Number(v) <= 100_000_000, 'Enter an amount between ₦1 and ₦100,000,000.'),
  date: z
    .string()
    .min(1, 'Enter the date on the receipt.')
    .refine((v) => v >= OPERATING_SINCE && v <= DEMO_TODAY, 'Use a date between 30 May 2025 and 30 Nov 2026.'),
})

type UploadValues = z.infer<typeof uploadSchema>

interface ReceiptIntakeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (reference: string) => void
}

export function ReceiptIntakeDialog({ open, onOpenChange, onSaved }: ReceiptIntakeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-5 overflow-y-auto p-6 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Record a customer receipt</DialogTitle>
          <DialogDescription>
            A receipt is saved as Pending verification. It only counts as paid after it matches a trusted bank record.
          </DialogDescription>
        </DialogHeader>
        {open && <IntakeForm onSaved={onSaved} />}
      </DialogContent>
    </Dialog>
  )
}

function IntakeForm({ onSaved }: { onSaved: (reference: string) => void }) {
  const { data, update } = useDemoData()
  const [tab, setTab] = useState<'sample' | 'upload'>('sample')
  const [sampleId, setSampleId] = useState<string>()
  const [orderChoice, setOrderChoice] = useState<string>()
  const [duplicate, setDuplicate] = useState<Transaction>()
  const [file, setFile] = useState<{ name: string; url: string }>()
  const [fileError, setFileError] = useState<string>()

  const form = useForm<UploadValues>({
    resolver: zodResolver(uploadSchema),
    mode: 'onTouched',
    defaultValues: { sender: '', reference: '', amount: '', date: '' },
  })
  const watched = useWatch({ control: form.control })
  const errors = form.formState.errors

  useEffect(() => {
    return () => {
      if (file) URL.revokeObjectURL(file.url)
    }
  }, [file])

  const sample = SAMPLE_RECEIPTS.find((s) => s.id === sampleId)
  const typedAmount = /^\d+$/.test(watched.amount?.trim() ?? '') ? Number(watched.amount) : undefined
  const extraction =
    tab === 'sample'
      ? sample && { sender: sample.sender, reference: sample.reference, amount: sample.amount }
      : { sender: watched.sender?.trim() ?? '', reference: watched.reference?.trim().toUpperCase() ?? '', amount: typedAmount }

  const nameOf = (id: string) => data.customers.find((c) => c.id === id)?.name
  const senderOrders = extraction ? selectableOrders(data).filter((o) => nameOf(o.customerId) === extraction.sender) : []
  const orderValue = orderChoice ?? (senderOrders.length === 1 ? senderOrders[0].id : NO_ORDER)
  const order = data.orders.find((o) => o.id === orderValue)

  function save(input: ReceiptInput) {
    const result = recordReceipt(data, input)
    if (!result.ok) {
      if (result.reason === 'duplicate') setDuplicate(result.existing)
      else toast.error('That order can no longer take a receipt. Choose another order.')
      return
    }
    update((current) => {
      const next = recordReceipt(current, input)
      return next.ok ? next.data : current
    })
    toast.success(`Receipt ${result.reference} saved as Pending verification.`)
    onSaved(result.reference)
  }

  const orderId = orderValue === NO_ORDER ? undefined : orderValue

  function saveSample() {
    if (!sample) return
    save({ ...sample, orderId, sampleId: sample.id })
  }

  function saveUpload(event: FormEvent) {
    if (!file) setFileError('Choose a receipt image to upload.')
    void form.handleSubmit((values) => {
      if (!file) return
      save({
        sender: values.sender,
        reference: values.reference,
        amount: Number(values.amount),
        date: `${values.date}T12:00:00`,
        orderId,
        sampleId: 'upload',
        fileName: file.name,
      })
    })(event)
  }

  function chooseFile(list: FileList | null) {
    const chosen = list?.[0]
    if (!chosen) return
    setFile({ name: chosen.name, url: URL.createObjectURL(chosen) })
    setFileError(undefined)
  }

  function resetChoice() {
    setOrderChoice(undefined)
    setDuplicate(undefined)
  }

  const matching = (
    <div className="flex flex-col gap-3">
      <OrderPicker id="intake-order" data={data} value={orderValue} onChange={setOrderChoice} />
      {order && extraction?.amount !== undefined && (
        <AmountCheck receiptAmount={extraction.amount} orderAmount={order.amount} />
      )}
      {duplicate && (
        <p role="alert" className="rounded-xl border border-destructive p-3 text-sm text-destructive">
          Reference {duplicate.reference} is already recorded for {formatNaira(duplicate.amount)} with status{' '}
          <StatusBadge status={duplicate.status} className="align-middle" />. Saving it again would count the same payment
          twice, so nothing was added.
        </p>
      )}
    </div>
  )

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        setTab(value as 'sample' | 'upload')
        resetChoice()
      }}
    >
      <TabsList className="h-9">
        <TabsTrigger value="sample">Sample receipts</TabsTrigger>
        <TabsTrigger value="upload">Upload</TabsTrigger>
      </TabsList>

      <TabsContent value="sample" className="mt-3 flex flex-col gap-4">
        <ul className="grid gap-2 sm:grid-cols-3">
          {SAMPLE_RECEIPTS.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                aria-pressed={s.id === sampleId}
                onClick={() => {
                  setSampleId(s.id)
                  resetChoice()
                }}
                className={cn(
                  'w-full rounded-xl border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  s.id === sampleId ? 'border-foreground bg-tint-2' : 'border-border hover:bg-tint-1',
                )}
              >
                <span className="block font-semibold">{s.sender}</span>
                <span className="block text-sm tabular-nums">{formatNaira(s.amount)}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{s.note}</span>
              </button>
            </li>
          ))}
        </ul>
        {sample ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <ReceiptCard {...sample} label="Sample receipt" />
              <p className="text-xs text-muted-foreground">
                Extracted: reference {sample.reference}, amount {formatNaira(sample.amount)}, sender {sample.sender}.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {matching}
              <Button className="h-9 self-start rounded-full px-4" onClick={saveSample}>
                Save receipt
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Choose a sample receipt to see what Moniva extracts from it.</p>
        )}
      </TabsContent>

      <TabsContent value="upload" className="mt-3">
        <form noValidate onSubmit={saveUpload} className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Field id="receipt-file" label="Receipt image" error={fileError}>
              <Input
                id="receipt-file"
                type="file"
                accept="image/*"
                aria-invalid={fileError ? true : undefined}
                aria-describedby={fileError ? 'receipt-file-error' : undefined}
                onChange={(e) => chooseFile(e.target.files)}
                className="h-9 bg-card"
              />
            </Field>
            {file && (
              <img src={file.url} alt={`Uploaded receipt ${file.name}`} className="max-h-72 rounded-xl border border-border object-contain" />
            )}
            <SimulatedNotice>
              Simulated extraction: enter the details shown on the receipt. Moniva does not read the image, and the image is
              not stored.
            </SimulatedNotice>
          </div>
          <div className="flex flex-col gap-3">
            <Field id="sender" label="Sender name" error={errors.sender?.message}>
              <Input id="sender" className="h-9 bg-card" {...aria('sender', errors.sender)} {...form.register('sender')} />
            </Field>
            <Field id="reference" label="Transfer reference" error={errors.reference?.message}>
              <Input id="reference" className="h-9 bg-card" {...aria('reference', errors.reference)} {...form.register('reference')} />
            </Field>
            <Field id="amount" label="Amount (₦)" error={errors.amount?.message}>
              <Input id="amount" inputMode="numeric" className="h-9 bg-card" {...aria('amount', errors.amount)} {...form.register('amount')} />
            </Field>
            <Field id="date" label="Date on receipt" error={errors.date?.message}>
              <Input
                id="date"
                type="date"
                min={OPERATING_SINCE}
                max={DEMO_TODAY}
                className="h-9 bg-card"
                {...aria('date', errors.date)}
                {...form.register('date')}
              />
            </Field>
            {matching}
            <Button type="submit" className="h-9 self-start rounded-full px-4">
              Save receipt
            </Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  )
}

const aria = (name: string, error: unknown) => ({
  'aria-invalid': error ? true : undefined,
  'aria-describedby': error ? `${name}-error` : undefined,
})

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

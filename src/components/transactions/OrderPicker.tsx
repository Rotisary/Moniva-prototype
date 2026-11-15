import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { DemoDataset } from '@/data/types'
import { itemsLabel } from '@/lib/activity'
import { formatNaira } from '@/lib/format'
import { NO_ORDER, selectableOrders } from '@/lib/reconciliation'

interface OrderPickerProps {
  id: string
  data: DemoDataset
  value: string
  onChange: (value: string) => void
  allowNone?: boolean
}

/** Picks an unpaid confirmed order to match a receipt against. */
export function OrderPicker({ id, data, value, onChange, allowNone = true }: OrderPickerProps) {
  const nameOf = (customerId: string) => data.customers.find((c) => c.id === customerId)?.name ?? 'Unknown customer'
  const items = [
    ...(allowNone ? [{ value: NO_ORDER, label: 'No order yet' }] : []),
    ...selectableOrders(data).map((o) => ({
      value: o.id,
      label: `${nameOf(o.customerId)} · ${itemsLabel(data, o)} · ${formatNaira(o.amount)}`,
    })),
  ]

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>Match to an order</Label>
      <Select items={items} value={value} onValueChange={(v) => onChange(String(v))}>
        <SelectTrigger id={id} className="h-9 w-full bg-card">
          <SelectValue placeholder="Choose an unpaid order" />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Only confirmed, unpaid orders are listed, so one payment can never be linked to two orders.
      </p>
    </div>
  )
}

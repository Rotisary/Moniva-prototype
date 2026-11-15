import { formatDate } from '@/lib/format'
import { DEMO_TODAY } from '@/data/seed'

/** Shown only when printing the Financial Report. */
export function PrintReportHeader({ businessName }: { businessName: string }) {
  return (
    <header className="hidden border-b-2 border-foreground pb-3 print:block">
      <p className="text-sm font-bold">Moniva</p>
      <h1 className="text-2xl font-bold">Financial Report: {businessName}</h1>
      <p className="text-sm">Prepared {formatDate(DEMO_TODAY)} from Moniva demo records</p>
    </header>
  )
}

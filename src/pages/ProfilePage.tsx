import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { MetricCard } from '@/components/moniva/MetricCard'
import { BusinessHeader } from '@/components/profile/BusinessHeader'
import { HealthOverview } from '@/components/profile/HealthOverview'
import { PrintReportHeader } from '@/components/profile/PrintReportHeader'
import { ProfileDetails } from '@/components/profile/ProfileDetails'
import { RevenueHistoryChart } from '@/components/profile/RevenueHistoryChart'
import { ShareDialog } from '@/components/sharing/ShareDialog'
import { SharedWithPanel } from '@/components/sharing/SharedWithPanel'
import { formatNairaCompact, formatPercent } from '@/lib/format'
import { healthIndicators, profileSummary } from '@/lib/profile'
import { useDemoData } from '@/store/demo-data-context'

const PRINT_DELAY_MS = 400

export function ProfilePage() {
  const { data } = useDemoData()
  const summary = useMemo(() => profileSummary(data), [data])
  const indicators = useMemo(() => healthIndicators(summary), [summary])
  const [sharing, setSharing] = useState(false)

  function downloadReport() {
    toast.info('In the print dialog, choose Save as PDF to download the report.')
    // A short delay lets the toast appear before the browser's print dialog takes focus.
    window.setTimeout(() => window.print(), PRINT_DELAY_MS)
  }

  return (
    <div className="flex flex-col gap-4">
      <PrintReportHeader businessName={data.business.name} />
      <BusinessHeader
        business={data.business}
        operatingMonths={summary.operatingMonths}
        onDownload={downloadReport}
        onShare={() => setSharing(true)}
      />

      <section aria-label="Key figures for the last 12 months" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          variant="inverse"
          className="break-inside-avoid"
          label="Recorded revenue"
          value={formatNairaCompact(summary.revenue)}
          footnote={`${summary.salesCount} completed sales in 12 months`}
        />
        <MetricCard
          variant="tint-1"
          className="break-inside-avoid"
          label="Verified digital volume"
          value={formatNairaCompact(summary.verified)}
          footnote="Matched to trusted bank records"
        />
        <MetricCard
          variant="tint-2"
          className="break-inside-avoid"
          label="Recorded cash sales"
          value={formatNairaCompact(summary.cash)}
          footnote="Confirmed by the merchant"
        />
        <MetricCard
          variant="tint-3"
          className="break-inside-avoid"
          label="Business expenses"
          value={formatNairaCompact(summary.expenses)}
          footnote="Stock, logistics, rent, staff, and more"
        />
        <MetricCard
          className="break-inside-avoid"
          label="Estimated operating profit"
          value={formatNairaCompact(summary.profit)}
          footnote={`${formatPercent(summary.margin)} margin (revenue minus expenses)`}
        />
        <MetricCard
          className="break-inside-avoid"
          label="Outstanding receivables"
          value={formatNairaCompact(summary.receivables)}
          footnote={`${summary.openOrderCount} orders awaiting payment · not counted as revenue`}
        />
      </section>

      <RevenueHistoryChart months={summary.months} />
      <ProfileDetails summary={summary} />
      <HealthOverview indicators={indicators} />
      <SharedWithPanel shares={data.shares} />
      <ShareDialog open={sharing} onOpenChange={setSharing} summary={summary} />
    </div>
  )
}

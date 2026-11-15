import { useMemo, type ReactNode } from 'react'
import { ArrowLeft, Landmark } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { MetricCard } from '@/components/moniva/MetricCard'
import { Money } from '@/components/moniva/Money'
import { Panel } from '@/components/moniva/Panel'
import { SimulatedNotice } from '@/components/moniva/SimulatedNotice'
import { StatusBadge } from '@/components/moniva/StatusBadge'
import { Tag } from '@/components/moniva/Tag'
import { HealthOverview } from '@/components/profile/HealthOverview'
import { RevenueHistoryChart } from '@/components/profile/RevenueHistoryChart'
import type { DemoDataset, Share, ShareSection } from '@/data/types'
import { CHANNEL_LABELS, formatCount, formatDateTime, formatNairaCompact, formatPercent } from '@/lib/format'
import { monthLabel } from '@/lib/metrics'
import { healthIndicators, PROFILE_MONTHS, profileSummary, type ProfileSummary } from '@/lib/profile'
import { findShare, institutionById, SHARE_SECTIONS, SHARING_DISCLAIMER, verificationBreakdown } from '@/lib/sharing'
import { useDemoData } from '@/store/demo-data-context'

const linkClass =
  'inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold hover:bg-tint-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'

/** The bank-facing view of one confirmed share. Lives outside the merchant layout, since an institution sees no merchant navigation. */
export function InstitutionViewPage() {
  const { shareId } = useParams()
  const { data } = useDemoData()
  const share = findShare(data, shareId)

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <Link to="/profile" className={`${linkClass} self-start`}>
          <ArrowLeft aria-hidden className="size-4" />
          Back to Moniva
        </Link>
        {share ? <SharedProfile data={data} share={share} /> : <ShareNotFound />}
      </div>
    </div>
  )
}

function ShareNotFound() {
  return (
    <main className="flex flex-col items-start gap-3 rounded-2xl bg-card p-6">
      <h1 className="text-2xl font-bold tracking-tight">Shared profile not found</h1>
      <p className="text-sm text-muted-foreground">
        This link does not match a profile the merchant has shared. Shares are cleared when the demo data is reset.
      </p>
      <Link to="/profile" className={linkClass}>
        Go to the Financial Profile
      </Link>
    </main>
  )
}

function SharedProfile({ data, share }: { data: DemoDataset; share: Share }) {
  const summary = useMemo(() => profileSummary(data), [data])
  const institution = institutionById(share.institutionId)
  const has = (section: ShareSection) => share.sharedSections.includes(section)
  const notShared = SHARE_SECTIONS.filter((s) => !has(s.id))

  return (
    <main className="flex flex-col gap-4">
      <header className="flex flex-col gap-3 rounded-2xl bg-primary p-5 text-primary-foreground">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-tint-3 uppercase">
          <Landmark aria-hidden className="size-4" />
          Institution view · {institution?.name}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">{data.business.name}</h1>
        <p className="text-sm text-tint-3">
          Shared by the merchant with {institution?.name}. Consent given {formatDateTime(share.consentedAt)}. Figures cover{' '}
          {monthLabel(PROFILE_MONTHS[0], 'long')} to {monthLabel(PROFILE_MONTHS[PROFILE_MONTHS.length - 1], 'long')}.
        </p>
      </header>

      <SimulatedNotice>
        Simulated institution view. No data has left this browser. {SHARING_DISCLAIMER}
      </SimulatedNotice>

      {has('business_info') && <BusinessInfo data={data} operatingMonths={summary.operatingMonths} />}
      {has('revenue_history') && (
        <>
          <MetricCard
            variant="inverse"
            label="Recorded revenue, 12 months"
            value={formatNairaCompact(summary.revenue)}
            footnote={`${summary.salesCount} completed sales`}
          />
          <RevenueHistoryChart months={summary.months} />
        </>
      )}
      {(has('verified_volume') || has('expenses')) && (
        <section aria-label="Payments and expenses" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {has('verified_volume') && (
            <>
              <MetricCard
                variant="tint-1"
                label="Verified digital volume"
                value={formatNairaCompact(summary.verified)}
                footnote="Matched to trusted bank records"
              />
              <MetricCard
                variant="tint-2"
                label="Recorded cash sales"
                value={formatNairaCompact(summary.cash)}
                footnote="Confirmed by the merchant"
              />
            </>
          )}
          {has('expenses') && (
            <>
              <MetricCard
                variant="tint-3"
                label="Business expenses"
                value={formatNairaCompact(summary.expenses)}
                footnote="Stock, logistics, rent, staff, and more"
              />
              <MetricCard
                label="Estimated operating profit"
                value={formatNairaCompact(summary.profit)}
                footnote={`${formatPercent(summary.margin)} margin (revenue minus expenses)`}
              />
            </>
          )}
        </section>
      )}
      {has('customer_activity') && <CustomerActivity summary={summary} />}
      {has('health_indicators') && <HealthOverview indicators={healthIndicators(summary)} />}
      {has('verification_breakdown') && <VerificationPanel data={data} summary={summary} />}

      {notShared.length > 0 && (
        <Panel title="Not shared by the merchant">
          <ul className="flex flex-wrap gap-1.5">
            {notShared.map((s) => (
              <li key={s.id}>
                <Tag>{s.label}</Tag>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </main>
  )
}

function DetailList({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {rows.map(([term, value]) => (
        <div key={term} className="rounded-xl bg-background p-3">
          <dt className="text-xs text-muted-foreground">{term}</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function BusinessInfo({ data, operatingMonths }: { data: DemoDataset; operatingMonths: number }) {
  const b = data.business
  return (
    <Panel title="Business information">
      <DetailList
        rows={[
          ['Category', b.category],
          ['Location', b.location],
          ['Sales channels', `${CHANNEL_LABELS[b.primaryChannel]} Business (primary), ${CHANNEL_LABELS[b.secondaryChannel]} (secondary)`],
          ['Operating history', `${operatingMonths} months (since ${monthLabel(b.operatingSince.slice(0, 7), 'long')})`],
        ]}
      />
    </Panel>
  )
}

function CustomerActivity({ summary: s }: { summary: ProfileSummary }) {
  return (
    <Panel title="Customer activity">
      <DetailList
        rows={[
          ['Completed sales, 12 months', formatCount(s.salesCount)],
          ['Sales a month', s.avgSalesPerMonth.toFixed(1)],
          ['Paying customers', formatCount(s.payers)],
          ['Repeat customer rate', `${formatPercent(s.repeatRate)} (${s.returning} returning)`],
        ]}
      />
    </Panel>
  )
}

function VerificationPanel({ data, summary }: { data: DemoDataset; summary: ProfileSummary }) {
  const b = verificationBreakdown(data, summary)
  return (
    <Panel title="Data verification breakdown">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Recorded revenue by verification</h3>
          <ul className="flex flex-col">
            {(
              [
                ['verified', 'Bank-matched digital payments', b.verified],
                ['merchant_confirmed', 'Cash sales confirmed by the merchant', b.merchantConfirmed],
              ] as const
            ).map(([status, label, part]) => (
              <li key={status} className="flex flex-wrap items-center gap-2 border-b border-border py-2.5">
                <StatusBadge status={status} />
                <span className="text-sm">{label}</span>
                <span className="ml-auto text-sm font-semibold">
                  <Money amount={part.amount} /> · {formatPercent(part.share)}
                </span>
              </li>
            ))}
            <li className="flex items-center gap-2 py-2.5 text-sm font-semibold">
              Recorded revenue
              <span className="ml-auto">
                <Money amount={b.revenue} />
              </span>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground">
            Pending, unmatched, and failed payments are not counted as verified.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Records by verification label</h3>
          <ul className="flex flex-col">
            {b.records.map((r) => (
              <li key={r.label} className="flex items-center gap-2 border-b border-border py-2.5 last:border-b-0">
                <StatusBadge status={r.label} />
                <span className="ml-auto text-sm font-semibold tabular-nums">{formatCount(r.count)}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            {formatCount(b.recordTotal)} orders, transactions, and expenses in the 12-month window.
          </p>
        </div>
      </div>
    </Panel>
  )
}

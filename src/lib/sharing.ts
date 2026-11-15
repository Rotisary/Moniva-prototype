import { format } from 'date-fns'
import { DEMO_TODAY } from '@/data/seed'
import type { DemoDataset, InstitutionId, Share, ShareSection, VerificationLabel } from '@/data/types'
import { PROFILE_MONTHS, type ProfileSummary } from './profile'
import { ratio } from './metrics'

/** Exact wording from the project plan. Shown in the sharing flow and on the bank-facing view. */
export const SHARING_DISCLAIMER =
  'This is a simulated financial data-sharing experience. Moniva does not approve loans or make lending decisions. Financial institutions independently determine eligibility.'

export interface Institution {
  id: InstitutionId
  name: string
  type: string
  description: string
}

/** Fictional institutions. None of these names belong to a real lender. */
export const INSTITUTIONS: Institution[] = [
  {
    id: 'ireti-mfb',
    name: 'Ireti Microfinance Bank',
    type: 'Microfinance bank',
    description: 'Working-capital support for small traders and market businesses.',
  },
  {
    id: 'adunni-coop',
    name: 'Adunni Cooperative Credit',
    type: 'Cooperative lender',
    description: 'Member-owned credit for artisans and retail sellers.',
  },
  {
    id: 'ofure-sme',
    name: 'Ofure SME Lending',
    type: 'SME lender',
    description: 'Stock and inventory finance for growing online sellers.',
  },
]

export const INSTITUTION_IDS = ['ireti-mfb', 'adunni-coop', 'ofure-sme'] as const satisfies readonly InstitutionId[]

export interface ShareSectionInfo {
  id: ShareSection
  label: string
  description: string
}

/** In display and storage order. Business information is always shared. */
export const SHARE_SECTIONS: ShareSectionInfo[] = [
  { id: 'business_info', label: 'Business information', description: 'Name, category, location, channels, operating history' },
  { id: 'revenue_history', label: 'Revenue history', description: '12-month recorded revenue, verified and cash' },
  { id: 'verified_volume', label: 'Verified payment volume', description: 'Bank-verified digital volume and recorded cash sales' },
  { id: 'expenses', label: 'Expenses and profit', description: 'Business expenses, estimated operating profit, margin' },
  { id: 'customer_activity', label: 'Customer activity', description: 'Completed sales, paying and returning customers' },
  { id: 'health_indicators', label: 'Financial Health Overview', description: 'The five indicators with their explanations' },
  {
    id: 'verification_breakdown',
    label: 'Data verification breakdown',
    description: 'How much of the record is bank-verified or merchant-confirmed',
  },
]

export const SHARE_SECTION_IDS = [
  'business_info',
  'revenue_history',
  'verified_volume',
  'expenses',
  'customer_activity',
  'health_indicators',
  'verification_breakdown',
] as const satisfies readonly ShareSection[]

export const institutionById = (id: InstitutionId) => INSTITUTIONS.find((i) => i.id === id)

export const findShare = (data: DemoDataset, id: string | undefined) => data.shares.find((s) => s.id === id)

export interface ShareInput {
  institutionId: InstitutionId
  sections: ShareSection[]
}

/** The demo runs on a fixed date, so consent is stamped on DEMO_TODAY with the real time of day. */
export const consentTimestamp = (now: Date) => `${DEMO_TODAY}T${format(now, 'HH:mm:ss')}`

/** Appends a confirmed share. Pure, so `now` is passed in. */
export function addShare(data: DemoDataset, input: ShareInput, now: Date): DemoDataset {
  const chosen = new Set<ShareSection>([...input.sections, 'business_info'])
  const share: Share = {
    id: `share-${data.shares.length + 1}`,
    institutionId: input.institutionId,
    sharedSections: SHARE_SECTION_IDS.filter((id) => chosen.has(id)),
    consentedAt: consentTimestamp(now),
  }
  return { ...data, shares: [...data.shares, share] }
}

export interface VerificationBreakdown {
  revenue: number
  verified: { amount: number; share: number }
  merchantConfirmed: { amount: number; share: number }
  /** Orders, transactions, and expenses in the profile window, counted by verification label. */
  records: Array<{ label: VerificationLabel; count: number }>
  recordTotal: number
}

const LABEL_ORDER: VerificationLabel[] = ['verified', 'merchant_confirmed', 'unverified', 'inferred']

/** Revenue split matches the profile summary, so verified plus merchant-confirmed equals recorded revenue. */
export function verificationBreakdown(data: DemoDataset, summary: ProfileSummary): VerificationBreakdown {
  const inPeriod = (date: string) => PROFILE_MONTHS.includes(date.slice(0, 7))
  const counts = new Map<VerificationLabel, number>()
  const records = [...data.orders, ...data.transactions, ...data.expenses].filter((r) => inPeriod(r.date))
  for (const r of records) counts.set(r.verificationLabel, (counts.get(r.verificationLabel) ?? 0) + 1)

  return {
    revenue: summary.revenue,
    verified: { amount: summary.verified, share: ratio(summary.verified, summary.revenue) },
    merchantConfirmed: { amount: summary.cash, share: ratio(summary.cash, summary.revenue) },
    records: LABEL_ORDER.map((label) => ({ label, count: counts.get(label) ?? 0 })),
    recordTotal: records.length,
  }
}

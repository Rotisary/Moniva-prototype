import { ArrowLeftRight, ChartLine, FileText, House, MessageCircle, Repeat, Settings, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  subtitle: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Overview', icon: House, subtitle: '' },
  {
    to: '/social-commerce',
    label: 'Social Commerce',
    icon: MessageCircle,
    subtitle: 'Customer conversations and the business activity extracted from them',
  },
  {
    to: '/transactions',
    label: 'Transactions',
    icon: ArrowLeftRight,
    subtitle: 'Payment records, receipts, and reconciliation',
  },
  {
    to: '/insights',
    label: 'Financial Insights',
    icon: ChartLine,
    subtitle: 'Commerce and financial performance, with recommendations',
  },
  {
    to: '/profile',
    label: 'Financial Profile',
    icon: FileText,
    subtitle: 'Your business financial profile and health overview',
  },
  {
    to: '/repeat-customers',
    label: 'Repeat Customers',
    icon: Repeat,
    subtitle: 'Returning customers and reorder opportunities',
  },
  { to: '/settings', label: 'Settings', icon: Settings, subtitle: 'Business details and demo data' },
]

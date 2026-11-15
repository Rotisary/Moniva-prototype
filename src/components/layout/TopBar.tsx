import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Initials } from '@/components/moniva/Initials'
import { CURRENT_MONTH, monthLabel, previousMonth } from '@/lib/metrics'
import { useDemoData } from '@/store/demo-data-context'
import { NAV_ITEMS } from './nav'

const OVERVIEW_SUBTITLE = `${monthLabel(CURRENT_MONTH, 'long')} · compared with ${monthLabel(previousMonth(CURRENT_MONTH), 'long')}`

export function TopBar({ menu }: { menu: ReactNode }) {
  const { pathname } = useLocation()
  const { data } = useDemoData()
  const item = NAV_ITEMS.find((nav) => nav.to === pathname) ?? NAV_ITEMS[0]
  const subtitle = item.to === '/' ? OVERVIEW_SUBTITLE : item.subtitle

  return (
    <header className="mb-6 flex items-center gap-4">
      {menu}
      <div className="min-w-0">
        <h1 className="text-3xl font-bold tracking-tight">{item.label}</h1>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="ml-auto" title={data.business.name}>
        <Initials name={data.business.name} dark className="size-10" />
      </div>
    </header>
  )
}

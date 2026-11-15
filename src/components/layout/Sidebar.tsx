import { NavLink } from 'react-router-dom'
import { Initials } from '@/components/moniva/Initials'
import { Tag } from '@/components/moniva/Tag'
import { cn } from '@/lib/utils'
import { useDemoData } from '@/store/demo-data-context'
import { NAV_ITEMS } from './nav'

export function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <span
        aria-hidden
        className="grid size-9 place-items-center rounded-[10px] bg-primary text-lg font-extrabold text-primary-foreground"
      >
        M
      </span>
      <span className="text-[1.375rem] font-bold tracking-tight">Moniva</span>
    </div>
  )
}

/** Sidebar contents, shared by the desktop sidebar and the mobile sheet. */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { data } = useDemoData()
  return (
    <div className="flex h-full flex-col px-4 pt-7 pb-4">
      <Brand />
      <nav aria-label="Main" className="mt-8 flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-full px-4 py-2.5 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-tint-2',
              )
            }
          >
            <Icon aria-hidden className="size-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-2.5 rounded-2xl bg-background p-3">
        <Initials name={data.business.name} dark />
        <div className="min-w-0">
          <p className="truncate text-sm leading-tight font-semibold">{data.business.name}</p>
          <Tag className="mt-1">Demo data</Tag>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { SidebarContent } from './Sidebar'
import { TopBar } from './TopBar'

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  const menu = (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetTrigger
        render={<Button variant="outline" size="icon-lg" className="rounded-full bg-card lg:hidden" aria-label="Open navigation" />}
      >
        <Menu aria-hidden />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 gap-0 border-0 bg-sidebar p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SidebarContent onNavigate={() => setMenuOpen(false)} />
      </SheetContent>
    </Sheet>
  )

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 bg-sidebar lg:block">
        <SidebarContent />
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-6">
        <TopBar menu={menu} />
        <Outlet />
      </main>
    </div>
  )
}

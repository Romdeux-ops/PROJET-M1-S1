import { Logo } from '@/components/logo'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { useShell } from './shell-store'
import { SidebarNav } from './sidebar-nav'

export function MobileNav() {
  const open = useShell((s) => s.mobileOpen)
  const setOpen = useShell((s) => s.setMobileOpen)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-72 gap-0 bg-sidebar p-0">
        <SheetHeader className="h-16 justify-center px-4">
          <SheetTitle>
            <Logo />
          </SheetTitle>
          <SheetDescription className="sr-only">Navigation principale</SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <div className="px-3 py-2">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

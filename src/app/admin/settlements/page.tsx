// @/app/admin/settlements/page.tsx

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import SettlementsClient from "./settlements-client"

export default function Page() {
  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />

          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-4 px-4 py-6 lg:px-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Daily ሂሳብ
                </h1>
                <p className="text-sm text-muted-foreground">
                  Daily waiter sales, bank transfers and cash settlements.
                </p>
              </div>

              <SettlementsClient />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

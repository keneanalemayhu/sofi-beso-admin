// @/components/app-sidebar.tsx

"use client"
import * as React from "react"
import Link from "next/link"
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  UtensilsCrossed,
  FolderTree,
  ReceiptText,
  Users,
} from "lucide-react"
import { IconSquareLetterS } from "@tabler/icons-react"

const data = {
  navSections: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/admin",
          icon: <LayoutDashboardIcon />,
        },
      ],
    },
    {
      title: "Menu",
      items: [
        {
          title: "Categories",
          url: "/admin/categories",
          icon: <FolderTree />,
        },
        {
          title: "Items",
          url: "/admin/items",
          icon: <UtensilsCrossed />,
        },
      ],
    },
    {
      title: "Operations",
      items: [
        {
          title: "Orders",
          url: "/admin/orders",
          icon: <ReceiptText />,
        },
        {
          title: "Waiters",
          url: "/admin/waiters",
          icon: <Users />,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/admin" className="flex items-center gap-2">
                <IconSquareLetterS className="size-5!" />

                <div className="flex flex-col leading-tight">
                  <span className="text-base font-semibold">
                    Sofi Beso Admin
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Powered by Jirehgrp
                  </p>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navSections.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMain items={section.items} />
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
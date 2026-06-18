// @/components/site-header.tsx

"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Header from "./common/Header"

type Crumb = {
  label: string
  href?: string
}

function getBreadcrumbs(pathname: string): Crumb[] {
  if (pathname === "/admin") return [{ label: "Admin" }]

  if (pathname === "/admin/categories")
    return [{ label: "Admin", href: "/admin" }, { label: "Categories" }]

  if (pathname === "/admin/items")
    return [{ label: "Admin", href: "/admin" }, { label: "Items" }]

  if (pathname === "/admin/orders")
    return [{ label: "Admin", href: "/admin" }, { label: "Orders" }]

  if (pathname.startsWith("/admin/orders/"))
    return [
      { label: "Admin", href: "/admin" },
      { label: "Orders", href: "/admin/orders" },
      { label: "Order Details" },
    ]

  if (pathname === "/admin/waiters")
    return [{ label: "Admin", href: "/admin" }, { label: "Waiters" }]

  return [{ label: "Admin" }]
}

export function SiteHeader() {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <header className="flex h-(--header-height) items-center justify-between border-b px-4 lg:px-6">
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4" />

        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1

              return (
                <div key={`${crumb.label}-${index}`} className="flex items-center">
                  <BreadcrumbItem>
                    {isLast || !crumb.href ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </BreadcrumbItem>

                  {!isLast ? <BreadcrumbSeparator /> : null}
                </div>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Header />
    </header>
  )
}
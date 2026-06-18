// @/app/admin/orders/layout.tsx

import * as React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Orders | Sofi Beso Admin",
  description: "Sofi Beso management system by Jirehgrp.",
}

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div>{children}</div>
}
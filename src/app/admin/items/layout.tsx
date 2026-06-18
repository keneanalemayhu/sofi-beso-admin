// @/app/admin/items/layout.tsx

import * as React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Items | Sofi Beso Admin",
  description: "Sofi Beso management system by Jirehgrp.",
}

export default function ItemsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div>{children}</div>
}
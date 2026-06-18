// @/app/admin/categories/layout.tsx

import * as React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Categories | Sofi Beso Admin",
  description: "Sofi Beso management system by Jirehgrp.",
}

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div>{children}</div>
}
// @/app/admin/staff/layout.tsx

import * as React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Staff | Sofi Beso Admin",
  description: "Sofi Beso management system by Jirehgrp.",
}

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div>{children}</div>
}
// @/app/admin/layout.tsx

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin | Sofi Beso",
  description: "Sofi Beso management system by Jirehgrp.",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
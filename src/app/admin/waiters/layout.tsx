// @/app/admin/waiters/layout.tsx

import * as React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Waiters | Sofi Beso Admin",
  description: "Sofi Beso management system by Jirehgrp.",
}

export default function WaitersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div>{children}</div>
}
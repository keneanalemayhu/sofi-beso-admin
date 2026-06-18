// @/lib/api/analytics.ts

import { apiJson } from "@/lib/api/client"
import type { Overview } from "@/types"

export async function getOverview(period: number): Promise<Overview> {
  return apiJson<Overview>(`/analytics/overview?period=${period}`)
}
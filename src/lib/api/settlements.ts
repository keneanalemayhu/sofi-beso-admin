// @/lib/api/settlements.ts

import { apiJson } from "@/lib/api/client"
import type {
  BranchSlug,
  DailySettlementsResponse,
  SaveSettlementInput,
} from "@/types/settlement"

export function getDailySettlements(
  branch: BranchSlug,
  date: string
): Promise<DailySettlementsResponse> {
  const params = new URLSearchParams({ date })

  return apiJson<DailySettlementsResponse>(
    `/settlements?${params}`,
    {
      headers: {
        "X-Branch-Slug": branch,
      },
    }
  )
}

export function saveDailySettlement(
  branch: BranchSlug,
  input: SaveSettlementInput
): Promise<{ success: boolean }> {
  return apiJson<{ success: boolean }>("/settlements", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Branch-Slug": branch,
    },
    body: JSON.stringify(input),
  })
}

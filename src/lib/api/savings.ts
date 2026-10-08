// @/lib/api/savings.ts

import { apiJson } from "@/lib/api/client"

export interface SavingsPlan {
  plan_id: string
  name: string
  period_type: "daily" | "weekly" | "monthly"
  target_per_period: string | number
  period_count: number
  start_date: string
  is_active: boolean
  [key: string]: unknown
}

export interface SavingsPeriod {
  period_index: number
  period_start: string
  period_end: string
  checked: boolean
  amount: string | number
  running_total: string | number
  saved_at: string | null
  note: string | null
  available_cash: string | number
}

export interface SavingsPlanDetail extends SavingsPlan {
  periods: SavingsPeriod[]
}

export interface CreateSavingsPlan {
  name: string
  period_type: "daily"
  target_per_period: number
  period_count: number
  start_date: string
}

export async function getSavingsPlans() {
  return apiJson<SavingsPlan[]>("/savings/plans")
}

export async function getSavingsPlan(id: string) {
  return apiJson<SavingsPlanDetail>(
    `/savings/plans/${encodeURIComponent(id)}`
  )
}

export async function createSavingsPlan(input: CreateSavingsPlan) {
  return apiJson<{ id: string }>("/savings/plans", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function recordSaving(
  planId: string,
  periodIndex: number,
  amount: number
) {
  return apiJson(
    `/savings/plans/${encodeURIComponent(planId)}/entries`,
    {
      method: "POST",
      body: JSON.stringify({
        period_index: periodIndex,
        amount,
      }),
    }
  )
}

export async function removeSaving(
  planId: string,
  periodIndex: number
) {
  return apiJson<void>(
    `/savings/plans/${encodeURIComponent(planId)}/entries/${periodIndex}`,
    { method: "DELETE" }
  )
}

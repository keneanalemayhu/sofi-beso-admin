// @/lib/api/wages.ts

import { apiJson } from "@/lib/api/client"
import type {
  StaffMember,
  UpdateWageInput,
  WagePayment,
  CreateWagePaymentInput,
} from "@/types"

/** Waiters joined with wage config and computed next payday. */
export async function getStaff(): Promise<StaffMember[]> {
  return apiJson<StaffMember[]>("/wages/waiters")
}

export async function updateWage(
  id: string,
  input: UpdateWageInput
): Promise<StaffMember> {
  return apiJson<StaffMember>(`/wages/waiters/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export async function getDueWages(): Promise<StaffMember[]> {
  return apiJson<StaffMember[]>("/wages/due")
}

export async function getWagePayments(params?: {
  waiter_id?: string
  from?: string
  to?: string
}): Promise<WagePayment[]> {
  const qs = new URLSearchParams()
  if (params?.waiter_id) qs.set("waiter_id", params.waiter_id)
  if (params?.from) qs.set("from", params.from)
  if (params?.to) qs.set("to", params.to)
  const suffix = qs.toString() ? `?${qs}` : ""
  return apiJson<WagePayment[]>(`/wages/payments${suffix}`)
}

export async function createWagePayment(
  input: CreateWagePaymentInput
): Promise<WagePayment> {
  return apiJson<WagePayment>("/wages/payments", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function deleteWagePayment(id: string): Promise<void> {
  return apiJson<void>(`/wages/payments/${id}`, { method: "DELETE" })
}
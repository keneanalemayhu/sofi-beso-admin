// @/lib/api/staff.ts
// Routes remain /waiters: the POS and orders.waiter_id depend on that name.

import { apiJson } from "@/lib/api/client"
import type { Staff, CreateStaffInput, UpdateStaffInput } from "@/types"

/** All staff regardless of role — the admin list. */
export async function getAllStaff(): Promise<Staff[]> {
  return apiJson<Staff[]>("/waiters/all")
}

/** Active waiters only — what the POS order screen offers. */
export async function getWaiterOptions(): Promise<Staff[]> {
  return apiJson<Staff[]>("/waiters")
}

export async function createStaff(input: CreateStaffInput): Promise<Staff> {
  return apiJson<Staff>("/waiters", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateStaff(
  id: string,
  input: UpdateStaffInput
): Promise<Staff> {
  return apiJson<Staff>(`/waiters/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export async function toggleStaff(id: string): Promise<Staff> {
  return apiJson<Staff>(`/waiters/${id}/toggle`, {
    method: "PATCH",
  })
}

export async function deleteStaff(id: string): Promise<{ success: boolean }> {
  return apiJson<{ success: boolean }>(`/waiters/${id}`, {
    method: "DELETE",
  })
}
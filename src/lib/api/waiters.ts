// @/lib/api/waiters.ts

import { apiJson } from "@/lib/api/client"
import type {
  Waiter,
  CreateWaiterInput,
  UpdateWaiterInput,
} from "@/types"

export async function getWaiters(): Promise<Waiter[]> {
  return apiJson<Waiter[]>("/waiters/all")
}

export async function createWaiter(input: CreateWaiterInput): Promise<Waiter> {
  return apiJson<Waiter>("/waiters", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateWaiter(
  id: string,
  input: UpdateWaiterInput
): Promise<Waiter> {
  return apiJson<Waiter>(`/waiters/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export async function toggleWaiter(id: string): Promise<Waiter> {
  return apiJson<Waiter>(`/waiters/${id}/toggle`, {
    method: "PATCH",
  })
}

export async function deleteWaiter(
  id: string
): Promise<{ success: boolean }> {
  return apiJson<{ success: boolean }>(`/waiters/${id}`, {
    method: "DELETE",
  })
}
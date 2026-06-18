// @/lib/api/orders.ts

import { apiJson } from "@/lib/api/client"
import type { OrderWithItems, UpdateOrderStatusInput } from "@/types"

export async function getOrdersByRange(
  from: string,
  to: string
): Promise<OrderWithItems[]> {
  const params = new URLSearchParams({ from, to })
  return apiJson<OrderWithItems[]>(`/orders/by-range?${params.toString()}`)
}

export async function updateOrderStatus(
  id: string,
  input: UpdateOrderStatusInput
): Promise<{ success: boolean }> {
  return apiJson<{ success: boolean }>(`/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}
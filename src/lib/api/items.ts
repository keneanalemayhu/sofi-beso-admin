// @/lib/api/items.ts

import { apiJson } from "@/lib/api/client"
import type {
  MenuItem,
  CreateMenuItemInput,
  UpdateMenuItemInput,
} from "@/types"

export async function getMenuItems(): Promise<MenuItem[]> {
  return apiJson<MenuItem[]>("/menu/all")
}

export async function createMenuItem(
  input: CreateMenuItemInput
): Promise<MenuItem> {
  return apiJson<MenuItem>("/menu", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateMenuItem(
  id: string,
  input: UpdateMenuItemInput
): Promise<MenuItem> {
  return apiJson<MenuItem>(`/menu/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export async function toggleMenuItem(id: string): Promise<MenuItem> {
  return apiJson<MenuItem>(`/menu/${id}/toggle`, {
    method: "PATCH",
  })
}

export async function deleteMenuItem(
  id: string
): Promise<{ success: boolean }> {
  return apiJson<{ success: boolean }>(`/menu/${id}`, {
    method: "DELETE",
  })
}
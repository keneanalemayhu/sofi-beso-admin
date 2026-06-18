// @/lib/api/categories.ts

import { apiJson } from "@/lib/api/client"
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/types"

export async function getCategories(): Promise<Category[]> {
  return apiJson<Category[]>("/categories")
}

export async function createCategory(
  input: CreateCategoryInput
): Promise<Category> {
  return apiJson<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<Category> {
  return apiJson<Category>(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export async function deleteCategory(
  id: string
): Promise<{ success: boolean }> {
  return apiJson<{ success: boolean }>(`/categories/${id}`, {
    method: "DELETE",
  })
}
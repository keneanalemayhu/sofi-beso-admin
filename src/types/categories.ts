// @/types/categories.ts

export type Category = {
  id: string
  name: string
  created_at: string
  item_count: number
}

export type CreateCategoryInput = {
  name: string
}

export type UpdateCategoryInput = {
  name: string
}
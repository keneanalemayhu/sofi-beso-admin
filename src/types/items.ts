// @/types/items.ts

export type MenuItem = {
  id: string
  category_id: string
  category_name: string
  name: string
  price: string // pg numeric comes back as string
  is_active: boolean
  created_at: string
}

export type CreateMenuItemInput = {
  category_id: string
  name: string
  price: number
  is_active?: boolean
}

export type UpdateMenuItemInput = {
  category_id?: string
  name?: string
  price?: number
  is_active?: boolean
}
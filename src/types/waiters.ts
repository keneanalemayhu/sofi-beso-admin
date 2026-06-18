// @/types/waiters.ts

export type Waiter = {
  id: string
  name: string
  is_active: boolean
  created_at: string
}

export type CreateWaiterInput = {
  name: string
}

export type UpdateWaiterInput = {
  name?: string
  is_active?: boolean
}
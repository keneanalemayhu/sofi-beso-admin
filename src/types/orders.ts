// @/types/orders.ts

export type OrderStatus = "pending" | "completed" | "voided"

export type Order = {
  id: string
  order_number: number
  waiter_id: string | null
  waiter_name: string | null
  created_by: string
  status: OrderStatus
  total_amount: string
  serving_mode: string
  created_at: string
  completed_at: string | null
  voided_at: string | null
  voided_by: string | null
  void_reason: string | null
}

export type OrderItem = {
  id: string
  order_id: string
  menu_item_id: string
  name: string
  quantity: number
  price_at_time: string
  comment: string | null
}

export type OrderWithItems = {
  order: Order
  items: OrderItem[]
}

export type UpdateOrderStatusInput = {
  status: OrderStatus
  voided_by?: string
  void_reason?: string
}
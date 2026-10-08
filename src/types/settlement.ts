// @/types/settlement.ts

export type BranchSlug = "main" | "imperial"

export interface WaiterSettlement {
  waiter_id: string
  waiter_name: string
  is_active: boolean
  order_count: number
  sales: number
  settlement_id: string | null
  bank_amount: number | null
  cash_amount: number | null
  turned_in: number | null
  is_recorded: boolean
  updated_at: string | null
}

export interface DailySettlementsResponse {
  business_date: string
  branch_id: string
  waiters: WaiterSettlement[]
  totals: {
    sales: number
    bank: number
    cash: number
    recorded_waiters: number
  }
}

export interface SaveSettlementInput {
  waiter_id: string
  business_date: string
  bank_amount: number
  cash_amount: number
}

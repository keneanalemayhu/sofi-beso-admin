// @/types/wage.ts

export type WageCycle = "daily" | "weekly" | "monthly"
export type WageCalendar = "gregorian" | "ethiopian"
import type { StaffRole } from "./staff"

export type NextPayday = {
  gregorian: string
  ethiopian: string
}


/** A waiter row enriched with wage config — the Staff page's row type. */
export type StaffMember = {
  id: string
  name: string
  role: StaffRole
  is_active: boolean
  wage_amount: string
  wage_cycle: WageCycle
  wage_day: number | null
  wage_calendar: WageCalendar
  hired_on: string | null
  last_paid_on: string | null
  last_paid_amount: string | null
  last_period_end: string | null
  next_payday: NextPayday | null
}

export type UpdateWageInput = {
  wage_amount?: number
  wage_cycle?: WageCycle
  wage_day?: number | null
  wage_calendar?: WageCalendar
  hired_on?: string | null
}

export type WagePayment = {
  id: string
  waiter_id: string
  amount: string
  period_start: string
  period_end: string
  paid_on: string
  paid_by: string | null
  note: string | null
  created_at: string
  waiter_name: string
}

export type CreateWagePaymentInput = {
  waiter_id: string
  amount: number
  period_start: string
  period_end: string
  paid_on?: string
  payment_method?: string
  note?: string | null
}
// @/types/staff.ts

export type StaffRole =
  | "waiter"
  | "cook"
  | "cashier"
  | "janitor"
  | "manager"
  | "other"

export const STAFF_ROLES: { value: StaffRole; label: string }[] = [
  { value: "waiter", label: "Waiter" },
  { value: "cook", label: "Cook" },
  { value: "cashier", label: "Cashier" },
  { value: "janitor", label: "Janitor" },
  { value: "manager", label: "Manager" },
  { value: "other", label: "Other" },
]

/** Base record. The API calls this a waiter; we call it staff. */
export type Staff = {
  id: string
  name: string
  role: StaffRole
  is_active: boolean
  created_at: string
}

export type CreateStaffInput = {
  name: string
  role?: StaffRole
}

export type UpdateStaffInput = {
  name?: string
  role?: StaffRole
  is_active?: boolean
}
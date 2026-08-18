// @/types/expense.ts

export type PaymentMethod = "cash" | "transfer" | "telebirr" | "cbe" | "other"
export type Frequency = "daily" | "weekly" | "monthly"

export type ExpenseCategory = {
  id: string
  name: string
  created_at: string
}

export type Expense = {
  id: string
  category_id: string | null
  recurring_expense_id: string | null
  wage_payment_id: string | null
  description: string
  amount: string
  expense_date: string // 'YYYY-MM-DD'
  payment_method: PaymentMethod
  created_by: string | null
  note: string | null
  created_at: string
  category_name: string | null
  is_recurring: boolean
  is_wage: boolean
  waiter_name: string | null
}

export type CreateExpenseInput = {
  category_id?: string | null
  description: string
  amount: number
  expense_date?: string
  payment_method?: PaymentMethod
  note?: string | null
}

export type RecurringExpense = {
  id: string
  category_id: string | null
  description: string
  amount: string
  frequency: Frequency
  day_of_week: number | null
  day_of_month: number | null
  start_date: string
  end_date: string | null
  is_active: boolean
  created_at: string
  category_name: string | null
  last_generated: string | null
}

export type CreateRecurringInput = {
  category_id?: string | null
  description: string
  amount: number
  frequency: Frequency
  day_of_week?: number | null
  day_of_month?: number | null
  start_date?: string
  end_date?: string | null
}

export type ExpenseSummary = {
  from: string
  to: string
  totals: {
    revenue: string
    expenses: string
    savings: string
    available_cash: string
  }
  by_category: { category: string; total: string; count: string }[]
}
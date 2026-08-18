// @/lib/api/expenses.ts

import { apiJson } from "@/lib/api/client"
import type {
  Expense,
  ExpenseCategory,
  ExpenseSummary,
  RecurringExpense,
  CreateExpenseInput,
  CreateRecurringInput,
} from "@/types"

export async function getExpenses(params?: {
  from?: string
  to?: string
  category_id?: string
}): Promise<Expense[]> {
  const qs = new URLSearchParams()
  if (params?.from) qs.set("from", params.from)
  if (params?.to) qs.set("to", params.to)
  if (params?.category_id) qs.set("category_id", params.category_id)
  const suffix = qs.toString() ? `?${qs}` : ""
  return apiJson<Expense[]>(`/expenses${suffix}`)
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  return apiJson<Expense>("/expenses", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateExpense(
  id: string,
  input: Partial<CreateExpenseInput>
): Promise<Expense> {
  return apiJson<Expense>(`/expenses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export async function deleteExpense(id: string): Promise<void> {
  return apiJson<void>(`/expenses/${id}`, { method: "DELETE" })
}

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  return apiJson<ExpenseCategory[]>("/expenses/categories")
}

export async function createExpenseCategory(name: string): Promise<ExpenseCategory> {
  return apiJson<ExpenseCategory>("/expenses/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  })
}

export async function getRecurringExpenses(): Promise<RecurringExpense[]> {
  return apiJson<RecurringExpense[]>("/expenses/recurring")
}

export async function createRecurringExpense(
  input: CreateRecurringInput
): Promise<RecurringExpense> {
  return apiJson<RecurringExpense>("/expenses/recurring", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateRecurringExpense(
  id: string,
  input: { description?: string; amount?: number; is_active?: boolean; end_date?: string | null }
): Promise<RecurringExpense> {
  return apiJson<RecurringExpense>(`/expenses/recurring/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export async function deleteRecurringExpense(id: string): Promise<void> {
  return apiJson<void>(`/expenses/recurring/${id}`, { method: "DELETE" })
}

export async function getExpenseSummary(
  from?: string,
  to?: string
): Promise<ExpenseSummary> {
  const qs = new URLSearchParams()
  if (from) qs.set("from", from)
  if (to) qs.set("to", to)
  const suffix = qs.toString() ? `?${qs}` : ""
  return apiJson<ExpenseSummary>(`/expenses/summary${suffix}`)
}
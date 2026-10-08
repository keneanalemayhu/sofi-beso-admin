
"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarToggle } from "@/components/calendar-toggle"
import { useCalendarMode } from "@/contexts/calendar-context"

import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/lib/api/expenses"

import type { Expense } from "@/types"

function addisToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Addis_Ababa",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

function shiftDate(date: string, offset: number) {
  const d = new Date(`${date}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + offset)
  return d.toISOString().slice(0, 10)
}

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

export default function ExpensesClient() {
  const [date, setDate] = useState(addisToday)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const { formatDate } = useCalendarMode()

  const reload = useCallback(() => {
    setRefreshKey((value) => value + 1)
  }, [])

  useEffect(() => {
    let active = true

    async function loadExpenses() {
      setLoading(true)

      try {
        const data = await getExpenses({
          from: date,
          to: date,
        })

        if (active) setExpenses(data)
      } catch (error) {
        if (active) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load expenses"
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadExpenses()

    return () => {
      active = false
    }
  }, [date, refreshKey])

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  )

  function resetForm() {
    setName("")
    setAmount("")
    setEditingId(null)
  }

  function startEditing(expense: Expense) {
    setEditingId(expense.id)
    setName(
      expense.description === "Unspecified expense"
        ? ""
        : expense.description
    )
    setAmount(String(expense.amount))
  }

  async function saveExpense() {
    const parsedAmount = Number(amount)

    if (
      !amount.trim() ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      !Number.isInteger(parsedAmount * 100)
    ) {
      toast.error("Enter a valid amount")
      return
    }

    try {
      setSaving(true)

      const payload = {
        description: name.trim() || "Unspecified expense",
        amount: parsedAmount,
        expense_date: date,
      }

      if (editingId) {
        await updateExpense(editingId, payload)
        toast.success("Expense updated")
      } else {
        await createExpense(payload)
        toast.success("Expense added")
      }

      resetForm()
      reload()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save expense"
      )
    } finally {
      setSaving(false)
    }
  }

  async function removeExpense(id: string) {
    if (!window.confirm("Delete this expense?")) return

    try {
      await deleteExpense(id)
      toast.success("Expense deleted")
      reload()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete expense"
      )
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                Daily Expenses
              </h2>
              <p className="text-sm text-muted-foreground">
                {formatDate(date)}
              </p>
            </div>
            <CalendarToggle />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setDate(shiftDate(date, -1))
                resetForm()
              }}
              aria-label="Previous day"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <Input
              type="date"
              value={date}
              onChange={(e) => {
                if (!e.target.value) return
                setDate(e.target.value)
                resetForm()
              }}
              className="flex-1"
            />

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setDate(shiftDate(date, 1))
                resetForm()
              }}
              aria-label="Next day"
            >
              <ChevronRight className="size-4" />
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setDate(addisToday())
                resetForm()
              }}
            >
              Today
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <div className="grid grid-cols-[1fr_110px_80px] gap-2 bg-muted/50 px-4 py-3 text-xs font-medium text-muted-foreground sm:grid-cols-[1fr_150px_90px]">
              <span>Name</span>
              <span className="text-right">Amount (ETB)</span>
              <span className="text-right">Actions</span>
            </div>

            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : expenses.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No expenses recorded for this date.
              </div>
            ) : (
              expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="grid grid-cols-[1fr_110px_80px] items-center gap-2 border-t px-4 py-3 text-sm sm:grid-cols-[1fr_150px_90px]"
                >
                  <span className="min-w-0 truncate">
                    {expense.description}
                  </span>

                  <span className="text-right font-medium tabular-nums">
                    {money(Number(expense.amount))}
                  </span>

                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(expense)}
                    >
                      Edit
                    </Button>

                    {!expense.wage_payment_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete expense"
                        onClick={() => removeExpense(expense.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3 rounded-lg bg-muted/40 p-4">
            <p className="text-sm font-medium">
              {editingId ? "Edit expense" : "New expense"}
            </p>

            <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
              <Input
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={200}
              />

              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Amount (ETB)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveExpense()
                }}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={saveExpense}
                disabled={saving || loading}
              >
                {saving ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 size-4" />
                )}
                {editingId ? "Save changes" : "Add expense"}
              </Button>

              {editingId && (
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-5">
            <span className="font-medium">
              Total for selected date
            </span>
            <span className="text-xl font-semibold tabular-nums">
              {money(total)} ETB
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

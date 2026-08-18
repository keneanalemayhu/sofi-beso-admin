// @/app/admin/expenses/expenses-client.tsx

"use client"
import { useCallback, useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { DataTable } from "@/components/table/data-table"
import { expensesColumns, ETB } from "@/components/table/columns/expense-column"
import { CalendarToggle } from "@/components/calendar-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  getExpenses,
  getExpenseCategories,
  createExpense,
  updateExpense,
  getExpenseSummary,
} from "@/lib/api"
import type {
  Expense,
  ExpenseCategory,
  ExpenseSummary,
  PaymentMethod,
} from "@/types"

const METHODS: PaymentMethod[] = ["cash", "transfer", "telebirr", "cbe", "other"]

/** Addis-local today as YYYY-MM-DD */
function addisToday() {
  return new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10)
}
function monthStart() {
  return addisToday().slice(0, 8) + "01"
}

const emptyForm = {
  description: "",
  amount: "",
  category_id: "",
  expense_date: addisToday(),
  payment_method: "cash" as PaymentMethod,
  note: "",
}

export default function ExpensesClient() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [summary, setSummary] = useState<ExpenseSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [from, setFrom] = useState(monthStart())
  const [to, setTo] = useState(addisToday())
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)
  const reload = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let active = true
    getExpenseCategories()
      .then((c) => {
        if (active) setCategories(c)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    Promise.all([
      getExpenses({
        from,
        to,
        category_id: categoryFilter === "all" ? undefined : categoryFilter,
      }),
      getExpenseSummary(from, to),
    ])
      .then(([ex, sum]) => {
        if (!active) return
        setExpenses(ex)
        setSummary(sum)
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : "Failed to fetch expenses")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [from, to, categoryFilter, refreshKey])

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm, expense_date: addisToday() })
    setOpen(true)
  }

  function openEdit(expense: Expense) {
    setEditing(expense)
    setForm({
      description: expense.description,
      amount: expense.amount,
      category_id: expense.category_id ?? "",
      expense_date: expense.expense_date,
      payment_method: expense.payment_method,
      note: expense.note ?? "",
    })
    setOpen(true)
  }

  async function handleSave() {
    const description = form.description.trim()
    const amount = Number(form.amount)

    if (!description) return toast.error("Description is required")
    if (!Number.isFinite(amount) || amount <= 0)
      return toast.error("Amount must be greater than 0")

    const payload = {
      description,
      amount,
      category_id: form.category_id || null,
      expense_date: form.expense_date,
      payment_method: form.payment_method,
      note: form.note.trim() || null,
    }

    try {
      setSaving(true)
      if (editing) {
        await updateExpense(editing.id, payload)
        toast.success("Expense updated")
      } else {
        await createExpense(payload)
        toast.success("Expense added")
      }
      setOpen(false)
      await reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save expense")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-6 text-sm text-muted-foreground">
        Loading expenses...
      </div>
    )
  }

  if (error) {
    return <div className="py-6 text-sm text-destructive">{error}</div>
  }

  const totals = summary?.totals

  return (
    <div className="space-y-4">
      {totals && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Revenue" value={totals.revenue} />
          <StatCard label="Expenses" value={totals.expenses} />
          <StatCard label="Savings" value={totals.savings} />
          <StatCard
            label="Available cash"
            value={totals.available_cash}
            emphasize
          />
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="from" className="text-xs">
            From
          </Label>
          <Input
            id="from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="to" className="text-xs">
            To
          </Label>
          <Input
            id="to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Category</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <CalendarToggle />
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add expense
          </Button>
        </div>
      </div>

      <DataTable
        columns={expensesColumns({ onChanged: reload, onEdit: openEdit })}
        data={expenses}
        filterColumn="description"
        filterPlaceholder="Search expenses..."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit expense" : "Add expense"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update this expense."
                : "Record something you bought for the restaurant."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="e.g. Onions from market"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (ETB)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave()
                  }}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.expense_date}
                  onChange={(e) =>
                    setForm({ ...form, expense_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category_id || "none"}
                  onValueChange={(v) =>
                    setForm({ ...form, category_id: v === "none" ? "" : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Uncategorized" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Uncategorized</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment method</Label>
                <Select
                  value={form.payment_method}
                  onValueChange={(v) =>
                    setForm({ ...form, payment_method: v as PaymentMethod })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METHODS.map((m) => (
                      <SelectItem key={m} value={m} className="capitalize">
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({
  label,
  value,
  emphasize,
}: {
  label: string
  value: string
  emphasize?: boolean
}) {
  const n = Number(value)
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div
          className={`mt-1 text-2xl font-semibold tabular-nums ${
            emphasize && n < 0 ? "text-destructive" : ""
          }`}
        >
          {ETB.format(n)}
        </div>
      </CardContent>
    </Card>
  )
}
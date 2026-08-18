// @/components/table/columns/expense-column.tsx

"use client"
import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Repeat, Wallet } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCalendarMode } from "@/contexts/calendar-context"
import { deleteExpense } from "@/lib/api"
import type { Expense } from "@/types"

export const ETB = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  minimumFractionDigits: 2,
})

function DateCell({ value }: { value: string }) {
  const { formatDate } = useCalendarMode()
  return <span className="whitespace-nowrap">{formatDate(value)}</span>
}

export function expensesColumns({
  onChanged,
  onEdit,
}: {
  onChanged: () => void
  onEdit: (expense: Expense) => void
}): ColumnDef<Expense>[] {
  return [
    {
      accessorKey: "expense_date",
      header: "Date",
      cell: ({ row }) => <DateCell value={row.original.expense_date} />,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span>{row.original.description}</span>
          {row.original.is_recurring && (
            <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          {row.original.is_wage && (
            <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "category_name",
      header: "Category",
      cell: ({ row }) =>
        row.original.category_name ? (
          <Badge variant="secondary">{row.original.category_name}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "payment_method",
      header: "Method",
      cell: ({ row }) => (
        <span className="capitalize text-muted-foreground">
          {row.original.payment_method}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">
          {ETB.format(Number(row.original.amount))}
        </span>
      ),
      sortingFn: (a, b) =>
        Number(a.original.amount) - Number(b.original.amount),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const expense = row.original
        const locked = expense.is_wage

        async function handleDelete() {
          if (!confirm(`Delete "${expense.description}"?`)) return
          try {
            await deleteExpense(expense.id)
            toast.success("Expense deleted")
            onChanged()
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Failed to delete expense"
            )
          }
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onEdit(expense)}
                disabled={locked}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={locked}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
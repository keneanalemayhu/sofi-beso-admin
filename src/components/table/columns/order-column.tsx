// @/components/table/columns/order-column.tsx

"use client"
import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { updateOrderStatus } from "@/lib/api"
import { useCalendar } from "@/hooks/useCalendar"
import type { OrderWithItems, OrderStatus } from "@/types"

function formatMoney(v: string) {
  const n = Number(v)
  return Number.isFinite(n) ? n.toFixed(2) : v
}

function StatusBadge({ status }: { status: OrderStatus }) {
  if (status === "completed") return <Badge variant="outline">Completed</Badge>
  if (status === "voided") return <Badge variant="destructive">Voided</Badge>
  return <Badge variant="secondary">Pending</Badge>
}

function CreatedAtCell({ value }: { value: string }) {
  const { toEthiopian } = useCalendar()
  return <span>{toEthiopian(new Date(value), { includeTime: true })}</span>
}

type OrderColumnsProps = {
  onChanged: () => void
}

function OrderActions({
  row,
  onChanged,
}: {
  row: OrderWithItems
  onChanged: () => void
}) {
  const { order } = row
  const [openComplete, setOpenComplete] = useState(false)
  const [openVoid, setOpenVoid] = useState(false)
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)

  const isPending = order.status === "pending"

  async function handleComplete() {
    try {
      setSaving(true)
      await updateOrderStatus(order.id, { status: "completed" })
      toast.success("Order completed")
      setOpenComplete(false)
      onChanged()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update order")
    } finally {
      setSaving(false)
    }
  }

  async function handleVoid() {
    try {
      setSaving(true)
      await updateOrderStatus(order.id, {
        status: "voided",
        voided_by: order.created_by, // see note in chat about voided_by
        void_reason: reason.trim() || undefined,
      })
      toast.success("Order voided")
      setOpenVoid(false)
      onChanged()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to void order")
    } finally {
      setSaving(false)
    }
  }

  if (!isPending) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpenComplete(true)}>
            Mark completed
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => {
              setReason("")
              setOpenVoid(true)
            }}
          >
            Void order
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={openComplete} onOpenChange={setOpenComplete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark order completed?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks order #{order.order_number} as completed. Completed
              orders cannot be changed afterward.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete} disabled={saving}>
              {saving ? "Saving..." : "Complete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={openVoid} onOpenChange={setOpenVoid}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Void order #{order.order_number}?</DialogTitle>
            <DialogDescription>
              Voided orders cannot be changed afterward. Add a reason if you
              want.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="void-reason">Reason (optional)</Label>
            <Input
              id="void-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. customer left"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenVoid(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVoid}
              disabled={saving}
              className="bg-red-500 hover:bg-red-600"
            >
              {saving ? "Voiding..." : "Void order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function ordersColumns({
  onChanged,
}: OrderColumnsProps): ColumnDef<OrderWithItems>[] {
  return [
    {
      id: "order_number",
      header: "Order #",
      cell: ({ row }) => (
        <span className="font-medium">#{row.original.order.order_number}</span>
      ),
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) => {
        const items = row.original.items
        const summary = items
          .map((i) => `${i.quantity}× ${i.name}`)
          .join(", ")
        return (
          <div className="max-w-100 truncate text-sm text-muted-foreground">
            {summary || "—"}
          </div>
        )
      },
    },
    {
      id: "waiter",
      header: "Waiter",
      cell: ({ row }) => row.original.order.waiter_name ?? "—",
    },
    {
      id: "total",
      header: "Total",
      cell: ({ row }) => `${formatMoney(row.original.order.total_amount)} ETB`,
    },
    {
      id: "created",
      header: "Created",
      cell: ({ row }) => (
        <CreatedAtCell value={row.original.order.created_at} />
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <OrderActions row={row.original} onChanged={onChanged} />
      ),
    },
  ]
}
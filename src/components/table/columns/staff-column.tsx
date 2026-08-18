// @/components/table/columns/staff-column.tsx

"use client"
import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { useCalendarMode } from "@/contexts/calendar-context"
import {
  updateStaff,
  toggleStaff,
  deleteStaff,
  updateWage,
  createWagePayment,
} from "@/lib/api"
import {
  STAFF_ROLES,
  type StaffMember,
  type StaffRole,
  type WageCycle,
  type WageCalendar,
} from "@/types"

const ETB = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  minimumFractionDigits: 2,
})

const WEEKDAYS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "7", label: "Sunday" },
]

function addisToday() {
  return new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function defaultPeriod(cycle: WageCycle): { start: string; end: string } {
  const now = new Date(Date.now() + 3 * 60 * 60 * 1000)
  const iso = (d: Date) => d.toISOString().slice(0, 10)

  if (cycle === "monthly") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0))
    return { start: iso(start), end: iso(end) }
  }
  if (cycle === "weekly") {
    const start = new Date(now)
    start.setUTCDate(start.getUTCDate() - 7)
    return { start: iso(start), end: iso(now) }
  }
  return { start: iso(now), end: iso(now) }
}

function NextPaydayCell({ staff }: { staff: StaffMember }) {
  const { mode } = useCalendarMode()
  if (!staff.next_payday) {
    return <span className="text-muted-foreground">—</span>
  }
  const value =
    mode === "ethiopian"
      ? staff.next_payday.ethiopian
      : new Date(
          `${staff.next_payday.gregorian}T00:00:00+03:00`
        ).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
  const overdue = staff.next_payday.gregorian <= addisToday()
  return (
    <span
      className={`whitespace-nowrap ${overdue ? "font-medium text-destructive" : ""}`}
    >
      {value}
    </span>
  )
}

function StaffActions({
  staff,
  onChanged,
}: {
  staff: StaffMember
  onChanged: () => void
}) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openPay, setOpenPay] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [busy, setBusy] = useState(false)

  const [form, setForm] = useState({
    name: staff.name,
    role: staff.role,
    wage_amount: staff.wage_amount,
    wage_cycle: staff.wage_cycle,
    wage_day: staff.wage_day?.toString() ?? "",
    wage_calendar: staff.wage_calendar,
    hired_on: staff.hired_on ?? "",
  })

  const [payForm, setPayForm] = useState(() => {
    const p = defaultPeriod(staff.wage_cycle)
    return {
      amount: staff.wage_amount,
      period_start: p.start,
      period_end: p.end,
      paid_on: addisToday(),
      note: "",
    }
  })

  function openEditDialog() {
    setForm({
      name: staff.name,
      role: staff.role,
      wage_amount: staff.wage_amount,
      wage_cycle: staff.wage_cycle,
      wage_day: staff.wage_day?.toString() ?? "",
      wage_calendar: staff.wage_calendar,
      hired_on: staff.hired_on ?? "",
    })
    setOpenEdit(true)
  }

  /** Saves identity and wage config together. */
  async function handleSave() {
    const name = form.name.trim()
    const amount = Number(form.wage_amount)

    if (!name) return toast.error("Name is required")
    if (!Number.isFinite(amount) || amount < 0) {
      return toast.error("Wage must be 0 or more")
    }
    if (amount > 0 && form.wage_cycle !== "daily" && !form.wage_day) {
      return toast.error("Pick a payday for this cycle")
    }

    try {
      setBusy(true)

      const identityChanged =
        name !== staff.name || form.role !== staff.role
      if (identityChanged) {
        await updateStaff(staff.id, { name, role: form.role })
      }

      await updateWage(staff.id, {
        wage_amount: amount,
        wage_cycle: form.wage_cycle,
        wage_day: form.wage_cycle === "daily" ? null : Number(form.wage_day),
        wage_calendar: form.wage_calendar,
        hired_on: form.hired_on || null,
      })

      toast.success("Staff updated")
      setOpenEdit(false)
      onChanged()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setBusy(false)
    }
  }

  async function handlePay() {
    const amount = Number(payForm.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      return toast.error("Amount must be greater than 0")
    }
    if (payForm.period_end < payForm.period_start) {
      return toast.error("Period end must be after start")
    }
    try {
      setBusy(true)
      await createWagePayment({
        waiter_id: staff.id,
        amount,
        period_start: payForm.period_start,
        period_end: payForm.period_end,
        paid_on: payForm.paid_on,
        note: payForm.note.trim() || null,
      })
      toast.success(`Paid ${ETB.format(amount)} to ${staff.name}`)
      setOpenPay(false)
      onChanged()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to record payment"
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleToggle() {
    try {
      setBusy(true)
      await toggleStaff(staff.id)
      toast.success(staff.is_active ? "Deactivated" : "Activated")
      onChanged()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle")
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    try {
      setBusy(true)
      await deleteStaff(staff.id)
      toast.success("Staff deleted")
      setOpenDelete(false)
      onChanged()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete")
    } finally {
      setBusy(false)
    }
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
          <DropdownMenuItem onClick={openEditDialog}>Edit</DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              const p = defaultPeriod(staff.wage_cycle)
              setPayForm({
                amount: staff.wage_amount,
                period_start: p.start,
                period_end: p.end,
                paid_on: addisToday(),
                note: "",
              })
              setOpenPay(true)
            }}
            disabled={Number(staff.wage_amount) <= 0}
          >
            Record payment
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleToggle} disabled={busy}>
            {staff.is_active ? "Deactivate" : "Activate"}
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setOpenDelete(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit — name, role and wage in one place */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit staff</DialogTitle>
            <DialogDescription>
              Update details and pay settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="staff-name">Name</Label>
                <Input
                  id="staff-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) =>
                    setForm({ ...form, role: v as StaffRole })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAFF_ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.role !== "waiter" && staff.role === "waiter" && (
              <p className="text-xs text-muted-foreground">
                Changing away from Waiter removes this person from the order
                screen. Past orders keep their name.
              </p>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="wage-amount">Wage (ETB)</Label>
                <Input
                  id="wage-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.wage_amount}
                  onChange={(e) =>
                    setForm({ ...form, wage_amount: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Cycle</Label>
                <Select
                  value={form.wage_cycle}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      wage_cycle: v as WageCycle,
                      wage_day: "",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.wage_cycle === "weekly" && (
              <div className="space-y-2">
                <Label>Payday</Label>
                <Select
                  value={form.wage_day}
                  onValueChange={(v) => setForm({ ...form, wage_day: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEKDAYS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {form.wage_cycle === "monthly" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="wage-day">Day of month</Label>
                  <Input
                    id="wage-day"
                    type="number"
                    min="1"
                    max={form.wage_calendar === "ethiopian" ? 30 : 31}
                    value={form.wage_day}
                    onChange={(e) =>
                      setForm({ ...form, wage_day: e.target.value })
                    }
                    placeholder={
                      form.wage_calendar === "ethiopian" ? "1-30" : "1-31"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Calendar</Label>
                  <Select
                    value={form.wage_calendar}
                    onValueChange={(v) =>
                      setForm({ ...form, wage_calendar: v as WageCalendar })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gregorian">Gregorian</SelectItem>
                      <SelectItem value="ethiopian">Ethiopian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="hired-on">Hired on (optional)</Label>
              <Input
                id="hired-on"
                type="date"
                value={form.hired_on}
                onChange={(e) => setForm({ ...form, hired_on: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenEdit(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={busy}>
              {busy ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record payment */}
      <Dialog open={openPay} onOpenChange={setOpenPay}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record payment — {staff.name}</DialogTitle>
            <DialogDescription>
              This also creates a matching expense under Wages.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="pay-amount">Amount (ETB)</Label>
                <Input
                  id="pay-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={payForm.amount}
                  onChange={(e) =>
                    setPayForm({ ...payForm, amount: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paid-on">Paid on</Label>
                <Input
                  id="paid-on"
                  type="date"
                  value={payForm.paid_on}
                  onChange={(e) =>
                    setPayForm({ ...payForm, paid_on: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="period-start">Period start</Label>
                <Input
                  id="period-start"
                  type="date"
                  value={payForm.period_start}
                  onChange={(e) =>
                    setPayForm({ ...payForm, period_start: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period-end">Period end</Label>
                <Input
                  id="period-end"
                  type="date"
                  value={payForm.period_end}
                  onChange={(e) =>
                    setPayForm({ ...payForm, period_end: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pay-note">Note (optional)</Label>
              <Input
                id="pay-note"
                value={payForm.note}
                onChange={(e) =>
                  setPayForm({ ...payForm, note: e.target.value })
                }
                placeholder="e.g. includes overtime"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenPay(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button onClick={handlePay} disabled={busy}>
              {busy ? "Recording..." : "Record payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete staff?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes &quot;{staff.name}&quot; and their wage
              history. If they have past orders, deletion is blocked —
              deactivate instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={busy}
              className="bg-red-500 hover:bg-red-600"
            >
              {busy ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function staffColumns({
  onChanged,
}: {
  onChanged: () => void
}): ColumnDef<StaffMember>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant={row.original.role === "waiter" ? "default" : "secondary"}>
          {STAFF_ROLES.find((r) => r.value === row.original.role)?.label ??
            row.original.role}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge variant="outline">Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
    {
      accessorKey: "wage_amount",
      header: "Wage",
      cell: ({ row }) => {
        const amount = Number(row.original.wage_amount)
        if (amount <= 0) {
          return <span className="text-muted-foreground">Not set</span>
        }
        return (
          <div className="whitespace-nowrap">
            <span className="font-medium tabular-nums">
              {ETB.format(amount)}
            </span>
            <span className="ml-1 text-xs text-muted-foreground">
              / {row.original.wage_cycle.replace("ly", "")}
            </span>
          </div>
        )
      },
      sortingFn: (a, b) =>
        Number(a.original.wage_amount) - Number(b.original.wage_amount),
    },
    {
      id: "next_payday",
      header: "Next payday",
      cell: ({ row }) => <NextPaydayCell staff={row.original} />,
    },
    {
      id: "last_paid",
      header: "Last paid",
      cell: ({ row }) =>
        row.original.last_paid_on ? (
          <span className="whitespace-nowrap text-muted-foreground">
            {new Date(
              `${row.original.last_paid_on}T00:00:00+03:00`
            ).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
            {row.original.last_paid_amount &&
              ` · ${ETB.format(Number(row.original.last_paid_amount))}`}
          </span>
        ) : (
          <span className="text-muted-foreground">Never</span>
        ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <StaffActions staff={row.original} onChanged={onChanged} />
      ),
    },
  ]
}
// @/app/admin/staff/staff-client.tsx

"use client"
import { useCallback, useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { DataTable } from "@/components/table/data-table"
import { staffColumns } from "@/components/table/columns/staff-column"
import { CalendarToggle } from "@/components/calendar-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getStaff, createStaff } from "@/lib/api"
import { STAFF_ROLES, type StaffMember, type StaffRole } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function addisToday() {
  return new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export default function StuffTableClient() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  const [openCreate, setOpenCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newRole, setNewRole] = useState<StaffRole>("waiter")
  const [creating, setCreating] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)
  const reload = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let active = true
    getStaff()
      .then((data) => {
        if (!active) return
        setStaff(data)
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : "Failed to fetch staff")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [refreshKey])

  async function handleCreate() {
    const trimmed = newName.trim()
    if (!trimmed) return toast.error("Name is required")
    try {
      setCreating(true)
      await createStaff({ name: trimmed, role: newRole })
      toast.success("Staff added")
      setNewName("")
      setOpenCreate(false)
      reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add staff")
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="py-6 text-sm text-muted-foreground">Loading staff...</div>
    )
  }

  if (error) {
    return <div className="py-6 text-sm text-destructive">{error}</div>
  }

  const visible = showInactive ? staff : staff.filter((s) => s.is_active)
  const today = addisToday()
  const dueCount = staff.filter(
    (s) =>
      s.is_active &&
      Number(s.wage_amount) > 0 &&
      s.next_payday &&
      s.next_payday.gregorian <= today
  ).length
  const unset = staff.filter(
    (s) => s.is_active && Number(s.wage_amount) <= 0
  ).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Active staff:{" "}
          <span className="font-medium text-foreground">
            {staff.filter((s) => s.is_active).length}
          </span>
        </div>

        {dueCount > 0 && (
          <div className="text-sm text-destructive">
            {dueCount} due for payment
          </div>
        )}

        {unset > 0 && (
          <div className="text-sm text-muted-foreground">
            {unset} without a wage set
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive" className="text-sm font-normal">
              Show inactive
            </Label>
          </div>

          <CalendarToggle />

          <Button
            onClick={() => {
              setNewName("")
              setOpenCreate(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add staff
          </Button>
        </div>
      </div>

      <DataTable
        columns={staffColumns({ onChanged: reload })}
        data={visible}
        filterColumn="name"
        filterPlaceholder="Search staff..."
      />

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add staff</DialogTitle>
            <DialogDescription>
              Add a new person. Set their wage afterwards from the row menu.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-staff-name">Name</Label>
              <Input
                id="new-staff-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Staff name"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newRole}
                onValueChange={(v) => setNewRole(v as StaffRole)}
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

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenCreate(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
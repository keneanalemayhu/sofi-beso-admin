// @/components/table/columns/waiter-column.tsx

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
import { updateWaiter, toggleWaiter, deleteWaiter } from "@/lib/api"
import type { Waiter } from "@/types"

type WaiterColumnsProps = {
  onChanged: () => void
}

function WaiterActions({
  waiter,
  onChanged,
}: {
  waiter: Waiter
  onChanged: () => void
}) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [name, setName] = useState(waiter.name)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)

  async function handleEdit() {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error("Waiter name is required")
      return
    }
    try {
      setSaving(true)
      await updateWaiter(waiter.id, { name: trimmed })
      toast.success("Waiter updated")
      setOpenEdit(false)
      onChanged()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update waiter")
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle() {
    try {
      setToggling(true)
      await toggleWaiter(waiter.id)
      toast.success(waiter.is_active ? "Waiter deactivated" : "Waiter activated")
      onChanged()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle waiter")
    } finally {
      setToggling(false)
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true)
      await deleteWaiter(waiter.id)
      toast.success("Waiter deleted")
      setOpenDelete(false)
      onChanged()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete waiter")
    } finally {
      setDeleting(false)
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
          <DropdownMenuItem
            onClick={() => {
              setName(waiter.name)
              setOpenEdit(true)
            }}
          >
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleToggle} disabled={toggling}>
            {waiter.is_active ? "Deactivate" : "Activate"}
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setOpenDelete(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit waiter</DialogTitle>
            <DialogDescription>Rename this waiter.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="edit-waiter-name">Name</Label>
            <Input
              id="edit-waiter-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEdit()
              }}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenEdit(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete waiter?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{waiter.name}&quot;. If they
              have past orders, deletion is blocked — deactivate instead.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function waitersColumns({
  onChanged,
}: WaiterColumnsProps): ColumnDef<Waiter>[] {
  return [
    {
      accessorKey: "name",
      header: "Waiter",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
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
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <WaiterActions waiter={row.original} onChanged={onChanged} />
      ),
    },
  ]
}
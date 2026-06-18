// @/components/table/columns/item-column.tsx

"use client"
import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { toggleMenuItem, deleteMenuItem } from "@/lib/api"
import type { Category, MenuItem } from "@/types"
import { ItemFormDialog } from "@/app/admin/items/item-form-dialog"

function formatPrice(price: string) {
  const n = Number(price)
  return Number.isFinite(n) ? n.toFixed(2) : price
}

type ItemColumnsProps = {
  categories: Category[]
  onChanged: () => void
}

function ItemActions({
  item,
  categories,
  onChanged,
}: {
  item: MenuItem
  categories: Category[]
  onChanged: () => void
}) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)

  async function handleToggle() {
    try {
      setToggling(true)
      await toggleMenuItem(item.id)
      toast.success(item.is_active ? "Item deactivated" : "Item activated")
      onChanged()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle item")
    } finally {
      setToggling(false)
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true)
      await deleteMenuItem(item.id)
      toast.success("Item deleted")
      setOpenDelete(false)
      onChanged()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete item")
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
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleToggle} disabled={toggling}>
            {item.is_active ? "Deactivate" : "Activate"}
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setOpenDelete(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ItemFormDialog
        mode="edit"
        item={item}
        categories={categories}
        open={openEdit}
        onOpenChange={setOpenEdit}
        onSaved={onChanged}
      />

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{item.name}&quot;. If it
              appears in past orders, deletion is blocked — deactivate it
              instead.
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

export function itemsColumns({
  categories,
  onChanged,
}: ItemColumnsProps): ColumnDef<MenuItem>[] {
  return [
    {
      accessorKey: "name",
      header: "Item",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "category_name",
      header: "Category",
      cell: ({ row }) => row.original.category_name,
    },
    {
      id: "price",
      header: "Price",
      cell: ({ row }) => `${formatPrice(row.original.price)} ETB`,
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
        <ItemActions
          item={row.original}
          categories={categories}
          onChanged={onChanged}
        />
      ),
    },
  ]
}
// @/components/table/columns/category-column.tsx

"use client"
import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
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
import { updateCategory, deleteCategory } from "@/lib/api"
import type { Category } from "@/types"

function CreatedAtCell({ value }: { value: string }) {
  return <span>{new Date(value).toLocaleDateString()}</span>
}

type CategoryColumnsProps = {
  onChanged: () => void
}

function CategoryActions({
  category,
  onChanged,
}: {
  category: Category
  onChanged: () => void
}) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [name, setName] = useState(category.name)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const hasItems = category.item_count > 0

  async function handleEdit() {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error("Category name is required")
      return
    }
    try {
      setSaving(true)
      await updateCategory(category.id, { name: trimmed })
      toast.success("Category updated")
      setOpenEdit(false)
      onChanged()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update category"
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true)
      await deleteCategory(category.id)
      toast.success("Category deleted")
      setOpenDelete(false)
      onChanged()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete category"
      )
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
              setName(category.name)
              setOpenEdit(true)
            }}
          >
            Edit
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
            <DialogTitle>Edit category</DialogTitle>
            <DialogDescription>Rename this category.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="edit-category-name">Name</Label>
            <Input
              id="edit-category-name"
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
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              {hasItems
                ? `This category has ${category.item_count} item(s). Move or delete those items before deleting the category.`
                : `This will permanently delete "${category.name}". This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting || hasItems}
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

export function categoriesColumns({
  onChanged,
}: CategoryColumnsProps): ColumnDef<Category>[] {
  return [
    {
      accessorKey: "name",
      header: "Category",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      id: "item_count",
      header: "Items",
      cell: ({ row }) => row.original.item_count,
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => <CreatedAtCell value={row.original.created_at} />,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <CategoryActions category={row.original} onChanged={onChanged} />
      ),
    },
  ]
}
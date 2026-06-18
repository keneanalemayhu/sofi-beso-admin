// @/app/admin/categories/categories-table-client.tsx

"use client"
import { useEffect, useState, useCallback } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { DataTable } from "@/components/table/data-table"
import { categoriesColumns } from "@/components/table/columns/category-column"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getCategories, createCategory } from "@/lib/api"
import type { Category } from "@/types"

export default function CategoriesTableClient() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [openCreate, setOpenCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)

  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories()
      setCategories(data)
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch categories"
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    getCategories()
      .then((data) => {
        if (active) {
          setCategories(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error ? err.message : "Failed to fetch categories"
          )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function handleCreate() {
    const trimmed = newName.trim()
    if (!trimmed) {
      toast.error("Category name is required")
      return
    }
    try {
      setCreating(true)
      await createCategory({ name: trimmed })
      toast.success("Category created")
      setNewName("")
      setOpenCreate(false)
      await loadCategories()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create category"
      )
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="py-6 text-sm text-muted-foreground">
        Loading categories...
      </div>
    )
  }

  if (error) {
    return <div className="py-6 text-sm text-destructive">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Total categories:{" "}
          <span className="font-medium text-foreground">
            {categories.length}
          </span>
        </div>

        <Button
          onClick={() => {
            setNewName("")
            setOpenCreate(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add category
        </Button>
      </div>

      <DataTable
        columns={categoriesColumns({ onChanged: loadCategories })}
        data={categories}
        filterColumn="name"
        filterPlaceholder="Search categories..."
      />

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add category</DialogTitle>
            <DialogDescription>Create a new menu category.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="new-category-name">Name</Label>
            <Input
              id="new-category-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate()
              }}
              placeholder="e.g. መጠጦች"
            />
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
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
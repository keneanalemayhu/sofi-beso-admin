// @/app/admin/items/items-table-client.tsx

"use client"
import { useEffect, useState, useCallback } from "react"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/table/data-table"
import { itemsColumns } from "@/components/table/columns/item-column"
import { Button } from "@/components/ui/button"
import { getMenuItems, getCategories } from "@/lib/api"
import type { MenuItem, Category } from "@/types"
import { ItemFormDialog } from "./item-form-dialog"
import { ExportCsvDialog } from "@/components/export-csv-dialog"
import type { CsvColumn } from "@/lib/csv"

const ITEM_CSV_COLUMNS: CsvColumn<MenuItem>[] = [
  { key: "name", label: "Item", value: (i) => i.name },
  { key: "category", label: "Category", value: (i) => i.category_name },
  { key: "price", label: "Price (ETB)", value: (i) => Number(i.price).toFixed(2) },
  { key: "status", label: "Status", value: (i) => (i.is_active ? "Active" : "Inactive") },
  {
    key: "created_at",
    label: "Created",
    value: (i) => (i.created_at ? i.created_at.slice(0, 10) : ""),
  },
  { key: "id", label: "ID", value: (i) => i.id },
]

export default function ItemsTableClient() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openCreate, setOpenCreate] = useState(false)

  const reload = useCallback(async () => {
    try {
      const [itemsData, categoriesData] = await Promise.all([
        getMenuItems(),
        getCategories(),
      ])
      setItems(itemsData)
      setCategories(categoriesData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch items")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    Promise.all([getMenuItems(), getCategories()])
      .then(([itemsData, categoriesData]) => {
        if (active) {
          setItems(itemsData)
          setCategories(categoriesData)
          setError(null)
        }
      })
      .catch((err) => {
        if (active)
          setError(err instanceof Error ? err.message : "Failed to fetch items")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="py-6 text-sm text-muted-foreground">Loading items...</div>
    )
  }

  if (error) {
    return <div className="py-6 text-sm text-destructive">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Total items:{" "}
          <span className="font-medium text-foreground">{items.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <ExportCsvDialog
            rows={items}
            columns={ITEM_CSV_COLUMNS}
            filenameBase="menu-items"
            defaultKeys={["name", "category", "price", "status"]}
          />

          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add item
          </Button>
        </div>
      </div>

      <DataTable
        columns={itemsColumns({ categories, onChanged: reload })}
        data={items}
        filterColumn="name"
        filterPlaceholder="Search items..."
      />

      <ItemFormDialog
        mode="create"
        categories={categories}
        open={openCreate}
        onOpenChange={setOpenCreate}
        onSaved={reload}
      />
    </div>
  )
}
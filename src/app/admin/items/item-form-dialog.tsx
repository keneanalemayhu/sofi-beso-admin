// @/app/admin/items/item-form-dialog.tsx

"use client"
import { useState } from "react"
import { toast } from "sonner"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createMenuItem, updateMenuItem } from "@/lib/api"
import type { Category, MenuItem } from "@/types"

type ItemFormDialogProps = {
  mode: "create" | "edit"
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  item?: MenuItem
}

export function ItemFormDialog({
  mode,
  categories,
  open,
  onOpenChange,
  onSaved,
  item,
}: ItemFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open ? (
          <ItemForm
            mode={mode}
            categories={categories}
            onOpenChange={onOpenChange}
            onSaved={onSaved}
            item={item}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function ItemForm({
  mode,
  categories,
  onOpenChange,
  onSaved,
  item,
}: Omit<ItemFormDialogProps, "open">) {
  const [name, setName] = useState(item?.name ?? "")
  const [price, setPrice] = useState(item ? String(Number(item.price)) : "")
  const [categoryId, setCategoryId] = useState(item?.category_id ?? "")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const trimmedName = name.trim()
    const priceNum = Number(price)

    if (!trimmedName) {
      toast.error("Item name is required")
      return
    }
    if (!categoryId) {
      toast.error("Please select a category")
      return
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      toast.error("Enter a valid price")
      return
    }

    try {
      setSaving(true)
      if (mode === "create") {
        await createMenuItem({
          category_id: categoryId,
          name: trimmedName,
          price: priceNum,
        })
        toast.success("Item created")
      } else if (item) {
        await updateMenuItem(item.id, {
          category_id: categoryId,
          name: trimmedName,
          price: priceNum,
        })
        toast.success("Item updated")
      }
      onOpenChange(false)
      onSaved()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save item")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {mode === "create" ? "Add item" : "Edit item"}
        </DialogTitle>
        <DialogDescription>
          {mode === "create"
            ? "Create a new menu item."
            : "Update this menu item."}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="item-name">Name</Label>
          <Input
            id="item-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. ስፔሻል በሶ"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="item-price">Price (ETB)</Label>
          <Input
            id="item-price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : mode === "create" ? "Create" : "Save"}
        </Button>
      </DialogFooter>
    </>
  )
}
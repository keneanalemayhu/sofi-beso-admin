// @/app/admin/waiters/waiters-table-client.tsx

"use client"
import { useEffect, useState, useCallback } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { DataTable } from "@/components/table/data-table"
import { waitersColumns } from "@/components/table/columns/waiter-column"
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
import { getWaiters, createWaiter } from "@/lib/api"
import type { Waiter } from "@/types"

export default function WaitersTableClient() {
  const [waiters, setWaiters] = useState<Waiter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [openCreate, setOpenCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)

  const reload = useCallback(async () => {
    try {
      const data = await getWaiters()
      setWaiters(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch waiters")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    getWaiters()
      .then((data) => {
        if (active) {
          setWaiters(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error ? err.message : "Failed to fetch waiters"
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
      toast.error("Waiter name is required")
      return
    }
    try {
      setCreating(true)
      await createWaiter({ name: trimmed })
      toast.success("Waiter created")
      setNewName("")
      setOpenCreate(false)
      await reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create waiter")
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="py-6 text-sm text-muted-foreground">
        Loading waiters...
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
          Total waiters:{" "}
          <span className="font-medium text-foreground">{waiters.length}</span>
        </div>

        <Button
          onClick={() => {
            setNewName("")
            setOpenCreate(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add waiter
        </Button>
      </div>

      <DataTable
        columns={waitersColumns({ onChanged: reload })}
        data={waiters}
        filterColumn="name"
        filterPlaceholder="Search waiters..."
      />

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add waiter</DialogTitle>
            <DialogDescription>Create a new waiter.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="new-waiter-name">Name</Label>
            <Input
              id="new-waiter-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate()
              }}
              placeholder="Waiter name"
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
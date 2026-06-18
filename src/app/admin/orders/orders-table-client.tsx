// @/app/admin/orders/orders-table-client.tsx

"use client"
import { useEffect, useState, useCallback } from "react"
import { DataTable } from "@/components/table/data-table"
import { ordersColumns } from "@/components/table/columns/order-column"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getOrdersByRange } from "@/lib/api"
import type { OrderWithItems } from "@/types"

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function OrdersTableClient() {
  const [date, setDate] = useState(todayStr())
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (day: string) => {
    setLoading(true)
    try {
      const data = await getOrdersByRange(day, day)
      setOrders(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-load today on mount
  useEffect(() => {
    let active = true
    const day = todayStr()
    getOrdersByRange(day, day)
      .then((data) => {
        if (active) {
          setOrders(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (active)
          setError(err instanceof Error ? err.message : "Failed to fetch orders")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const itemsOrdered = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            max={todayStr()}
            onChange={(e) => setDate(e.target.value)}
            className="w-44"
          />
        </div>
        <Button onClick={() => load(date)} disabled={loading}>
          {loading ? "Loading..." : "View orders"}
        </Button>
      </div>

      {error ? (
        <div className="py-6 text-sm text-destructive">{error}</div>
      ) : null}

      {loading ? (
        <div className="py-6 text-sm text-muted-foreground">
          Loading orders...
        </div>
      ) : !error ? (
        <>
          <div className="text-sm text-muted-foreground">
            Total:{" "}
            <span className="font-medium text-foreground">{orders.length}</span>
            {" · "}Items ordered:{" "}
            <span className="font-medium text-foreground">{itemsOrdered}</span>
          </div>

          <DataTable
            columns={ordersColumns({ onChanged: () => load(date) })}
            data={orders}
          />
        </>
      ) : null}
    </div>
  )
}
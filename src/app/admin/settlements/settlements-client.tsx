// @/app/admin/settlements/settlements-client.tsx

"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarToggle } from "@/components/calendar-toggle"
import { useCalendarMode } from "@/contexts/calendar-context"
import {
  getDailySettlements,
  saveDailySettlement,
} from "@/lib/api/settlements"
import type {
  BranchSlug,
  DailySettlementsResponse,
  WaiterSettlement,
} from "@/types/settlement"

interface Draft {
  bank: string
  cash: string
}

function addisToday() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Addis_Ababa",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())

  const part = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? ""

  return `${part("year")}-${part("month")}-${part("day")}`
}

function shiftDate(date: string, offset: number) {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + offset)
  return value.toISOString().slice(0, 10)
}

const money = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

function validAmount(value: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return false
  const amount = Number(value)
  return Number.isFinite(amount) &&
    amount >= 0 &&
    amount <= 9999999999.99
}

export default function SettlementsClient() {
  const [branch, setBranch] = useState<BranchSlug>("main")
  const [date, setDate] = useState(addisToday)
  const [data, setData] =
    useState<DailySettlementsResponse | null>(null)
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [refresh, setRefresh] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const { formatDate } = useCalendarMode()

  const reload = useCallback(() => {
    setRefresh((n) => n + 1)
  }, [])

  useEffect(() => {
    let active = true

    getDailySettlements(branch, date)
      .then((result) => {
        if (!active) return

        setData(result)
        setDrafts(
          Object.fromEntries(
            result.waiters.map((w) => [
              w.waiter_id,
              {
                bank: w.bank_amount === null
                  ? ""
                  : String(w.bank_amount),
                cash: w.cash_amount === null
                  ? ""
                  : String(w.cash_amount),
              },
            ])
          )
        )
        setError(null)
      })
      .catch((err) => {
        if (active) {
          setData(null)
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load settlements"
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [branch, date, refresh])

  function changeDraft(
    waiterId: string,
    field: keyof Draft,
    value: string
  ) {
    setDrafts((prev) => ({
      ...prev,
      [waiterId]: {
        ...prev[waiterId],
        [field]: value,
      },
    }))
  }

  function isDirty(waiter: WaiterSettlement) {
    const draft = drafts[waiter.waiter_id]
    if (!draft) return false

    if (!waiter.is_recorded) {
      return draft.bank !== "" || draft.cash !== ""
    }

    return (
      Number(draft.bank) !== Number(waiter.bank_amount) ||
      Number(draft.cash) !== Number(waiter.cash_amount)
    )
  }

  async function save(waiter: WaiterSettlement) {
    const draft = drafts[waiter.waiter_id]
    if (!draft) return

    // Blank is allowed for an individual field and means zero,
    // but never silently save two blank fields.
    if (!draft.bank.trim() && !draft.cash.trim()) {
      toast.error("Enter a bank or cash amount first")
      return
    }

    const bank = draft.bank.trim() || "0"
    const cash = draft.cash.trim() || "0"

    if (!validAmount(bank) || !validAmount(cash)) {
      toast.error("Enter valid ETB amounts (up to 2 decimals)")
      return
    }

    try {
      setSavingId(waiter.waiter_id)

      await saveDailySettlement(branch, {
        waiter_id: waiter.waiter_id,
        business_date: date,
        bank_amount: Number(bank),
        cash_amount: Number(cash),
      })

      toast.success(`${waiter.waiter_name}: settlement saved`)
      reload()
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to save settlement"
      )
    } finally {
      setSavingId(null)
    }
  }

  const waiters = data?.waiters ?? []
  const totals = data?.totals

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Settlement date</h2>
              <p className="text-sm text-muted-foreground">
                {formatDate(date)}
              </p>
            </div>
            <CalendarToggle />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex gap-2">
              {(["main", "imperial"] as const).map((slug) => (
                <Button
                  key={slug}
                  variant={branch === slug ? "default" : "outline"}
                  onClick={() => {
                    setLoading(true)
                    setData(null)
                    setBranch(slug)
                  }}
                >
                  {slug === "main" ? "Main" : "Imperial"}
                </Button>
              ))}
            </div>

            <div className="flex flex-1 items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous day"
                onClick={() => {
                  setLoading(true)
                  setData(null)
                  setDate((d) => shiftDate(d, -1))
                }}
              >
                <ChevronLeft className="size-4" />
              </Button>

              <Input
                type="date"
                aria-label="Settlement date"
                value={date}
                className="min-w-36 flex-1"
                onChange={(e) => {
                  if (!e.target.value) return
                  setLoading(true)
                  setData(null)
                  setDate(e.target.value)
                }}
              />

              <Button
                variant="outline"
                size="icon"
                aria-label="Next day"
                onClick={() => {
                  setLoading(true)
                  setData(null)
                  setDate((d) => shiftDate(d, 1))
                }}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard
              label="POS sales"
              value={totals?.sales ?? 0}
            />
            <SummaryCard
              label="Bank received"
              value={totals?.bank ?? 0}
            />
            <SummaryCard
              label="Cash received"
              value={totals?.cash ?? 0}
            />
          </div>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">Waiter settlements</h2>
                <span className="text-xs text-muted-foreground">
                  {totals?.recorded_waiters ?? 0} of {waiters.length} recorded
                </span>
              </div>

              <div className="space-y-3">
                {waiters.map((waiter) => {
                  const draft = drafts[waiter.waiter_id] ?? {
                    bank: "",
                    cash: "",
                  }

                  const dirty = isDirty(waiter)
                  const bank = Number(draft.bank || 0)
                  const cash = Number(draft.cash || 0)

                  return (
                    <div
                      key={waiter.waiter_id}
                      className="rounded-lg border p-4"
                    >
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">
                            {waiter.waiter_name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {waiter.order_count} orders
                            {!waiter.is_active && " · Inactive"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            POS sales
                          </p>
                          <p className="font-semibold tabular-nums">
                            {money(waiter.sales)} ETB
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="space-y-1 text-sm">
                          <span>Bank transfer (ETB)</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Not entered"
                            value={draft.bank}
                            disabled={savingId !== null}
                            onChange={(e) =>
                              changeDraft(
                                waiter.waiter_id,
                                "bank",
                                e.target.value
                              )
                            }
                          />
                        </label>

                        <label className="space-y-1 text-sm">
                          <span>Cash turned in (ETB)</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Not entered"
                            value={draft.cash}
                            disabled={savingId !== null}
                            onChange={(e) =>
                              changeDraft(
                                waiter.waiter_id,
                                "cash",
                                e.target.value
                              )
                            }
                          />
                        </label>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Turned in:{" "}
                          </span>
                          <strong>
                            {waiter.is_recorded || draft.bank || draft.cash
                              ? `${money(bank + cash)} ETB`
                              : "Not recorded"}
                          </strong>
                        </div>

                        <Button
                          size="sm"
                          disabled={!dirty || savingId !== null}
                          onClick={() => save(waiter)}
                        >
                          {savingId === waiter.waiter_id ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 size-4" />
                          )}
                          Save
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {waiters.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No waiters or sales for this date.
                </p>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            Bank and cash are entered manually. POS sales are calculated
            from non-voided orders. Outstanding credit remains in Excel.
          </p>
        </>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-2 text-xl font-semibold tabular-nums">
          {money(value)} ETB
        </p>
      </CardContent>
    </Card>
  )
}

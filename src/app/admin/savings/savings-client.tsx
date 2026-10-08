// @/app/admin/savings/savings-client.tsx

"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarToggle } from "@/components/calendar-toggle";
import { useCalendarMode } from "@/contexts/calendar-context";

import {
  createSavingsPlan,
  getSavingsPlan,
  getSavingsPlans,
  recordSaving,
  removeSaving,
  type SavingsPlan,
  type SavingsPlanDetail,
  type SavingsPeriod,
} from "@/lib/api/savings";

function addisToday() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Addis_Ababa",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const part = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function dateOnly(value: string) {
  return String(value).slice(0, 10);
}

function shiftDate(date: string, offset: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function validAmount(value: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return false;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 && amount <= 9999999999.99;
}

export default function SavingsClient() {
  const [plans, setPlans] = useState<SavingsPlan[]>([]);
  const [planId, setPlanId] = useState("");
  const [detail, setDetail] = useState<SavingsPlanDetail | null>(null);
  const [date, setDate] = useState(addisToday);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const dateRef = useRef(date);

  const { formatDate } = useCalendarMode();

  const reload = useCallback(() => {
    setRefreshKey((n) => n + 1);
  }, []);

  useEffect(() => {
    let active = true;

    getSavingsPlans()
      .then((items) => {
        if (!active) return;

        const dailyPlans = items.filter((item) => item.period_type === "daily");

        setPlans(dailyPlans);

        setPlanId((current) => {
          if (current && dailyPlans.some((p) => p.plan_id === current)) {
            return current;
          }

          const today = addisToday();

          const currentPlan = dailyPlans.find((p) => {
            const start = dateOnly(p.start_date);
            const end = shiftDate(start, p.period_count - 1);
            return start <= today && today <= end;
          });

          return currentPlan?.plan_id ?? dailyPlans[0]?.plan_id ?? "";
        });
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load plans");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    if (!planId) return;

    let active = true;

    getSavingsPlan(planId)
      .then((result) => {
        if (!active) return;

        setDetail(result);
        setError(null);

        const today = addisToday();
        const start = dateOnly(result.start_date);
        const end = shiftDate(start, result.period_count - 1);
        const currentDate = dateRef.current;

        const selectedDate =
          currentDate >= start && currentDate <= end
            ? currentDate
            : today >= start && today <= end
              ? today
              : end;

        dateRef.current = selectedDate;
        setDate(selectedDate);

        const period = result.periods.find(
          (p) => dateOnly(p.period_start) === selectedDate,
        );

        setAmount(period?.checked ? String(period.amount) : "");
      })
      .catch((err) => {
        if (!active) return;

        setDetail(null);
        setError(err instanceof Error ? err.message : "Failed to load savings");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [planId, refreshKey]);

  function changeDate(nextDate: string) {
    dateRef.current = nextDate;
    setDate(nextDate);

    const period = detail?.periods.find(
      (p) => dateOnly(p.period_start) === nextDate,
    );

    setAmount(period?.checked ? String(period.amount) : "");
  }

  const periods = detail?.periods ?? [];
  const target = Number(detail?.target_per_period ?? 12000);

  const selectedPeriod = periods.find((p) => dateOnly(p.period_start) === date);

  const actualSaved = selectedPeriod?.checked
    ? Number(selectedPeriod.amount)
    : 0;

  const remaining = Math.max(target - actualSaved, 0);
  const dailyPercent =
    target > 0 ? Math.min((actualSaved / target) * 100, 100) : 0;

  const totalSaved = periods.reduce(
    (sum, p) => sum + (p.checked ? Number(p.amount) : 0),
    0,
  );

  const planTarget = target * periods.length;
  const recordedDays = periods.filter((p) => p.checked).length;
  const totalPercent =
    planTarget > 0 ? Math.min((totalSaved / planTarget) * 100, 100) : 0;

  const today = addisToday();
  const elapsedDays = periods.filter(
    (p) => dateOnly(p.period_start) <= today,
  ).length;

  const expectedByNow = elapsedDays * target;
  const behindBy = Math.max(expectedByNow - totalSaved, 0);

  async function save() {
    if (!detail || !selectedPeriod) return;

    if (!validAmount(amount)) {
      toast.error("Enter a positive ETB amount with up to 2 decimals");
      return;
    }

    try {
      setSaving(true);

      await recordSaving(
        detail.plan_id,
        selectedPeriod.period_index,
        Number(amount),
      );

      toast.success("Savings recorded");
      reload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to record savings",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!detail || !selectedPeriod?.checked) return;

    if (!window.confirm("Remove the recorded saving for this date?")) {
      return;
    }

    try {
      setSaving(true);

      await removeSaving(detail.plan_id, selectedPeriod.period_index);

      toast.success("Savings entry removed");
      reload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove savings",
      );
    } finally {
      setSaving(false);
    }
  }

  async function newCycle() {
    if (!window.confirm("Create a new 30-day savings plan starting today?")) {
      return;
    }

    try {
      setCreating(true);

      const today = addisToday();
      const existing = plans.some((p) => {
        const start = dateOnly(p.start_date);
        return start <= today && today <= shiftDate(start, p.period_count - 1);
      });

      if (existing) {
        toast.error("A daily savings plan already covers today");
        return;
      }

      const created = await createSavingsPlan({
        name: `Daily 12k · ${today}`,
        period_type: "daily",
        target_per_period: 12000,
        period_count: 30,
        start_date: today,
      });

      setPlanId(created.id);
      reload();
      toast.success("New savings cycle created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create plan");
    } finally {
      setCreating(false);
    }
  }

  if (loading && !detail) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (error && !detail) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Savings plan</h2>
              <p className="text-sm text-muted-foreground">
                Choose a cycle or start a new one.
              </p>
            </div>
            <CalendarToggle />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={planId}
              onChange={(e) => {
                setPlanId(e.target.value);
                setDetail(null);
                setLoading(true);
              }}
              className="h-9 min-w-52 flex-1 rounded-md border bg-background px-3 text-sm"
            >
              {!plans.length && <option value="">No plans yet</option>}

              {plans.map((p) => (
                <option key={p.plan_id} value={p.plan_id}>
                  {p.name} · {dateOnly(p.start_date)}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              disabled={creating || loading}
              onClick={newCycle}
            >
              {creating ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Plus className="mr-2 size-4" />
              )}
              New 30-day cycle
            </Button>
          </div>

          {detail && (
            <p className="text-xs text-muted-foreground">
              {formatDate(dateOnly(detail.start_date))} —{" "}
              {formatDate(
                shiftDate(dateOnly(detail.start_date), detail.period_count - 1),
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {detail && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Daily target" value={target} />
            <Stat label="Total saved" value={totalSaved} />
            <Stat label="Behind target to date" value={behindBy} />
          </div>

          <Card>
            <CardContent className="space-y-5 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">Daily savings entry</h2>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(date)}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {selectedPeriod?.checked ? "Recorded" : "Not recorded"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={saving}
                  onClick={() => changeDate(shiftDate(date, -1))}
                  aria-label="Previous day"
                >
                  <ChevronLeft className="size-4" />
                </Button>

                <Input
                  type="date"
                  value={date}
                  disabled={saving}
                  onChange={(e) => {
                    if (e.target.value) changeDate(e.target.value);
                  }}
                  className="flex-1"
                />

                <Button
                  variant="outline"
                  size="icon"
                  disabled={saving}
                  onClick={() => changeDate(shiftDate(date, 1))}
                  aria-label="Next day"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              {!selectedPeriod ? (
                <p className="text-sm text-muted-foreground">
                  This date is outside the selected savings cycle.
                </p>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Stat label="Target" value={target} />
                    <Stat label="Saved" value={actualSaved} />
                    <Stat label="Remaining" value={remaining} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Daily progress</span>
                      <span>{dailyPercent.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${dailyPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 rounded-lg bg-muted/40 p-4">
                    <label
                      htmlFor="saved-amount"
                      className="text-sm font-medium"
                    >
                      Actual amount saved (ETB)
                    </label>

                    <Input
                      id="saved-amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="e.g. 12000"
                      value={amount}
                      disabled={saving}
                      onChange={(e) => setAmount(e.target.value)}
                    />

                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        disabled={saving || !validAmount(amount)}
                        onClick={save}
                      >
                        {saving ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <Check className="mr-2 size-4" />
                        )}
                        {selectedPeriod.checked
                          ? "Update saving"
                          : "Record saving"}
                      </Button>

                      {selectedPeriod.checked && (
                        <Button
                          variant="outline"
                          disabled={saving}
                          onClick={remove}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">Cycle progress</h2>
                <span className="text-sm text-muted-foreground">
                  {recordedDays} / {periods.length} days recorded
                </span>
              </div>

              <div className="flex justify-between gap-2 text-sm">
                <span>{money(totalSaved)} ETB saved</span>
                <span>{money(planTarget)} ETB target</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${totalPercent}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {totalPercent.toFixed(1)}% of the cycle target saved. Unrecorded
                days are excluded from saved totals.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <h2 className="text-lg font-semibold">Savings history</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-3 pr-3 font-medium">Date</th>
                      <th className="py-3 pr-3 text-right font-medium">
                        Target
                      </th>
                      <th className="py-3 pr-3 text-right font-medium">
                        Saved
                      </th>
                      <th className="py-3 text-right font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((period: SavingsPeriod) => {
                      const day = dateOnly(period.period_start);
                      const saved = period.checked ? Number(period.amount) : 0;

                      return (
                        <tr
                          key={period.period_index}
                          className={`cursor-pointer border-b last:border-0 hover:bg-muted/40 ${
                            day === date ? "bg-muted/30" : ""
                          }`}
                          onClick={() => changeDate(day)}
                        >
                          <td className="py-3 pr-3">{formatDate(day)}</td>
                          <td className="py-3 pr-3 text-right tabular-nums">
                            {money(target)}
                          </td>
                          <td className="py-3 pr-3 text-right font-medium tabular-nums">
                            {period.checked ? money(saved) : "—"}
                          </td>
                          <td className="py-3 text-right">
                            {period.checked
                              ? saved >= target
                                ? "Target met"
                                : "Below target"
                              : day > today
                                ? "Upcoming"
                                : "Not recorded"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-muted-foreground">
                Select any date to view, enter or correct its savings.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-2 text-xl font-semibold tabular-nums">
          {money(value)} ETB
        </p>
      </CardContent>
    </Card>
  );
}

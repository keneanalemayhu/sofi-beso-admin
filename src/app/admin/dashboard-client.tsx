// @/app/admin/dashboard-client.tsx

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCalendar } from "@/hooks/useCalendar";
import { getOverview } from "@/lib/api";
import type { Overview, ItemStat, WaiterStat } from "@/types";
import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";

const PERIODS = [
  { label: "Today", value: 1 },
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

function formatETB(n: number) {
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 0 })} ETB`;
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

type ItemSort = "value" | "units";
type WaiterSort = "value" | "units";
type ItemsView = "bar" | "line";

const LINE_COLORS = [
  "var(--primary)",
  "#22c55e",
  "#f97316",
  "#3b82f6",
  "#a855f7",
  "#ef4444",
];

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

export default function DashboardClient() {
  const router = useRouter();
  const { toEthiopian } = useCalendar();
  const [period, setPeriod] = useState(1);
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemSort, setItemSort] = useState<ItemSort>("value");
  const [waiterSort, setWaiterSort] = useState<WaiterSort>("value");
  const [itemsExpanded, setItemsExpanded] = useState(false);
  const [itemsView, setItemsView] = useState<ItemsView>("bar");
  const [selectedDate, setSelectedDate] = useState(addisToday);

  useEffect(() => {
    let active = true;
    getOverview(period, selectedDate)
      .then((d) => {
        if (active) {
          setData(d);
          setError(null);
        }
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error ? err.message : "Failed to load analytics",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [period, selectedDate]);

  const chartData =
    data?.series.map((p) => ({
      day: toEthiopian(new Date(p.day)),
      sales: p.sales,
    })) ?? [];

  const sortedItems: ItemStat[] = data
    ? [...data.items].sort((a, b) => b[itemSort] - a[itemSort])
    : [];

  const topLineItems = sortedItems.slice(0, 5);

  const itemLineData =
    data?.item_series.map((point) => {
      const row: Record<string, string | number> = {
        day: toEthiopian(new Date(point.day)),
      };

      for (const item of point.items) {
        row[`item_${item.id}`] = item[itemSort];
      }

      return row;
    }) ?? [];

  const sortedWaiters: WaiterStat[] = data
    ? [...data.waiters].sort((a, b) => b[waiterSort] - a[waiterSort])
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (p.value !== period) {
                  setLoading(true);
                  setPeriod(p.value);
                }
              }}
            >
              {p.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" />

          <Input
            type="date"
            value={selectedDate}
            max={addisToday()}
            onChange={(e) => {
              if (!e.target.value) return;
              setLoading(true);
              setSelectedDate(e.target.value);
            }}
            className="w-auto min-w-40"
            aria-label="Analytics end date"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              setSelectedDate(addisToday());
            }}
          >
            Today
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-6 text-sm text-muted-foreground">
          Loading analytics...
        </div>
      ) : error ? (
        <div className="py-6 text-sm text-destructive">{error}</div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Sales"
              value={formatETB(data.summary.total_sales)}
            />
            <StatCard
              title="Orders"
              value={data.summary.order_count.toLocaleString()}
            />
            <StatCard
              title="Items sold"
              value={data.summary.items_sold.toLocaleString()}
            />
          </div>

          <Card className="min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle>Daily sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full min-w-0">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  debounce={50}
                  initialDimension={{ width: 800, height: 288 }}
                >
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--primary)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--primary)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={24}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={48}
                    />
                    <Tooltip
                      formatter={(v) => formatETB(Number(v))}
                      labelStyle={{ color: "var(--foreground)" }}
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fill="url(#sales)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>
                All items by {itemSort === "value" ? "value" : "units"}
              </CardTitle>

              <div className="flex flex-wrap gap-1">
                <Button
                  variant={itemsView === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setItemsView("bar")}
                >
                  Bar
                </Button>

                <Button
                  variant={itemsView === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setItemsView("line")}
                >
                  Line
                </Button>

                <Button
                  variant={itemSort === "value" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setItemSort("value")}
                >
                  By value
                </Button>

                <Button
                  variant={itemSort === "units" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setItemSort("units")}
                >
                  By units
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {itemsView === "bar" ? (
                <div
                  className="w-full min-w-0"
                  style={{ height: Math.max(240, sortedItems.length * 28) }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    debounce={50}
                    initialDimension={{
                      width: 800,
                      height: Math.max(240, sortedItems.length * 28),
                    }}
                  >
                    <BarChart
                      data={sortedItems}
                      layout="vertical"
                      margin={{ left: 16, right: 16 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        formatter={(v) =>
                          itemSort === "value"
                            ? formatETB(Number(v))
                            : Number(v).toLocaleString()
                        }
                        contentStyle={{
                          background: "var(--popover)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar
                        dataKey={itemSort}
                        fill="var(--primary)"
                        radius={4}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : itemLineData.length > 0 ? (
                <div className="h-80 w-full min-w-0">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    debounce={50}
                    initialDimension={{ width: 800, height: 320 }}
                  >
                    <LineChart
                      data={itemLineData}
                      margin={{ left: 8, right: 16 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={24}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        width={48}
                      />
                      <Tooltip
                        formatter={(v) =>
                          itemSort === "value"
                            ? formatETB(Number(v))
                            : Number(v).toLocaleString()
                        }
                        labelStyle={{ color: "var(--foreground)" }}
                        contentStyle={{
                          background: "var(--popover)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend />

                      {topLineItems.map((item, index) => (
                        <Line
                          key={item.id}
                          type="monotone"
                          dataKey={`item_${item.id}`}
                          name={item.name}
                          stroke={LINE_COLORS[index % LINE_COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                  Item trend data is not available yet.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            <Card className="min-w-0 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top items</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant={itemSort === "value" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setItemSort("value")}
                  >
                    By value
                  </Button>
                  <Button
                    variant={itemSort === "units" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setItemSort("units")}
                  >
                    By units
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Units</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(itemsExpanded
                      ? sortedItems
                      : sortedItems.slice(0, 7)
                    ).map((item) => (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(`/admin/analytics/item/${item.id}`)
                        }
                      >
                        <TableCell>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.category_name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.units.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatETB(item.value)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {sortedItems.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="h-20 text-center text-muted-foreground"
                        >
                          No data.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>

                {sortedItems.length > 7 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => setItemsExpanded((v) => !v)}
                  >
                    {itemsExpanded
                      ? "Show less"
                      : `Show all ${sortedItems.length}`}
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            <Card className="min-w-0 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Waiters</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant={waiterSort === "value" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWaiterSort("value")}
                  >
                    By value
                  </Button>
                  <Button
                    variant={waiterSort === "units" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWaiterSort("units")}
                  >
                    By units
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waiter</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Units</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedWaiters.map((w) => (
                      <TableRow
                        key={w.id}
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(`/admin/analytics/waiter/${w.id}`)
                        }
                      >
                        <TableCell className="font-medium">{w.name}</TableCell>
                        <TableCell className="text-right">
                          {w.order_count.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {w.units.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatETB(w.value)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {sortedWaiters.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-20 text-center text-muted-foreground"
                        >
                          No data.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}

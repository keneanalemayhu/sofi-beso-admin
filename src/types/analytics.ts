// @/types/analytics.ts

export type OverviewSummary = {
  order_count: number
  total_sales: number
  items_sold: number
}

export type DailyPoint = {
  day: string
  order_count: number
  sales: number
}

export type ItemStat = {
  id: string
  name: string
  category_name: string
  units: number
  value: number
}

export type WaiterStat = {
  id: string
  name: string
  order_count: number
  units: number
  value: number
}

export type ItemSeriesPoint = {
  day: string
  items: {
    id: string
    name: string
    units: number
    value: number
  }[]
}

export type Overview = {
  period: number
  summary: OverviewSummary
  series: DailyPoint[]
  items: ItemStat[]
  waiters: WaiterStat[]
  item_series: ItemSeriesPoint[]
}
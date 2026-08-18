// @/contexts/calendar-context.tsx

"use client"
import * as React from "react"
import { useCalendar } from "@/hooks/useCalendar"

type CalendarMode = "gregorian" | "ethiopian"

type CalendarContextValue = {
  mode: CalendarMode
  setMode: (m: CalendarMode) => void
  toggle: () => void
  /** Formats a 'YYYY-MM-DD' string or Date in the active calendar. */
  formatDate: (value: string | Date | null | undefined) => string
}

const CalendarContext = React.createContext<CalendarContextValue | null>(null)

const STORAGE_KEY = "sofi-beso:calendar-mode"

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = React.useState<CalendarMode>(() => {
    if (typeof window === "undefined") return "gregorian"
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved === "ethiopian" ? "ethiopian" : "gregorian"
  })
  const { toEthiopian } = useCalendar()

  const setMode = React.useCallback((m: CalendarMode) => {
    setModeState(m)
    window.localStorage.setItem(STORAGE_KEY, m)
  }, [])

  const toggle = React.useCallback(() => {
    setMode(mode === "gregorian" ? "ethiopian" : "gregorian")
  }, [mode, setMode])

  const formatDate = React.useCallback(
    (value: string | Date | null | undefined) => {
      if (!value) return "—"
      // 'YYYY-MM-DD' is parsed as UTC midnight; add the Addis offset so the
      // local-time getters below land on the intended calendar day.
      const d =
        typeof value === "string"
          ? new Date(`${value.slice(0, 10)}T00:00:00+03:00`)
          : value
      if (Number.isNaN(d.getTime())) return "—"
      if (mode === "ethiopian") return toEthiopian(d)
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    },
    [mode, toEthiopian]
  )

  return (
    <CalendarContext.Provider
      value={React.useMemo(
        () => ({ mode, setMode, toggle, formatDate }),
        [mode, setMode, toggle, formatDate]
      )}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendarMode() {
  const ctx = React.useContext(CalendarContext)
  if (!ctx) throw new Error("useCalendarMode must be used within CalendarProvider")
  return ctx
}
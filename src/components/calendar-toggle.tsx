// @/components/calendar-toggle.tsx

"use client"
import { Button } from "@/components/ui/button"
import { useCalendarMode } from "@/contexts/calendar-context"

export function CalendarToggle() {
  const { mode, toggle } = useCalendarMode()
  return (
    <Button variant="outline" size="sm" onClick={toggle} className="font-normal">
      {mode === "gregorian" ? "GC" : "ኢ.ዓ."}
    </Button>
  )
}
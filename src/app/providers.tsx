// @/app/providers.tsx

"use client"
import { ThemeProvider } from "next-themes"
import { CalendarProvider } from "@/contexts/calendar-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <CalendarProvider>{children}</CalendarProvider>
    </ThemeProvider>
  )
}
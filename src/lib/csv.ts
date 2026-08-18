// @/lib/csv.ts

export type CsvColumn<T> = {
  key: string
  label: string
  value: (row: T) => string | number | null | undefined
}

/**
 * Escapes a single CSV field. Wraps in quotes when the value contains a
 * delimiter, quote or newline, and doubles any internal quotes.
 */
function escapeField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ""
  const s = String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeField(c.label)).join(",")
  const body = rows.map((row) =>
    columns.map((c) => escapeField(c.value(row))).join(",")
  )
  return [header, ...body].join("\r\n")
}

/**
 * Triggers a browser download. The BOM makes Excel read UTF-8 correctly —
 * without it, Amharic names render as mojibake.
 */
export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** e.g. "menu-items-2026-08-12.csv" */
export function timestampedFilename(base: string, ext = "csv") {
  const d = new Date(Date.now() + 3 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
  return `${base}-${d}.${ext}`
}
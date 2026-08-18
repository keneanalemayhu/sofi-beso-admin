// @/components/export-csv-dialog.tsx

"use client"

import * as React from "react"
import { Download } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  toCsv,
  downloadCsv,
  timestampedFilename,
  type CsvColumn,
} from "@/lib/csv"

type ExportCsvDialogProps<T> = {
  rows: T[]
  columns: CsvColumn<T>[]
  /** Filename stem — a date and .csv are appended. */
  filenameBase: string
  /** Column keys ticked by default. Omit to tick all. */
  defaultKeys?: string[]
  label?: string
  triggerVariant?: "default" | "outline" | "secondary" | "ghost"
}

export function ExportCsvDialog<T>({
  rows,
  columns,
  filenameBase,
  defaultKeys,
  label = "Export",
  triggerVariant = "outline",
}: ExportCsvDialogProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<string[]>(
    defaultKeys ?? columns.map((c) => c.key)
  )

  function toggle(key: string) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  function handleExport() {
    const chosen = columns.filter((c) => selected.includes(c.key))
    if (chosen.length === 0) {
      return toast.error("Pick at least one column")
    }
    if (rows.length === 0) {
      return toast.error("Nothing to export")
    }
    downloadCsv(timestampedFilename(filenameBase), toCsv(rows, chosen))
    toast.success(`Exported ${rows.length} rows`)
    setOpen(false)
  }

  const allSelected = selected.length === columns.length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant}>
          <Download className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export to CSV</DialogTitle>
          <DialogDescription>
            {rows.length} row{rows.length === 1 ? "" : "s"} will be exported.
            Choose which columns to include.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex items-center gap-2 border-b pb-3">
            <Checkbox
              id="csv-all"
              checked={allSelected}
              onCheckedChange={(v) =>
                setSelected(v ? columns.map((c) => c.key) : [])
              }
            />
            <Label htmlFor="csv-all" className="text-sm font-medium">
              Select all
            </Label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {columns.map((col) => (
              <div key={col.key} className="flex items-center gap-2">
                <Checkbox
                  id={`csv-${col.key}`}
                  checked={selected.includes(col.key)}
                  onCheckedChange={() => toggle(col.key)}
                />
                <Label
                  htmlFor={`csv-${col.key}`}
                  className="text-sm font-normal"
                >
                  {col.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>Download</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
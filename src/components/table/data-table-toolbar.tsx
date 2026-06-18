// @/components/table/data-table-toolbar.tsx

"use client"
import { type Table } from "@tanstack/react-table"
import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  filterColumn?: string
  filterPlaceholder?: string
}

export function DataTableToolbar<TData>({
  table,
  filterColumn,
  filterPlaceholder = "Search...",
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center gap-2">
      {filterColumn ? (
        <Input
          placeholder={filterPlaceholder}
          value={
            (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn(filterColumn)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto">
            <Settings2 className="mr-2 h-4 w-4" />
            View
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== "undefined" && column.getCanHide()
            )
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
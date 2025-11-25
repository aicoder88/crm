"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ChevronDown } from "lucide-react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
    filterComponent?: React.ReactNode
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    filterComponent,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [focusedRowIndex, setFocusedRowIndex] = React.useState<number>(0)
    const tableRef = React.useRef<HTMLDivElement>(null)

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    const visibleRows = table.getRowModel().rows
    
    // Reset focus when data changes
    React.useEffect(() => {
        setFocusedRowIndex(0)
    }, [data])

    // Keyboard navigation handler
    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
        if (!visibleRows.length) return

        const rowCount = visibleRows.length
        
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault()
                setFocusedRowIndex(prev => Math.min(prev + 1, rowCount - 1))
                break
                
            case 'ArrowUp':
                event.preventDefault()
                setFocusedRowIndex(prev => Math.max(prev - 1, 0))
                break
                
            case 'Home':
                event.preventDefault()
                setFocusedRowIndex(0)
                break
                
            case 'End':
                event.preventDefault()
                setFocusedRowIndex(rowCount - 1)
                break
                
            case 'PageDown':
                event.preventDefault()
                setFocusedRowIndex(prev => Math.min(prev + 10, rowCount - 1))
                break
                
            case 'PageUp':
                event.preventDefault()
                setFocusedRowIndex(prev => Math.max(prev - 10, 0))
                break
                
            case 'Enter':
                event.preventDefault()
                if (focusedRowIndex < rowCount) {
                    const row = visibleRows[focusedRowIndex]
                    row.toggleSelected()
                }
                break
                
            case ' ':
                event.preventDefault()
                if (focusedRowIndex < rowCount) {
                    const row = visibleRows[focusedRowIndex]
                    row.toggleSelected()
                }
                break
                
            case 'a':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault()
                    table.toggleAllRowsSelected()
                }
                break
        }
    }, [focusedRowIndex, visibleRows, table])

    // Focus table on click
    const handleTableClick = () => {
        tableRef.current?.focus()
    }

    return (
        <div 
            className="w-full"
            ref={tableRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onClick={handleTableClick}
            role="grid"
            aria-label="Data table with keyboard navigation"
        >
            <div className="flex items-center py-4 gap-2">
                {searchKey && (
                    <Input
                        placeholder="Search..."
                        value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn(searchKey)?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                )}
                {filterComponent}
                <div className="text-xs text-muted-foreground hidden md:block">
                    ↑↓ Navigate • Space/Enter Select • Ctrl+A Select All
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border border-white/5">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {visibleRows?.length ? (
                            visibleRows.map((row, index) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={`${
                                        index === focusedRowIndex 
                                            ? 'ring-2 ring-primary ring-inset bg-primary/5' 
                                            : ''
                                    } cursor-pointer transition-colors hover:bg-muted/50`}
                                    onClick={() => {
                                        setFocusedRowIndex(index)
                                        row.toggleSelected()
                                    }}
                                    role="row"
                                    aria-selected={row.getIsSelected()}
                                    aria-rowindex={index + 1}
                                    tabIndex={index === focusedRowIndex ? 0 : -1}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} role="gridcell">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Rows per page</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 25, 50, 100].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowLeft') {
                                e.preventDefault()
                                table.previousPage()
                            }
                        }}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowRight') {
                                e.preventDefault()
                                table.nextPage()
                            }
                        }}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}

"use client"

import { useState, useMemo } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Customer } from "@/types"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface CustomersTableProps {
    customers: Customer[]
}

export function CustomersTable({ customers }: CustomersTableProps) {
    const [statusFilter, setStatusFilter] = useState<string>("all")

    const filteredCustomers = useMemo(() => {
        let filtered = customers

        if (statusFilter !== "all") {
            filtered = filtered.filter(c => c.status === statusFilter)
        }

        return filtered
    }, [customers, statusFilter])

    const hasFilters = statusFilter !== "all"

    const clearFilters = () => {
        setStatusFilter("all")
    }

    const filterComponent = (
        <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white focus:ring-primary/50">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10 bg-black/90 text-white">
                    <SelectItem value="all" className="focus:bg-white/10 focus:text-white cursor-pointer">All Statuses</SelectItem>
                    <SelectItem value="Qualified" className="focus:bg-white/10 focus:text-white cursor-pointer">Qualified</SelectItem>
                    <SelectItem value="Interested" className="focus:bg-white/10 focus:text-white cursor-pointer">Interested</SelectItem>
                    <SelectItem value="Not Qualified" className="focus:bg-white/10 focus:text-white cursor-pointer">Not Qualified</SelectItem>
                    <SelectItem value="Not Interested" className="focus:bg-white/10 focus:text-white cursor-pointer">Not Interested</SelectItem>
                    <SelectItem value="Dog Store" className="focus:bg-white/10 focus:text-white cursor-pointer">Dog Store</SelectItem>
                </SelectContent>
            </Select>
            {hasFilters && (
                <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="h-9 px-3 text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                >
                    Clear
                    <X className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
    )

    return (
        <DataTable
            columns={columns}
            data={filteredCustomers}
            searchKey="store_name"
            filterComponent={filterComponent}
        />
    )
}

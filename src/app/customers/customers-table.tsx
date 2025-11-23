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
        <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Interested">Interested</SelectItem>
                    <SelectItem value="Not Qualified">Not Qualified</SelectItem>
                    <SelectItem value="Not Interested">Not Interested</SelectItem>
                    <SelectItem value="Dog Store">Dog Store</SelectItem>
                </SelectContent>
            </Select>
            {hasFilters && (
                <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="h-8 px-2 lg:px-3"
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

"use client"

import { useState, useMemo } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Customer, CustomerFilters } from "@/types"
import { CustomerFiltersComponent } from "@/components/customers/customer-filters"
import { SavedSearchManager } from "@/components/customers/saved-search-manager"

interface CustomersTableProps {
    customers: Customer[]
}

export function CustomersTable({ customers }: CustomersTableProps) {
    const [filters, setFilters] = useState<CustomerFilters>({})

    const filteredCustomers = useMemo(() => {
        console.log('CustomersTable received:', customers.length, 'customers')
        console.log('Active filters:', filters)
        let filtered = customers

        // Status filter
        if (filters.status && filters.status.length > 0) {
            const operator = filters.statusOperator || 'include'
            filtered = filtered.filter(c => {
                const matches = filters.status!.includes(c.status)
                return operator === 'include' ? matches : !matches
            })
        }

        // Email filter
        if (filters.email) {
            const emailLower = filters.email.toLowerCase()
            filtered = filtered.filter(c =>
                c.email?.toLowerCase().includes(emailLower)
            )
        }

        // Tags filter
        if (filters.tags && filters.tags.length > 0) {
            const operator = filters.tagsOperator || 'include'
            filtered = filtered.filter(c => {
                const customerTagIds = c.tags?.map(t => t.id) || []
                const hasAnyTag = filters.tags!.some(tagId => customerTagIds.includes(tagId))
                return operator === 'include' ? hasAnyTag : !hasAnyTag
            })
        }

        // City filter
        if (filters.city && filters.city.length > 0) {
            const operator = filters.cityOperator || 'include'
            filtered = filtered.filter(c => {
                const matches = c.city && filters.city!.includes(c.city)
                return operator === 'include' ? matches : !matches
            })
        }

        // Province filter
        if (filters.province && filters.province.length > 0) {
            const operator = filters.provinceOperator || 'include'
            filtered = filtered.filter(c => {
                const matches = c.province && filters.province!.includes(c.province)
                return operator === 'include' ? matches : !matches
            })
        }

        // Phone filter
        if (filters.phone) {
            const phoneLower = filters.phone.toLowerCase()
            filtered = filtered.filter(c =>
                c.phone?.toLowerCase().includes(phoneLower)
            )
        }

        // Contacts count filter
        if (filters.contactsMin !== undefined || filters.contactsMax !== undefined) {
            filtered = filtered.filter(c => {
                const count = c.contacts?.length || 0
                const meetsMin = filters.contactsMin === undefined || count >= filters.contactsMin
                const meetsMax = filters.contactsMax === undefined || count <= filters.contactsMax
                return meetsMin && meetsMax
            })
        }

        // Social media filter
        if (filters.socialMedia && filters.socialMedia.length > 0) {
            const operator = filters.socialMediaOperator || 'include'
            filtered = filtered.filter(c => {
                const customerPlatforms = c.social_media?.map(s => s.platform) || []
                const hasAnyPlatform = filters.socialMedia!.some(platform =>
                    customerPlatforms.includes(platform)
                )
                return operator === 'include' ? hasAnyPlatform : !hasAnyPlatform
            })
        }

        console.log('Filtered customers:', filtered.length)
        return filtered
    }, [customers, filters])

    const handleLoadSearch = (loadedFilters: CustomerFilters) => {
        setFilters(loadedFilters)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-3 flex-wrap">
                <div className="flex-1 min-w-[300px]">
                    <CustomerFiltersComponent
                        customers={customers}
                        filters={filters}
                        onFiltersChange={setFilters}
                    />
                </div>
                <SavedSearchManager
                    currentFilters={filters}
                    onLoadSearch={handleLoadSearch}
                />
            </div>

            <DataTable
                columns={columns}
                data={filteredCustomers}
                searchKey="store_name"
            />
        </div>
    )
}

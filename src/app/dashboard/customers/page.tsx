"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Customer } from "@/types"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"

export default function CustomersPage() {
    const [data, setData] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: customers, error } = await supabase
                    .from("customers")
                    .select("*")
                    .order("created_at", { ascending: false })

                if (error) {
                    console.error("Error fetching customers:", error)
                } else {
                    const mappedData: Customer[] = (customers || []).map((c) => ({
                        id: c.id,
                        created_at: c.created_at,
                        updated_at: c.updated_at,
                        store_name: c.store_name,
                        email: c.email,
                        phone: c.phone,
                        owner_manager_name: c.owner_manager_name,
                        type: c.type,
                        status: c.status,
                        notes: c.notes,
                        province: c.province,
                        city: c.city,
                        street: c.street,
                        postal_code: c.postal_code,
                        location_lat: c.location_lat,
                        location_lng: c.location_lng,
                        website: c.website,
                        stripe_customer_id: c.stripe_customer_id,
                    }))
                    setData(mappedData)
                }
            } catch (err) {
                console.error("Unexpected error:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
                    <p className="text-muted-foreground">
                        Manage your pet store relationships and contacts.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" asChild>
                        <a href="/dashboard/import">
                            <Upload className="mr-2 h-4 w-4" />
                            Import CSV
                        </a>
                    </Button>
                    <Button asChild>
                        <a href="/dashboard/customers/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Customer
                        </a>
                    </Button>
                </div>
            </div>
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading customers...</p>
                </div>
            ) : (
                <DataTable data={data} columns={columns} searchKey="store_name" />
            )}
        </div>
    )
}

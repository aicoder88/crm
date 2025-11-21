"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns, Customer } from "./columns"
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
                    // Map Supabase data to Customer type
                    const mappedData: Customer[] = (customers || []).map((c) => ({
                        id: c.id,
                        store_name: c.store_name,
                        status: c.status,
                        type: c.type,
                        email: null, // Need to fetch from contacts or use a join
                        phone: c.phone,
                        city: c.city,
                        province: c.province,
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

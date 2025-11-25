"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CustomerForm } from "@/components/customer-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Customer } from "@/types"

export default function EditCustomerPage() {
    const supabase = createClient()
    const params = useParams()
    const id = params.id as string
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCustomer() {
            try {
                const { data, error } = await supabase
                    .from("customers")
                    .select("*")
                    .eq("id", id)
                    .single()

                if (error) {
                    console.error("Error fetching customer:", error)
                } else {
                    setCustomer(data)
                }
            } catch (err) {
                console.error("Unexpected error:", err)
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchCustomer()
        }
    }, [id])

    if (loading) {
        return <div className="p-8">Loading...</div>
    }

    if (!customer) {
        return <div className="p-8">Customer not found</div>
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Edit Customer</h2>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Edit {customer.store_name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <CustomerForm initialData={customer} customerId={id} />
                </CardContent>
            </Card>
        </div>
    )
}

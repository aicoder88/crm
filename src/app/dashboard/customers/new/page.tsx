"use client"

import { CustomerForm } from "@/components/customer-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewCustomerPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Add Customer</h2>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <CustomerForm />
                </CardContent>
            </Card>
        </div>
    )
}

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CustomerForm } from "@/components/customers/customer-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: customer, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !customer) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/customers/${id}`}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Customer</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Customer</h1>
                    <p className="text-muted-foreground">
                        Update information for {customer.store_name}
                    </p>
                </div>
            </div>

            <CustomerForm customerId={id} initialData={customer} />
        </div>
    )
}

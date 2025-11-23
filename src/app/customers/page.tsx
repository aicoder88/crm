import { createClient } from "@/lib/supabase/server"
import { CustomersTable } from "./customers-table"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"
import Link from "next/link"

// This is a server component
export default async function CustomersPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    console.log('Current user:', user?.email || 'Not authenticated')

    const { data: customers, error } = await supabase
        .from("customers")
        .select(`
            id,
            store_name,
            email,
            phone,
            city,
            province,
            status,
            customer_tags (
                tags (
                    id,
                    name,
                    color
                )
            ),
            customer_contacts (id),
            customer_social_media (id, platform)
        `)
        .order("created_at", { ascending: false })
        .limit(1000)

    if (error) {
        console.error("Error fetching customers:", error)
        return <div className="text-red-500">Error loading customers: {error.message}</div>
    }

    const transformedCustomers = customers?.map((c: any) => ({
        ...c,
        tags: c.customer_tags?.map((ct: any) => ct.tags) || [],
        contacts: c.customer_contacts || [],
        social_media: c.customer_social_media || []
    })) || []

    console.log('Customers from DB:', customers?.length)
    console.log('Transformed customers:', transformedCustomers.length)
    console.log('Sample customer:', transformedCustomers[0])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between animate-fade-in-down">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Customers</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your B2B pet store relationships.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" asChild className="border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all">
                        <Link href="/customers/import">
                            <Upload className="mr-2 h-4 w-4" /> Import CSV
                        </Link>
                    </Button>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(120,50,255,0.5)] hover:shadow-[0_0_25px_rgba(120,50,255,0.7)] transition-all border-none">
                        <Link href="/customers/new">
                            <Plus className="mr-2 h-4 w-4" /> Add Customer
                        </Link>
                    </Button>
                </div>
            </div>

            <CustomersTable customers={transformedCustomers} />
        </div>
    )
}

import { createClient } from "@/lib/supabase/server"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"
import Link from "next/link"

// This is a server component
export default async function CustomersPage() {
    const supabase = await createClient()

    const { data: customers, error } = await supabase
        .from("customers")
        .select(`
            *,
            customer_tags (
                tags (
                    *
                )
            ),
            customer_contacts (*),
            customer_social_media (*)
        `)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching customers:", error)
        return <div>Error loading customers</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground">
                        Manage your B2B pet store relationships.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/customers/import">
                            <Upload className="mr-2 h-4 w-4" /> Import CSV
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/customers/new">
                            <Plus className="mr-2 h-4 w-4" /> Add Customer
                        </Link>
                    </Button>
                </div>
            </div>

            <DataTable columns={columns} data={customers?.map((c: any) => ({
                ...c,
                tags: c.customer_tags?.map((ct: any) => ct.tags) || [],
                contacts: c.customer_contacts || [],
                social_media: c.customer_social_media || []
            })) || []} searchKey="store_name" />
        </div>
    )
}

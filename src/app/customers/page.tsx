import { createClient } from "@/lib/supabase/server"
import { CustomersTable } from "./customers-table"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"
import Link from "next/link"
import { Pagination } from "@/components/ui/pagination"
import { ExportButton } from "@/components/ui/export-button"
import { customerExportColumns } from "@/lib/export-utils"

interface CustomersPageProps {
    searchParams: { page?: string; limit?: string };
}

// This is a server component
export default async function CustomersPage({ searchParams }: CustomersPageProps) {
    const supabase = await createClient()
    
    // Parse pagination parameters
    const page = parseInt(searchParams.page || '1');
    const limit = parseInt(searchParams.limit || '50');
    const offset = (page - 1) * limit;

    const { data: { user } } = await supabase.auth.getUser()

    // Get total count for pagination
    const { count } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

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
        .range(offset, offset + limit - 1)

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

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const totalCustomers = count || 0;
    const startIndex = offset + 1;
    const endIndex = Math.min(offset + limit, totalCustomers);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between animate-fade-in-down">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Customers</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your B2B pet store relationships. {totalCustomers > 0 && `Showing ${startIndex}-${endIndex} of ${totalCustomers} customers`}
                    </p>
                </div>
                <div className="flex gap-3">
                    <ExportButton
                        data={transformedCustomers}
                        columns={customerExportColumns}
                        filename="customers"
                        entityType="customers"
                        variant="outline"
                        className="border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all"
                    />
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
            
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {startIndex} to {endIndex} of {totalCustomers} customers
                    </div>
                    <Pagination 
                        currentPage={page} 
                        totalPages={totalPages}
                        basePath="/customers"
                    />
                </div>
            )}
        </div>
    )
}

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Mail, MapPin, Phone, Globe } from "lucide-react"
import Link from "next/link"

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
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
                    <Link href="/customers">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Customers</span>
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{customer.store_name}</h1>
                        <Badge variant={
                            customer.status === 'Qualified' ? 'default' :
                                customer.status === 'Interested' ? 'secondary' :
                                    'outline'
                        }>
                            {customer.status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">
                        Added on {new Date(customer.created_at).toLocaleDateString()}
                    </p>
                </div>
                <Button>Edit Customer</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{customer.email || "No email provided"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{customer.phone || "No phone provided"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span>{customer.website || "No website provided"}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Location */}
                <Card>
                    <CardHeader>
                        <CardTitle>Location</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                            <div>
                                <p>{customer.street || "No street address"}</p>
                                <p>
                                    {[customer.city, customer.province, customer.postal_code]
                                        .filter(Boolean)
                                        .join(", ")}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Details */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Owner/Manager</p>
                                <p>{customer.owner_manager_name || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Type</p>
                                <p>{customer.type}</p>
                            </div>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                            <p className="text-sm whitespace-pre-wrap">{customer.notes || "No notes available."}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

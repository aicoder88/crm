"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Phone, Mail, MapPin, Globe, Edit, Trash, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Customer } from "@/types"
import { CustomerContacts } from "@/components/customer-contacts"
import { CustomerTimeline } from "@/components/customer-timeline"

export default function CustomerDetailPage() {
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
                    setCustomer(data as Customer)
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
        return <div className="p-8">Loading customer details...</div>
    }

    if (!customer) {
        return <div className="p-8">Customer not found</div>
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/customers">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{customer.store_name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={
                                customer.status === "Qualified" ? "default" :
                                    customer.status === "Interested" ? "secondary" :
                                        customer.status === "Not Qualified" ? "destructive" :
                                            "outline"
                            }>
                                {customer.status}
                            </Badge>
                            <span className="text-muted-foreground text-sm">•</span>
                            <span className="text-muted-foreground text-sm">{customer.type}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/customers/${id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Link>
                    </Button>
                    <Button variant="destructive" size="icon">
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="contacts">Contacts</TabsTrigger>
                    <TabsTrigger value="deals">Deals</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Store Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Owner/Manager</p>
                                        <p>{customer.owner_manager_name || "N/A"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Website</p>
                                        {customer.website ? (
                                            <a href={customer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                                <Globe className="h-3 w-3" />
                                                {customer.website}
                                            </a>
                                        ) : "N/A"}
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                    <p className="text-sm whitespace-pre-wrap">{customer.notes || "No notes available."}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Contact & Location</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Phone</p>
                                        <p className="text-sm text-muted-foreground">{customer.phone || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Email</p>
                                        <p className="text-sm text-muted-foreground">{customer.email || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Address</p>
                                        <p className="text-sm text-muted-foreground">
                                            {customer.street}<br />
                                            {customer.city}, {customer.province} {customer.postal_code}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="timeline">
                    <CustomerTimeline customerId={id} />
                </TabsContent>

                <TabsContent value="contacts">
                    <CustomerContacts customerId={id} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Mail, MapPin, Phone, Globe, Facebook, Instagram, Linkedin, Youtube } from "lucide-react"
import Link from "next/link"
import { TimelineList } from "@/components/timeline/timeline-list"
import { TaskList } from "@/components/tasks/task-list"
import { LogCallDialog } from "@/components/calls/log-call-dialog"
import { DealsList } from "@/components/deals/deals-list"

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    try {
        const { data: customer, error } = await supabase
            .from("customers")
            .select(`
                *,
                customer_social_media (*)
            `)
            .eq("id", id)
            .single()

        if (error) {
            console.error('Error fetching customer:', error)
            notFound()
        }

        if (!customer) {
            notFound()
        }

        return (
            <div className="space-y-6 animate-fade-in-down">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="hover:bg-white/10 hover:text-white transition-colors">
                        <Link href="/customers">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back to Customers</span>
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{customer.store_name}</h1>
                            <Badge variant="outline" className={
                                customer.status === 'Qualified' ? 'border-purple-500/30 bg-purple-500/10 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]' :
                                    customer.status === 'Interested' ? 'border-teal-500/30 bg-teal-500/10 text-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.2)]' :
                                        'border-white/10 bg-white/5 text-muted-foreground'
                            }>
                                {customer.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">
                            Added on {new Date(customer.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <LogCallDialog customerId={customer.id} />
                        <Button variant="outline" asChild className="border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all">
                            <Link href={`/customers/${customer.id}/edit`}>Edit Customer</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3 animate-fade-in-up delay-100">
                    {/* Left Column: Info & Tasks */}
                    <div className="space-y-6">
                        {/* Contact Information */}
                        <Card className="glass border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-purple-400" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3 group">
                                    <Mail className="h-4 w-4 text-muted-foreground group-hover:text-purple-400 transition-colors" />
                                    <span className="text-muted-foreground group-hover:text-white transition-colors">{customer.email || "No email provided"}</span>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <Phone className="h-4 w-4 text-muted-foreground group-hover:text-purple-400 transition-colors" />
                                    <span className="text-muted-foreground group-hover:text-white transition-colors">{customer.phone || "No phone provided"}</span>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <Globe className="h-4 w-4 text-muted-foreground group-hover:text-purple-400 transition-colors" />
                                    <span className="text-muted-foreground group-hover:text-white transition-colors">{customer.website || "No website provided"}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social Media */}
                        {customer.customer_social_media && customer.customer_social_media.length > 0 && (
                            <Card className="glass border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-teal-400" />
                                        Social Media
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {customer.customer_social_media.map((social: any) => {
                                        let Icon = Globe
                                        let platformName = social.platform.charAt(0).toUpperCase() + social.platform.slice(1)

                                        switch (social.platform) {
                                            case 'facebook':
                                                Icon = Facebook
                                                break
                                            case 'instagram':
                                                Icon = Instagram
                                                break
                                            case 'linkedin':
                                                Icon = Linkedin
                                                break
                                            case 'youtube':
                                                Icon = Youtube
                                                break
                                            case 'tiktok':
                                                platformName = 'TikTok'
                                                break
                                        }

                                        return (
                                            <div key={social.id} className="flex items-center gap-3 group">
                                                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-teal-400 transition-colors" />
                                                <a
                                                    href={social.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-muted-foreground hover:text-white hover:underline transition-colors"
                                                >
                                                    {platformName}
                                                </a>
                                            </div>
                                        )
                                    })}
                                </CardContent>
                            </Card>
                        )}

                        {/* Location */}
                        <Card className="glass border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-orange-400" />
                                    Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3 group">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-1 group-hover:text-orange-400 transition-colors" />
                                    <div className="text-muted-foreground group-hover:text-white transition-colors">
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

                        {/* Tasks */}
                        <Card className="glass border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                            <CardHeader>
                                <CardTitle className="text-white">Tasks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TaskList customerId={customer.id} />
                            </CardContent>
                        </Card>

                        {/* Deals */}
                        <Card className="glass border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                            <CardHeader>
                                <CardTitle className="text-white">Deals</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DealsList customerId={customer.id} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Timeline & Details */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Details */}
                        <Card className="glass border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                            <CardHeader>
                                <CardTitle className="text-white">Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Owner/Manager</p>
                                        <p className="text-white">{customer.owner_manager_name || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Type</p>
                                        <p className="text-white">{customer.type}</p>
                                    </div>
                                </div>
                                <Separator className="bg-white/10" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                                    <p className="text-sm whitespace-pre-wrap text-white/80">{customer.notes || "No notes available."}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card className="glass border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                            <CardHeader>
                                <CardTitle className="text-white">Activity Timeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TimelineList customerId={customer.id} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    } catch (error) {
        console.error('Unexpected error loading customer:', error)
        throw new Error('Failed to load customer data. Please try again.')
    }
}

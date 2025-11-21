"use client"

import { useEffect, useState } from "react"
import { TimelineEvent } from "@/types"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Mail, FileText, DollarSign, Package, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface CustomerTimelineProps {
    customerId: string
}

export function CustomerTimeline({ customerId }: CustomerTimelineProps) {
    const [events, setEvents] = useState<TimelineEvent[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTimeline() {
            const { data, error } = await supabase
                .from("customer_timeline")
                .select("*")
                .eq("customer_id", customerId)
                .order("created_at", { ascending: false })

            if (error) {
                console.error("Error fetching timeline:", error)
            } else {
                setEvents(data as TimelineEvent[])
            }
            setLoading(false)
        }

        fetchTimeline()
    }, [customerId])

    const getIcon = (type: string) => {
        switch (type) {
            case "call":
                return <Phone className="h-4 w-4" />
            case "email":
                return <Mail className="h-4 w-4" />
            case "note":
                return <FileText className="h-4 w-4" />
            case "deal":
                return <DollarSign className="h-4 w-4" />
            case "shipment":
                return <Package className="h-4 w-4" />
            default:
                return <Calendar className="h-4 w-4" />
        }
    }

    if (loading) {
        return <div>Loading timeline...</div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {events.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No activity yet.</p>
                    ) : (
                        events.map((event) => (
                            <div key={event.id} className="flex gap-4">
                                <div className="mt-1 bg-muted p-2 rounded-full h-fit">
                                    {getIcon(event.type)}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {event.email_subject ||
                                            event.note_category ||
                                            event.call_outcome ||
                                            (event.deal_value ? `$${event.deal_value}` : "") ||
                                            "No details"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

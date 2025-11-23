'use client';

import { useTimeline } from "@/hooks/useTimeline"
import { TimelineItem } from "./timeline-item"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TimelineListProps {
    customerId: string
}

export function TimelineList({ customerId }: TimelineListProps) {
    const { events, loading, error, refresh } = useTimeline(customerId)

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-4 p-4 text-center">
                <div className="flex justify-center">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-2">
                    <p className="text-sm font-medium">Failed to load timeline</p>
                    <p className="text-xs text-muted-foreground">{error}</p>
                </div>
                <Button onClick={refresh} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
            </div>
        )
    }

    if (events.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground border border-dashed border-white/10 rounded-lg bg-white/5">
                <p className="text-sm">No activity yet.</p>
                <p className="text-xs mt-1">Activity will appear here as you interact with this customer.</p>
            </div>
        )
    }

    return (
        <div className="space-y-0">
            {events.map(event => (
                <TimelineItem key={event.id} event={event} />
            ))}
        </div>
    )
}

import { useTimeline } from "@/hooks/useTimeline"
import { TimelineItem } from "./timeline-item"
import { Loader2 } from "lucide-react"

interface TimelineListProps {
    customerId: string
}

export function TimelineList({ customerId }: TimelineListProps) {
    const { events, loading, error } = useTimeline(customerId)

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return <div className="text-red-500 p-4">Error loading timeline: {error}</div>
    }

    if (events.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed">
                No activity yet.
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

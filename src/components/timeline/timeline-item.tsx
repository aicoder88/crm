import { TimelineEvent } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Mail, FileText, Receipt, Truck, DollarSign } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface TimelineItemProps {
    event: TimelineEvent
}

export function TimelineItem({ event }: TimelineItemProps) {
    const getIcon = () => {
        switch (event.type) {
            case 'call': return <Phone className="h-4 w-4 text-blue-500" />
            case 'email': return <Mail className="h-4 w-4 text-yellow-500" />
            case 'note': return <FileText className="h-4 w-4 text-gray-500" />
            case 'invoice': return <Receipt className="h-4 w-4 text-green-500" />
            case 'shipment': return <Truck className="h-4 w-4 text-purple-500" />
            case 'deal': return <DollarSign className="h-4 w-4 text-emerald-500" />
            default: return <FileText className="h-4 w-4" />
        }
    }

    const getTitle = () => {
        switch (event.type) {
            case 'call': return `Call: ${event.call_outcome || 'No outcome'}`
            case 'email': return `Email: ${event.email_subject || 'No subject'}`
            case 'note': return `Note: ${event.note_category || 'General'}`
            case 'invoice': return 'Invoice Generated'
            case 'shipment': return 'Shipment Update'
            case 'deal': return `Deal Update: ${event.deal_stage}`
            default: return 'Event'
        }
    }

    const renderContent = () => {
        switch (event.type) {
            case 'call':
                return (
                    <div className="text-sm">
                        <p>Duration: {event.call_duration_minutes} mins</p>
                        {event.data?.notes && <p className="mt-1 text-muted-foreground">{event.data.notes}</p>}
                        {event.call_follow_up_date && (
                            <p className="mt-1 text-xs font-medium text-blue-500">
                                Follow-up: {new Date(event.call_follow_up_date).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                )
            case 'note':
                return (
                    <div className="text-sm">
                        {event.data?.content && <p>{event.data.content}</p>}
                        {event.data?.notes && <p>{event.data.notes}</p>}
                    </div>
                )
            // Add other cases as needed
            default:
                return event.data ? (
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-20">
                        {JSON.stringify(event.data, null, 2)}
                    </pre>
                ) : null
        }
    }

    return (
        <div className="flex gap-4 pb-8 relative last:pb-0 group">
            {/* Line connecting items */}
            <div className="absolute left-[19px] top-8 bottom-0 w-px bg-white/10 last:hidden" />

            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/50 shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:border-white/20 transition-colors">
                {getIcon()}
            </div>

            <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white group-hover:text-primary transition-colors">{getTitle()}</h4>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </span>
                </div>
                <div className="text-muted-foreground group-hover:text-white/80 transition-colors">
                    {renderContent()}
                </div>
            </div>
        </div>
    )
}

import { createClient } from "@/lib/supabase/client"
import { TimelineEvent } from "@/types"
import { useState, useEffect } from "react"

export function useTimeline(customerId: string) {
    const [events, setEvents] = useState<TimelineEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        if (!customerId) return

        fetchEvents()

        // Subscribe to real-time changes
        const channel = supabase
            .channel('timeline_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'customer_timeline',
                    filter: `customer_id=eq.${customerId}`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setEvents(prev => [payload.new as TimelineEvent, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setEvents(prev => prev.map(e => e.id === payload.new.id ? payload.new as TimelineEvent : e))
                    } else if (payload.eventType === 'DELETE') {
                        setEvents(prev => prev.filter(e => e.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [customerId])

    async function fetchEvents() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from("customer_timeline")
                .select("*")
                .eq("customer_id", customerId)
                .order("created_at", { ascending: false })

            if (error) throw error
            setEvents(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return {
        events,
        loading,
        error,
        refresh: fetchEvents
    }
}

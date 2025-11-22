'use client';

import { createClient } from "@/lib/supabase/client"
import { Call } from "@/types"
import { useState } from "react"

export function useCalls(customerId: string) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    async function logCall(callData: {
        date: string;
        duration_minutes: number;
        outcome: string;
        notes: string;
        follow_up_date?: string;
    }) {
        setLoading(true)
        setError(null)
        try {
            // 1. Insert into calls table
            const { data: call, error: callError } = await supabase
                .from("calls")
                .insert([{
                    customer_id: customerId,
                    date: callData.date,
                    duration_minutes: callData.duration_minutes,
                    outcome: callData.outcome,
                    notes: callData.notes,
                    follow_up_date: callData.follow_up_date
                }])
                .select()
                .single()

            if (callError) throw callError

            // 2. Insert into customer_timeline
            const { error: timelineError } = await supabase
                .from("customer_timeline")
                .insert([{
                    customer_id: customerId,
                    type: 'call',
                    call_duration_minutes: callData.duration_minutes,
                    call_outcome: callData.outcome,
                    call_follow_up_date: callData.follow_up_date,
                    // We store the full note in the timeline data or maybe just use the note_category if applicable
                    // But timeline has 'data' JSONB field, we can put notes there if needed, 
                    // or if there was a 'notes' column in timeline (there isn't, only note_category).
                    // Wait, the schema has `note_category` but no generic `notes` text column for timeline?
                    // Ah, `customer_timeline` has `data` JSONB.
                    // But `calls` has `notes`.
                    // Let's put the notes in `data` for the timeline event so it can be displayed.
                    data: { notes: callData.notes }
                }])

            if (timelineError) throw timelineError

            return call
        } catch (err: any) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    return {
        logCall,
        loading,
        error
    }
}

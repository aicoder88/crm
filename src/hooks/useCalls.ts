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
        follow_up_time?: string;
        email?: string;
        owner_manager_name?: string;
    }) {
        setLoading(true)
        setError(null)
        try {
            // 1. Update customer email and owner name if provided
            if (callData.email !== undefined || callData.owner_manager_name !== undefined) {
                const updates: any = {}
                if (callData.email !== undefined) updates.email = callData.email
                if (callData.owner_manager_name !== undefined) updates.owner_manager_name = callData.owner_manager_name

                const { error: customerError } = await supabase
                    .from("customers")
                    .update(updates)
                    .eq("id", customerId)

                if (customerError) throw customerError
            }

            // 2. Insert into calls table
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

            // 3. Insert into customer_timeline
            const { error: timelineError } = await supabase
                .from("customer_timeline")
                .insert([{
                    customer_id: customerId,
                    type: 'call',
                    call_duration_minutes: callData.duration_minutes,
                    call_outcome: callData.outcome,
                    call_follow_up_date: callData.follow_up_date,
                    data: { notes: callData.notes }
                }])

            if (timelineError) throw timelineError

            // 4. Create a follow-up task if follow_up_date is specified
            if (callData.follow_up_date) {
                // Combine date and time for reminder_time
                let reminderTime = null
                if (callData.follow_up_time) {
                    const [hours, minutes] = callData.follow_up_time.split(':')
                    const reminderDate = new Date(callData.follow_up_date)
                    reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
                    reminderTime = reminderDate.toISOString()
                }

                const { error: taskError } = await supabase
                    .from("tasks")
                    .insert([{
                        customer_id: customerId,
                        type: 'call',
                        title: 'Follow-up call',
                        due_date: new Date(callData.follow_up_date).toISOString(),
                        priority: 'medium',
                        status: 'pending',
                        notes: callData.notes ? `Follow-up from call: ${callData.notes}` : 'Follow-up call scheduled',
                        reminder_time: reminderTime
                    }])

                if (taskError) throw taskError
            }

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

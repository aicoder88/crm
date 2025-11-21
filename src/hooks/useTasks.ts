import { createClient } from "@/lib/supabase/client"
import { Task } from "@/types"
import { useState, useEffect } from "react"

export function useTasks(customerId: string) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        if (!customerId) return
        fetchTasks()
    }, [customerId])

    async function fetchTasks() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .eq("customer_id", customerId)
                .order("due_date", { ascending: true })

            if (error) throw error
            setTasks(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function createTask(task: Omit<Task, "id" | "created_at" | "completed_at" | "customer_id">) {
        try {
            const { data, error } = await supabase
                .from("tasks")
                .insert([{ ...task, customer_id: customerId }])
                .select()
                .single()

            if (error) throw error
            setTasks(prev => [...prev, data].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()))
            return data
        } catch (err: any) {
            throw err
        }
    }

    async function updateTask(id: string, updates: Partial<Task>) {
        try {
            // If marking as completed, set completed_at
            if (updates.status === 'completed' && !updates.completed_at) {
                updates.completed_at = new Date().toISOString()
            } else if (updates.status === 'pending') {
                updates.completed_at = null
            }

            const { data, error } = await supabase
                .from("tasks")
                .update(updates)
                .eq("id", id)
                .select()
                .single()

            if (error) throw error
            setTasks(prev => prev.map(t => t.id === id ? data : t))
            return data
        } catch (err: any) {
            throw err
        }
    }

    async function deleteTask(id: string) {
        try {
            const { error } = await supabase
                .from("tasks")
                .delete()
                .eq("id", id)

            if (error) throw error
            setTasks(prev => prev.filter(t => t.id !== id))
        } catch (err: any) {
            throw err
        }
    }

    return {
        tasks,
        loading,
        error,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask
    }
}

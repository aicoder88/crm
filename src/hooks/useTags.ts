import { createClient } from "@/lib/supabase/client"
import { Tag } from "@/types"
import { useState, useEffect } from "react"

export function useTags() {
    const [tags, setTags] = useState<Tag[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchTags()
    }, [])

    async function fetchTags() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from("tags")
                .select("*")
                .order("name")

            if (error) throw error
            setTags(data || [])
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    async function createTag(name: string, color: string = "#8B5CF6") {
        try {
            const { data, error } = await supabase
                .from("tags")
                .insert([{ name, color }])
                .select()
                .single()

            if (error) throw error
            setTags(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
            return data
        } catch (err: unknown) {
            throw err
        }
    }

    async function updateTag(id: string, updates: Partial<Tag>) {
        try {
            const { data, error } = await supabase
                .from("tags")
                .update(updates)
                .eq("id", id)
                .select()
                .single()

            if (error) throw error
            setTags(prev => prev.map(t => t.id === id ? data : t))
            return data
        } catch (err: unknown) {
            throw err
        }
    }

    async function deleteTag(id: string) {
        try {
            const { error } = await supabase
                .from("tags")
                .delete()
                .eq("id", id)

            if (error) throw error
            setTags(prev => prev.filter(t => t.id !== id))
        } catch (err: unknown) {
            throw err
        }
    }

    return {
        tags,
        loading,
        error,
        fetchTags,
        createTag,
        updateTag,
        deleteTag
    }
}

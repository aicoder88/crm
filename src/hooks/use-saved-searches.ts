"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { SavedSearch, CustomerFilters } from "@/types"

export function useSavedSearches() {
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const supabase = createClient()

    // Fetch saved searches
    const fetchSavedSearches = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from("saved_searches")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw error
            setSavedSearches(data || [])
        } catch (err) {
            setError(err as Error)
            console.error("Error fetching saved searches:", err)
        } finally {
            setLoading(false)
        }
    }

    // Create a new saved search
    const createSavedSearch = async (name: string, filters: CustomerFilters) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("User not authenticated")

            const { data, error } = await supabase
                .from("saved_searches")
                .insert({
                    user_id: user.id,
                    name,
                    filters,
                })
                .select()
                .single()

            if (error) throw error
            setSavedSearches((prev) => [data, ...prev])
            return data
        } catch (err) {
            console.error("Error creating saved search:", err)
            throw err
        }
    }

    // Delete a saved search
    const deleteSavedSearch = async (id: string) => {
        try {
            const { error } = await supabase
                .from("saved_searches")
                .delete()
                .eq("id", id)

            if (error) throw error
            setSavedSearches((prev) => prev.filter((s) => s.id !== id))
        } catch (err) {
            console.error("Error deleting saved search:", err)
            throw err
        }
    }

    // Update a saved search
    const updateSavedSearch = async (id: string, name: string, filters: CustomerFilters) => {
        try {
            const { data, error } = await supabase
                .from("saved_searches")
                .update({ name, filters })
                .eq("id", id)
                .select()
                .single()

            if (error) throw error
            setSavedSearches((prev) =>
                prev.map((s) => (s.id === id ? data : s))
            )
            return data
        } catch (err) {
            console.error("Error updating saved search:", err)
            throw err
        }
    }

    // Load saved searches on mount
    useEffect(() => {
        fetchSavedSearches()

        // Subscribe to changes
        const channel = supabase
            .channel("saved_searches_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "saved_searches",
                },
                () => {
                    fetchSavedSearches()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return {
        savedSearches,
        loading,
        error,
        createSavedSearch,
        deleteSavedSearch,
        updateSavedSearch,
        refetch: fetchSavedSearches,
    }
}

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LogoutPage() {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const logout = async () => {
            await supabase.auth.signOut()
            router.push("/login")
            router.refresh()
        }
        logout()
    }, [router])

    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Logging out...</p>
        </div>
    )
}

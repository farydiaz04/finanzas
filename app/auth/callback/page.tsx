"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallbackPage() {
    const router = useRouter()

    useEffect(() => {
        const handleCallback = async () => {
            const { error } = await supabase.auth.getSession()
            if (error) {
                console.error("Error during auth callback:", error)
                router.push("/auth?error=callback_failed")
            } else {
                router.push("/")
            }
        }
        handleCallback()
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground animate-pulse font-medium">Verificando cuenta...</p>
            </div>
        </div>
    )
}

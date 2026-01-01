"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from "framer-motion"
import { LogIn, UserPlus, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useFinance } from "@/context/finance-context"

export default function AuthPage() {
    const { t } = useFinance()
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [isRegistering, setIsRegistering] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isRegistering) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    }
                })
                if (error) throw error
                setError(t("Auth Account Created Confirm Email"))
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
                router.push("/")
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-background flex flex-col justify-center px-4 py-12 max-w-md mx-auto">
            <header className="absolute top-6 left-4">
                <Link href="/">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="border-none shadow-xl bg-card/50 backdrop-blur-xl">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto bg-primary/10 h-16 w-16 rounded-2xl flex items-center justify-center mb-4">
                            {isRegistering ? <UserPlus className="h-8 w-8 text-primary" /> : <LogIn className="h-8 w-8 text-primary" />}
                        </div>
                        <CardTitle className="text-2xl font-bold">{isRegistering ? t("Login Register") : t("Login Welcome Back")}</CardTitle>
                        <CardDescription>
                            {isRegistering ? t("Auth Join") : t("Auth Login Description")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAuth} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium px-1">{t("Email")}</label>
                                <Input
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="rounded-xl h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium px-1">{t("Password")}</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="rounded-xl h-12"
                                />
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2 p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm"
                                >
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <p>{error}</p>
                                </motion.div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl text-md font-semibold mt-4 shadow-lg shadow-primary/20"
                                disabled={loading}
                            >
                                {loading ? t("Processing") : isRegistering ? t("Register") : t("Enter")}
                            </Button>

                            <div className="text-center mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsRegistering(!isRegistering)}
                                    className="text-sm text-primary hover:underline font-medium"
                                >
                                    {isRegistering ? t("Auth Already Have Account") : t("Auth Need Account")}
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </main>
    )
}

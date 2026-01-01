"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, PieChart, Wallet, Plus, PiggyBank } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFinance } from "@/context/finance-context"

export function SiteFooter() {
    const pathname = usePathname()
    const { t } = useFinance()

    // Don't show footer on /add page
    if (pathname === "/add") return null

    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/80 backdrop-blur-xl pb-safe z-50">
            <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto relative px-1">
                <Link href="/" className={cn("flex flex-col items-center justify-center gap-1 h-full", pathname === "/" ? "text-primary" : "text-muted-foreground")}>
                    <Home className="h-6 w-6" />
                    <span className="text-[10px] font-medium">{t("Home")}</span>
                </Link>

                <Link href="/planner" className={cn("flex flex-col items-center justify-center gap-1 h-full", pathname === "/planner" ? "text-primary" : "text-muted-foreground")}>
                    <Wallet className="h-6 w-6" />
                    <span className="text-[10px] font-medium">{t("Fixed Expenses")}</span>
                </Link>

                {/* Central Add Button */}
                <div className="relative flex justify-center -top-6">
                    <Link href="/add">
                        <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform">
                            <Plus className="h-7 w-7" />
                        </div>
                    </Link>
                </div>

                <Link href="/savings" className={cn("flex flex-col items-center justify-center gap-1 h-full", pathname === "/savings" ? "text-primary" : "text-muted-foreground")}>
                    <PiggyBank className="h-6 w-6" />
                    <span className="text-[10px] font-medium">{t("Savings")}</span>
                </Link>

                <Link href="/analytics" className={cn("flex flex-col items-center justify-center gap-1 h-full", pathname === "/analytics" ? "text-primary" : "text-muted-foreground")}>
                    <PieChart className="h-6 w-6" />
                    <span className="text-[10px] font-medium">{t("Reports")}</span>
                </Link>
            </div>
        </nav>
    )
}

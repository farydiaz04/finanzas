"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import * as Icons from "lucide-react"
import { useFinance } from "@/context/finance-context"
import Link from "next/link"
import { useState } from "react"

export function RecentTransactions() {
    const { transactions, formatMoney, categories, t } = useFinance()
    const [visibleCount, setVisibleCount] = useState(10)

    // Filter State
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    // Helper to get category details
    const getCategory = (catId: string) => {
        return categories.find(c => c.id === catId) || categories[0]
    }

    // Helper to render icon dynamically
    const renderIcon = (iconName: string) => {
        // @ts-ignore
        const Icon = Icons[iconName] || Icons.CircleDollarSign
        return <Icon className="h-5 w-5" />
    }

    // Filter Logic
    const filteredTransactions = transactions.filter(tx => {
        if (!startDate && !endDate) return true
        const txDate = new Date(tx.date)
        const start = startDate ? new Date(startDate) : new Date(0)
        const end = endDate ? new Date(endDate) : new Date(9999, 0, 1)
        // Adjust end date to end of day
        end.setHours(23, 59, 59, 999)
        return txDate >= start && txDate <= end
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (transactions.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8 opacity-60">
                <p>{t("No Transactions Yet")}</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-xl font-bold tracking-tight">{t("Recent Movements")}</h2>
                    {/* Simple Date Filter Toggle could go here if needed, but inputs are better below */}
                </div>

                {/* Date Filter Inputs */}
                <div className="flex items-center gap-2 bg-secondary/30 p-2 rounded-xl">
                    <input
                        type="date"
                        className="bg-transparent text-xs border-none focus:ring-0 p-0 text-muted-foreground"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        onClick={(e) => e.currentTarget.showPicker()}
                        placeholder={t("From")}
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                        type="date"
                        className="bg-transparent text-xs border-none focus:ring-0 p-0 text-muted-foreground"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        onClick={(e) => e.currentTarget.showPicker()}
                        placeholder={t("To")}
                    />
                    {(startDate || endDate) && (
                        <button onClick={() => { setStartDate(""); setEndDate("") }} className="ml-auto text-xs text-blue-500">
                            {t("Clear")}
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {filteredTransactions.slice(0, visibleCount).map((tx) => {
                    const cat = getCategory(tx.category)
                    return (
                        <Link key={tx.id} href={`/transaction/${tx.id}`}>
                            <Card className="border-none shadow-sm bg-secondary/50 mb-3 active:scale-[0.98] transition-all">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("p-2 rounded-full", cat.color)}>
                                            {renderIcon(cat.icon)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{tx.title || cat.name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-muted-foreground capitalize">{cat.name}</p>
                                                <span className="text-[10px] text-muted-foreground/60">•</span>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(tx.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "font-bold text-sm",
                                        tx.type === "income" ? "text-green-600" : "text-foreground"
                                    )}>
                                        {tx.type === "income" ? "+" : "-"}{formatMoney(tx.amount)}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredTransactions.length && (
                <button
                    onClick={() => setVisibleCount(prev => prev + 10)}
                    className="w-full py-3 text-sm text-muted-foreground font-medium hover:text-foreground hover:bg-secondary/50 rounded-xl transition-colors"
                >
                    {t("Load More")}
                </button>
            )}
        </div>
    )
}

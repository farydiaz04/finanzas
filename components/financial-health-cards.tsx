
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useFinance } from "@/context/finance-context"
import * as Icons from "lucide-react"
import { useState } from "react"

export function FinancialHealthCards() {
    const { transactions, savingsTransactions, savingsGoals, fixedExpenses, formatMoney, getSafeToSpend, manualSavingsPool, t } = useFinance()

    // Consolidate Income (Main Income)
    const totalIncome = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0)

    // Consolidate Expenses (Main Expenses)
    // Note: Fixed expenses no longer create transactions, so this naturally excludes them
    const totalVariableExpenses = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0)

    const totalFixedObligation = fixedExpenses.reduce((acc, e) => acc + e.amount, 0)

    // Ratios
    const effectiveIncome = totalIncome || 1
    const fixedRatio = (totalFixedObligation / effectiveIncome) * 100
    const variableRatio = (totalVariableExpenses / effectiveIncome) * 100
    // Saving metric: Manual Pool / Total Income (Goals are now purely informational)
    const totalSavingRate = (manualSavingsPool / effectiveIncome) * 100

    return (
        <section className="space-y-4">
            <h3 className="font-semibold px-1">{t("Financial Health")}</h3>
            <div className="grid grid-cols-2 gap-4">
                <Card className="border-none bg-blue-50 dark:bg-blue-900/20 relative group overflow-visible">
                    <CardContent className="p-4 relative">
                        <div className="absolute top-2 right-2 z-10">
                            <InfoTooltip text={t("Fixed Cost Tooltip")} />
                        </div>

                        <p className="text-xs text-muted-foreground font-medium uppercase mb-1">{t("Total Fixed Expenses Est")}</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {formatMoney(totalFixedObligation)}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                            <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded", fixedRatio > 50 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600")}>
                                {fixedRatio.toFixed(0)}%
                            </span>
                            <span className="text-xs text-muted-foreground">{t("of income")}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-orange-50 dark:bg-orange-900/20 relative group overflow-visible">
                    <CardContent className="p-4 relative">
                        <div className="absolute top-2 right-2 z-10">
                            <InfoTooltip text={t("Variable Expense Tooltip")} />
                        </div>

                        <p className="text-xs text-muted-foreground font-medium uppercase mb-1">{t("Daily Expenses")}</p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {formatMoney(totalVariableExpenses)}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">
                                {variableRatio.toFixed(0)}%
                            </span>
                            <span className="text-xs text-muted-foreground">{t("of income")}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none bg-green-50 dark:bg-green-900/20 relative group overflow-visible">
                <CardContent className="p-4 flex justify-between items-center relative gap-4">
                    <div className="absolute top-2 right-2 z-10">
                        <InfoTooltip text={t("Total Savings Tooltip")} />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase mb-1">{t("Total Savings")}</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {totalSavingRate.toFixed(0)}%
                        </p>
                    </div>
                    <div className="text-right pt-4">
                        <p className="text-sm font-medium opacity-80">{t("Amount Saved")}</p>
                        <p className="font-bold">{formatMoney(manualSavingsPool)}</p>
                    </div>
                </CardContent>
            </Card>
        </section>
    )
}

function InfoTooltip({ text }: { text: string }) {
    const [open, setOpen] = useState(false)
    return (
        <div className="relative">
            <button onClick={() => setOpen(!open)} className="opacity-50 hover:opacity-100 transition-opacity p-1">
                <Icons.HelpCircle className="h-4 w-4" />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-6 w-48 bg-popover text-popover-foreground p-3 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border text-xs z-50 animate-in fade-in zoom-in-95">
                        {text}
                    </div>
                </>
            )}
        </div>
    )
}

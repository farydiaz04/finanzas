"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { useFinance } from "@/context/finance-context"
import { useMemo } from "react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function BalanceCard() {
    const { transactions, formatMoney, fixedExpenses, getSafeToSpend, t, settings } = useFinance()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const { balance, income, expense } = useMemo(() => {
        const currentDate = new Date()
        const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}` // YYYY-MM

        const income = transactions
            .filter(t => t.type === "income")
            .reduce((acc, t) => acc + t.amount, 0)

        const mainExpense = transactions
            .filter(t => t.type === "expense")
            .reduce((acc, t) => acc + t.amount, 0)

        // Paid fixed expenses for THIS month
        const paidFixedThisMonth = fixedExpenses
            .filter(e => e.history?.[currentMonthKey] === "paid")
            .reduce((acc, e) => acc + e.amount, 0)

        const expense = mainExpense + paidFixedThisMonth
        const balance = income - expense

        return {
            balance,
            income,
            expense
        }
    }, [transactions, fixedExpenses])

    const safeToSpend = getSafeToSpend()

    // Month Name
    const locale = settings.language === "es" ? 'es-ES' : 'en-US'
    const monthName = mounted
        ? new Date().toLocaleString(locale, { month: 'long' })
        : ""

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-none shadow-xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-1">
                        <div>
                            <p className="text-primary-foreground/80 text-sm font-medium mb-1">
                                {t("Balance Card")} {mounted && `(${monthName})`}
                            </p>
                            <div className="text-4xl font-bold tracking-tighter">
                                {formatMoney(safeToSpend)}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-primary-foreground/70 text-xs font-medium">{t("Total Balance")}</p>
                            <p className="font-semibold opacity-90">{formatMoney(balance)}</p>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full overflow-hidden backdrop-blur-md">
                            <ArrowDownCircle className="h-4 w-4 text-green-300" />
                            <span className="text-sm font-medium">{formatMoney(income)}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full overflow-hidden backdrop-blur-md">
                            <ArrowUpCircle className="h-4 w-4 text-red-100" />
                            <span className="text-sm font-medium">{formatMoney(expense)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

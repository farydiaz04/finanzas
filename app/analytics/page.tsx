"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { useFinance } from "@/context/finance-context"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, format } from "date-fns"
import { es, enUS } from "date-fns/locale"
import * as Icons from "lucide-react"

export default function AnalyticsPage() {
    const { transactions, savingsTransactions, fixedExpenses, formatMoney, categories, t, settings } = useFinance()
    const [timeRange, setTimeRange] = useState<"week" | "month" | "custom">("month")

    // Custom range state
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

    // Process data
    const { chartData, expenseChartData, incomeChartData, financialHealth, chartCategories } = useMemo(() => {
        let start = new Date()
        let end = new Date()

        if (timeRange === "week") {
            start = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
            end = endOfWeek(new Date(), { weekStartsOn: 1 })
        } else if (timeRange === "month") {
            start = startOfMonth(new Date())
            end = endOfMonth(new Date())
        } else {
            const [sY, sM, sD] = startDate.split('-').map(Number)
            start = new Date(sY, sM - 1, sD, 0, 0, 0)

            const [eY, eM, eD] = endDate.split('-').map(Number)
            end = new Date(eY, eM - 1, eD, 23, 59, 59, 999)
        }

        // Filter transactions for charts
        const filteredTx = transactions.filter(tx => {
            const txDate = new Date(tx.date)
            return isWithinInterval(txDate, { start, end })
        })

        const filteredSavingsTx = savingsTransactions.filter(tx => {
            const txDate = new Date(tx.date)
            return isWithinInterval(txDate, { start, end })
        })

        // Create virtual transactions for paid fixed expenses
        const fixedVirtualTx: any[] = []
        fixedExpenses.forEach(exp => {
            if (exp.paidDates) {
                Object.entries(exp.paidDates).forEach(([mKey, isoDate]) => {
                    const d = new Date(isoDate)
                    if (isWithinInterval(d, { start, end })) {
                        fixedVirtualTx.push({
                            id: `fixed-paid-${exp.id}-${mKey}`,
                            amount: exp.amount,
                            type: "expense",
                            category: "utilities",
                            title: `Pago: ${exp.name}`,
                            date: isoDate
                        })
                    }
                })
            }
        })

        // 1. Calculations for Charts
        const dailyMap: Record<string, { income: number, expense: number, balance: number, cumulativeExpense: number }> = {}
        let loop = new Date(start)

        let runningBalance = 0
        let runningExpense = 0

        // Merge and sort for running balance
        // We exclude savings transactions to focus on the Bank Flow (Real transactions + Fixed expenses)
        const allFiltered = [...filteredTx, ...fixedVirtualTx]
        const sortedTx = allFiltered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        const currentLocale = settings.language === "es" ? es : enUS

        // Initialize dailyMap keys
        const keys: string[] = []
        while (loop <= end) {
            const key = format(loop, "dd MMM", { locale: currentLocale })
            dailyMap[key] = { income: 0, expense: 0, balance: 0, cumulativeExpense: 0 }
            keys.push(key)
            loop.setDate(loop.getDate() + 1)
        }

        // Populate daily amounts
        sortedTx.forEach(tx => {
            const dateKey = format(new Date(tx.date), "dd MMM", { locale: currentLocale })
            if (dailyMap[dateKey]) {
                if (tx.type === "income") dailyMap[dateKey].income += tx.amount
                else dailyMap[dateKey].expense += tx.amount
            }
        })

        // Calculate Cumulative Lines
        const compareData = keys.map(key => {
            const dayData = dailyMap[key]
            runningBalance += (dayData.income - dayData.expense)
            runningExpense += dayData.expense
            return {
                name: key,
                income: dayData.income,
                expense: dayData.expense, // Daily expense for bar chart
                balanceLine: runningBalance,
                expenseLine: runningExpense // Cumulative expense line if requested, or just daily. User said "constante de gastos", maybe meant "Constant" as in "Average"? Or just "Line of expenses".
                // Let's plot Daily Expense as Red Line vs Running Balance as Green Line?
                // "Green line balance, red line expenses".
                // Actually, let's try Cumulative Expenses vs Cumulative Balance.
            }
        })

        // User asked for "Green line balance" and "Red line expenses constant". 
        // "Line of expenses" is likely cumulative if comparing to balance.
        // Or if Balance is just Income - Expense for that day...
        // "Balance" usually implies cumulative. I will go with Cumulative Balance vs Cumulative Expenses.

        // 2. Bar Chart (Expenses Only)
        // Already have expense property in compareData

        // 3. New Income Only Chart
        const incomeData = compareData.map(d => ({ name: d.name, income: d.income }))

        // ... Financial Health Logi ...
        // ... Financial Health Logic ...
        const totalIncome = allFiltered.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0)
        const totalVariableExpenses = allFiltered.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0)
        const totalFixedObligation = fixedExpenses.reduce((acc, e) => acc + e.amount, 0)
        const effectiveIncome = totalIncome || 1
        const fixedRatio = (totalFixedObligation / effectiveIncome) * 100
        const variableRatio = (totalVariableExpenses / effectiveIncome) * 100
        const savingRate = totalIncome > 0 ? (100 - fixedRatio - variableRatio) : 0

        // ... Category Logic ...
        const catMap: Record<string, number> = {}
        filteredTx.filter(t => t.type === "expense").forEach(tx => {
            catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount
        })
        const catData = Object.entries(catMap).map(([catId, amount]) => {
            const category = categories.find(c => c.id === catId)
            return {
                name: category?.name || catId,
                value: amount,
                color: category?.color?.split(" ")[0]?.replace("text-", "").replace("bg-", "") || "#888",
                fill: category?.color && category.color.includes("orange") ? "#f97316" :
                    category?.color && category.color.includes("blue") ? "#3b82f6" :
                        category?.color && category.color.includes("purple") ? "#a855f7" :
                            category?.color && category.color.includes("red") ? "#ef4444" : "#888888"
            }
        }).sort((a, b) => b.value - a.value)


        return {
            chartData: compareData,
            expenseChartData: compareData.map(d => ({ name: d.name, expense: d.expense })),
            incomeChartData: incomeData,
            financialHealth: { fixedRatio, variableRatio, savingRate, totalFixed: totalFixedObligation, totalIncome, totalVariable: totalVariableExpenses },
            chartCategories: catData
        }
    }, [transactions, categories, timeRange, startDate, endDate, fixedExpenses])


    return (
        <main className="min-h-screen pb-24 px-4 pt-6 max-w-md mx-auto space-y-8">
            <header className="px-1 flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">{t("Reports")}</h1>
                <p className="text-muted-foreground text-sm">{t("Financial Health 360")}</p>
            </header>

            {/* Time Filter */}
            <div className="flex bg-secondary p-1 rounded-xl w-full">
                <button
                    onClick={() => setTimeRange("week")}
                    className={cn("flex-1 px-4 py-1.5 text-sm font-medium rounded-lg transition-all", timeRange === "week" ? "bg-background shadow-sm" : "text-muted-foreground")}
                >
                    {t("Weekly")}
                </button>
                <button
                    onClick={() => setTimeRange("month")}
                    className={cn("flex-1 px-4 py-1.5 text-sm font-medium rounded-lg transition-all", timeRange === "month" ? "bg-background shadow-sm" : "text-muted-foreground")}
                >
                    {t("Monthly")}
                </button>
                <button
                    onClick={() => setTimeRange("custom")}
                    className={cn("flex-1 px-4 py-1.5 text-sm font-medium rounded-lg transition-all", timeRange === "custom" ? "bg-background shadow-sm" : "text-muted-foreground")}
                >
                    {t("Custom")}
                </button>
            </div>

            {timeRange === "custom" && (
                <div className="flex gap-2 items-center bg-secondary/30 p-2 rounded-xl border border-border/50">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} onClick={e => e.currentTarget.showPicker()} className="bg-transparent text-foreground text-sm p-1 rounded border-none focus:ring-0" />
                    <span className="text-muted-foreground">-</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} onClick={e => e.currentTarget.showPicker()} className="bg-transparent text-foreground text-sm p-1 rounded border-none focus:ring-0" />
                </div>
            )}

            {/* 1. Comparison Chart (Balance vs Expenses) */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">{t("Balance vs Expenses")}</CardTitle>
                    <p className="text-xs text-muted-foreground">{t("Accumulated Period")}</p>
                </CardHeader>
                <CardContent className="px-4">
                    <div className="flex h-[250px] relative">
                        {/* Fixed Y-Axis */}
                        <div className="w-[80px] h-[250px] shrink-0 pointer-events-none z-10 bg-card/80 backdrop-blur-[2px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 0, left: 5, bottom: 25 }}>
                                    <YAxis
                                        width={75}
                                        stroke="#888888"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => formatMoney(value)}
                                        orientation="left"
                                        domain={['auto', 'auto']}
                                    />
                                    {/* Invisible lines to force domain calculation */}
                                    <Line type="monotone" dataKey="balanceLine" stroke="none" dot={false} isAnimationActive={false} />
                                    <Line type="monotone" dataKey="expenseLine" stroke="none" dot={false} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Scrollable Area */}
                        <div className="flex-1 overflow-x-auto pb-4 scrollbar-hide">
                            <div style={{
                                minWidth: chartData.length > 8 ? `${chartData.length * 50}px` : '100%',
                                height: '100%'
                            }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                        <XAxis
                                            dataKey="name"
                                            stroke="#888888"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            interval={chartData.length > 15 ? 2 : 0}
                                        />
                                        <YAxis hide domain={['auto', 'auto']} />
                                        <Tooltip
                                            contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '16px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', zIndex: 50 }}
                                            formatter={(value: any) => formatMoney(Number(value || 0))}
                                            labelStyle={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}
                                        />
                                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                                        <Line type="monotone" dataKey="balanceLine" name="Balance" stroke="#22c55e" strokeWidth={3} dot={false} isAnimationActive={false} />
                                        <Line type="monotone" dataKey="expenseLine" name={t("Accum. Expenses")} stroke="#ef4444" strokeWidth={3} dot={false} strokeDasharray="5 5" isAnimationActive={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Income Only Chart */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">{t("Income")}</CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                    <div className="flex h-[200px] relative">
                        {/* Fixed Y-Axis */}
                        <div className="w-[80px] h-[200px] shrink-0 pointer-events-none z-10 bg-card/80 backdrop-blur-[2px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={incomeChartData} margin={{ top: 5, right: 0, left: 5, bottom: 25 }}>
                                    <YAxis
                                        width={75}
                                        stroke="#888888"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => formatMoney(value)}
                                        domain={[0, 'auto']}
                                    />
                                    <Bar dataKey="income" fill="none" isAnimationActive={false} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Scrollable Area */}
                        <div className="flex-1 overflow-x-auto pb-4 scrollbar-hide">
                            <div style={{
                                minWidth: incomeChartData.length > 8 ? `${incomeChartData.length * 50}px` : '100%',
                                height: '100%'
                            }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={incomeChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                        <XAxis
                                            dataKey="name"
                                            stroke="#888888"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            interval={incomeChartData.length > 15 ? 2 : 0}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                                            contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '16px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', zIndex: 50 }}
                                            formatter={(value: any) => formatMoney(Number(value || 0))}
                                        />
                                        <Bar dataKey="income" name={t("Income")} fill="#22c55e" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 3. Expenses Only Chart (Bar) */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">{t("Expense Detail")}</CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                    <div className="flex h-[200px] relative">
                        {/* Fixed Y-Axis */}
                        <div className="w-[80px] h-[200px] shrink-0 pointer-events-none z-10 bg-card/80 backdrop-blur-[2px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={expenseChartData} margin={{ top: 5, right: 0, left: 5, bottom: 25 }}>
                                    <YAxis
                                        width={75}
                                        stroke="#888888"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => formatMoney(value)}
                                        domain={[0, 'auto']}
                                    />
                                    <Bar dataKey="expense" fill="none" isAnimationActive={false} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Scrollable Area */}
                        <div className="flex-1 overflow-x-auto pb-4 scrollbar-hide">
                            <div style={{
                                minWidth: expenseChartData.length > 8 ? `${expenseChartData.length * 50}px` : '100%',
                                height: '100%'
                            }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={expenseChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                        <XAxis
                                            dataKey="name"
                                            stroke="#888888"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            interval={expenseChartData.length > 15 ? 2 : 0}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                                            contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '16px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', zIndex: 50 }}
                                            formatter={(value: any) => formatMoney(Number(value || 0))}
                                        />
                                        <Bar dataKey="expense" name={t("Expense")} fill="#ef4444" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}



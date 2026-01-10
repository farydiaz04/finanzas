"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, AlertCircle, Plus, Trash2, X, ChevronLeft, ChevronRight, Edit2 } from "lucide-react"
import { useFinance, FixedExpense } from "@/context/finance-context"
import { motion, AnimatePresence } from "framer-motion"

export default function PlannerPage() {
    const {
        fixedExpenses,
        addFixedExpense,
        updateFixedExpense,
        deleteFixedExpense,
        formatMoney,
        formatNumber,
        parseFormattedNumber,
        t,
        settings
    } = useFinance()
    const [isAdding, setIsAdding] = useState(false)

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null)

    // Date State
    const [currentDate, setCurrentDate] = useState(new Date())

    // Form State
    const [name, setName] = useState("")
    const [amount, setAmount] = useState("")
    const [day, setDay] = useState("")
    const [isSplit, setIsSplit] = useState(false)

    // Derived Date Info
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}` // YYYY-MM
    const monthName = currentDate.toLocaleString(settings.language === "es" ? "es-ES" : "en-US", { month: "long", year: "numeric" })
    const actualDay = new Date().getDate()
    const isCurrentMonth = new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear()

    // Sorter
    const sortedExpenses = [...fixedExpenses].sort((a, b) => a.day - b.day)

    const handleSave = () => {
        if (!name || !amount || !day) return

        if (editingId) {
            updateFixedExpense(editingId, {
                name,
                amount: parseFormattedNumber(amount),
                day: parseInt(day),
                isSplit
            })
            setEditingId(null)
        } else {
            addFixedExpense({
                name,
                amount: parseFormattedNumber(amount),
                day: parseInt(day),
                isSplit
            })
        }

        setIsAdding(false)
        resetForm()
    }

    const resetForm = () => {
        setName("")
        setAmount("")
        setDay("")
        setIsSplit(false)
        setEditingId(null)
    }

    const handleNumericInputChange = (value: string, setter: (v: string) => void) => {
        const numericValue = parseFormattedNumber(value)
        if (value === "") {
            setter("")
        } else {
            setter(formatNumber(numericValue))
        }
    }

    const startEdit = (expense: FixedExpense) => {
        setName(expense.name)
        setAmount(formatNumber(expense.amount))
        setDay(expense.day.toString())
        setIsSplit(expense.isSplit || false)
        setEditingId(expense.id)
        setIsAdding(true)
    }

    const toggleStatus = (id: string, currentStatus: string) => {
        let newStatus = "pending"
        if (currentStatus === "pending" || currentStatus === "late") newStatus = "paid"
        else if (currentStatus === "paid") newStatus = "pending"

        const expense = fixedExpenses.find(e => e.id === id)
        if (expense) {
            const newHistory = { ...expense.history, [monthKey]: newStatus as any }
            const newPaidDates = { ...(expense.paidDates || {}) }

            if (newStatus === "paid") {
                newPaidDates[monthKey] = new Date().toISOString()
            } else {
                delete newPaidDates[monthKey]
            }

            updateFixedExpense(id, {
                history: newHistory,
                paidDates: newPaidDates
            })
        }
    }

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentDate)
        newDate.setMonth(newDate.getMonth() + delta)
        setCurrentDate(newDate)
    }

    const getStatus = (expense: FixedExpense) => expense.history?.[monthKey] || "pending"

    const total = fixedExpenses.reduce((acc, e) => acc + e.amount, 0)
    const remaining = fixedExpenses.filter(e => getStatus(e) !== "paid").reduce((acc, e) => acc + e.amount, 0)

    return (
        <main className="min-h-screen pb-32 px-4 pt-6 max-w-md mx-auto space-y-6">
            <header className="px-1 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t("Fixed Expenses")}</h1>
                    <p className="text-muted-foreground text-sm">
                        {t("Monthly recurring expenses")}
                    </p>
                </div>
                <Button size="icon" className="rounded-full shadow-md" onClick={() => { resetForm(); setIsAdding(!isAdding) }}>
                    <Plus className="h-5 w-5" />
                </Button>
            </header>

            <div className="flex items-center justify-between bg-secondary/50 p-2 rounded-2xl">
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => changeMonth(-1)}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="font-semibold capitalize text-lg">{monthName}</span>
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => changeMonth(1)}>
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="bg-secondary/30 border-none mb-4">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-sm">{editingId ? t("Edit Expense") : t("New Expense")}</h3>
                                    <Button variant="ghost" size="sm" onClick={() => { setIsAdding(false); resetForm(); }}><X className="h-4 w-4" /></Button>
                                </div>
                                <Input placeholder={t("Concept")} value={name} onChange={e => setName(e.target.value)} />
                                <div className="flex gap-3">
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder={t("Amount")}
                                        value={amount}
                                        onChange={e => handleNumericInputChange(e.target.value, setAmount)}
                                    />
                                    <Input type="number" placeholder={t("Day Placeholder")} value={day} onChange={e => setDay(e.target.value)} />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border/50">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold">{t("Split Payment")}</span>
                                        <span className="text-[10px] text-muted-foreground">{t("Split Hint")}</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 accent-primary rounded-md"
                                        checked={isSplit}
                                        onChange={(e) => setIsSplit(e.target.checked)}
                                    />
                                </div>
                                <Button className="w-full rounded-xl" onClick={handleSave}>{editingId ? t("Update") : t("Save")}</Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-4 relative">
                <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-border/50 -z-10" />

                {sortedExpenses.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                        {t("No Fixed Expenses")}
                    </div>
                )}

                {sortedExpenses.map((expense) => {
                    const status = getStatus(expense)
                    const isDueSoon = isCurrentMonth && expense.day >= actualDay && expense.day <= actualDay + 5
                    const isLate = isCurrentMonth && expense.day < actualDay && status !== "paid"

                    return (
                        <div key={expense.id} className="relative overflow-hidden group mb-4">
                            <SwipeableExpenseCard
                                expense={expense}
                                status={status}
                                isLate={isLate}
                                isDueSoon={isDueSoon}
                                formatMoney={formatMoney}
                                onToggle={() => toggleStatus(expense.id, status)}
                                onEdit={() => startEdit(expense)}
                                onDelete={() => deleteFixedExpense(expense.id)}
                                monthKey={monthKey}
                                language={settings.language}
                                t={t}
                            />
                        </div>
                    )
                })}
            </div>

            <Card className="bg-secondary/30 border-none mt-8">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-muted-foreground">{t("Fixed Expenses")} {monthName}</span>
                        <span className="font-bold text-lg">{formatMoney(total)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">{t("Pending Fixed")}</span>
                        <span className={cn("font-bold text-lg", remaining > 0 ? "text-red-500" : "text-green-600")}>
                            {formatMoney(remaining)}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}

function SwipeableExpenseCard({ expense, status, isLate, isDueSoon, formatMoney, onToggle, onEdit, onDelete, monthKey, language, t }: any) {
    const paidDate = expense.paidDates?.[monthKey]
    const formattedPaidDate = paidDate ? new Date(paidDate).toLocaleDateString(language === "es" ? "es-ES" : "en-US") : null

    return (
        <div className="relative h-24 w-full">
            <div className="absolute inset-0 flex items-center justify-end px-6 gap-4 bg-muted/50 rounded-2xl">
                <button onClick={onEdit} className="p-2 bg-blue-100 text-blue-600 rounded-full">
                    <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={onDelete} className="p-2 bg-red-100 text-red-600 rounded-full">
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            <motion.div
                drag="x"
                dragConstraints={{ left: -120, right: 0 }}
                onTap={onToggle}
                className="absolute inset-0 bg-background rounded-2xl flex items-center gap-4 border border-border/50 shadow-sm p-0 z-10 hover:cursor-pointer"
                whileTap={{ cursor: "grabbing" }}
            >
                <div className="p-4 flex items-center gap-4 w-full">
                    <div className={cn(
                        "flex flex-col items-center justify-center h-14 w-14 rounded-2xl border bg-background transition-colors shrink-0",
                        status === "paid" ? "border-green-500/50 text-green-600" :
                            isLate ? "border-red-500/50 text-destructive" :
                                isDueSoon ? "border-yellow-500/50 text-yellow-600" : "border-border text-muted-foreground"
                    )}>
                        <span className="text-[10px] font-medium uppercase leading-none mb-1">{t("Day Label")}</span>
                        <span className="text-lg font-bold leading-none">{expense.day}</span>
                        {expense.isSplit && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                                1/2
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-sm truncate">{expense.name}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    {status === "paid" && (
                                        <>
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                            <span className="text-xs text-green-600 font-medium">{t("Paid")}</span>
                                        </>
                                    )}
                                    {status !== "paid" && isLate && (
                                        <>
                                            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                            <span className="text-xs text-red-500 font-medium">{t("Overdue")}</span>
                                        </>
                                    )}
                                    {status !== "paid" && !isLate && (
                                        <>
                                            <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">{t("Pending")}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <p className={cn("font-bold text-sm", status === "paid" && "opacity-50 line-through")}>
                                -{formatMoney(expense.amount)}
                            </p>
                        </div>
                        {status === "paid" && formattedPaidDate && (
                            <p className="text-[10px] text-green-600/70 font-medium mt-0.5">
                                {t("Paid on")}: {formattedPaidDate}
                            </p>
                        )}
                    </div>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-20">
                    <ChevronLeft className="h-4 w-4" />
                </div>
            </motion.div>
        </div>
    )
}

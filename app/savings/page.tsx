"use client"

import { useState, useMemo } from "react"
import { useFinance, SavingsGoal } from "@/context/finance-context"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Target, CalendarDays, Wallet, X, PiggyBank, Plane, Car, Home, Smartphone, Gamepad2, Gift, GraduationCap, Heart, Music, ShoppingBag, Star, Sun, Umbrella, Edit2, Info, AlertTriangle, Minus, ChevronRight, Check, History, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as Icons from "lucide-react"

export default function SavingsPage() {
    const {
        savingsGoals,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        formatMoney,
        formatNumber,
        parseFormattedNumber,
        transactions,
        fixedExpenses,
        getSafeToSpend,
        addSavingsTransaction,
        deleteSavingsTransaction,
        savingsTransactions,
        manualSavingsPool,
        setManualSavingsPool,
        t,
        settings
    } = useFinance()

    // Recommended Savings (Safe to Spend) - Guideline only
    const recommendedSavings = getSafeToSpend()

    // Global Allocation Logic
    const totalAllocated = useMemo(() => {
        return savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
    }, [savingsGoals])

    const remainingInPool = Math.max(0, manualSavingsPool - totalAllocated)

    // Comparison Logic for Warnings
    const { warningMessage, warningType } = useMemo(() => {
        // Error: Over-allocated (manual pool)
        if (totalAllocated > manualSavingsPool) {
            return {
                warningMessage: t("Savings Over Allocated"),
                warningType: "warning" as const
            }
        }

        // Info: Fully allocated manual pool, but system says there's more potential
        if (totalAllocated >= manualSavingsPool && recommendedSavings > manualSavingsPool) {
            return {
                warningMessage: t("Savings Under Allocated"),
                warningType: "info" as const
            }
        }

        return { warningMessage: null, warningType: null }
    }, [manualSavingsPool, recommendedSavings, totalAllocated])

    // Pool Edit State
    const [isEditingPool, setIsEditingPool] = useState(false)
    const [tempPoolValue, setTempPoolValue] = useState(formatNumber(manualSavingsPool)) // Store formatted string

    // Modal State (Combined Add/Edit)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
    const [goalName, setGoalName] = useState("")
    const [goalTarget, setGoalTarget] = useState("")
    const [goalDeadline, setGoalDeadline] = useState("")
    const [goalIcon, setGoalIcon] = useState("Target")

    // Allocation State
    const [allocationAmounts, setAllocationAmounts] = useState<Record<string, string>>({})
    const [allocationModes, setAllocationModes] = useState<Record<string, "add" | "subtract">>({})
    const [showHistory, setShowHistory] = useState(false)

    // Icons for selection
    const goalIcons = [
        "Target", "PiggyBank", "Plane", "Car", "Home", "Smartphone",
        "Gamepad2", "Gift", "GraduationCap", "Heart", "Music",
        "ShoppingBag", "Star", "Sun", "Umbrella"
    ]

    const handleUpdatePool = () => {
        const val = parseFormattedNumber(tempPoolValue)
        if (!isNaN(val)) {
            setManualSavingsPool(val)
            setIsEditingPool(false)
        }
    }

    const handleNumericInputChange = (value: string, setter: (v: string) => void) => {
        const numericValue = parseFormattedNumber(value)
        if (value === "") {
            setter("")
        } else {
            setter(formatNumber(numericValue))
        }
    }

    const openAddModal = () => {
        setEditingGoalId(null)
        setGoalName("")
        setGoalTarget("")
        setGoalDeadline("")
        setGoalIcon("Target")
        setIsModalOpen(true)
    }

    const openEditModal = (goal: SavingsGoal) => {
        setEditingGoalId(goal.id)
        setGoalName(goal.name)
        setGoalTarget(formatNumber(goal.targetAmount))
        setGoalDeadline(goal.deadline || "")
        setGoalIcon(goal.icon)
        setIsModalOpen(true)
    }

    const handleSaveGoal = () => {
        if (!goalName || !goalTarget) return

        if (editingGoalId) {
            updateSavingsGoal(editingGoalId, {
                name: goalName,
                targetAmount: parseFormattedNumber(goalTarget),
                deadline: goalDeadline || undefined,
                icon: goalIcon
            })
        } else {
            const colors = [
                "bg-blue-100 text-blue-700", "bg-green-100 text-green-700",
                "bg-purple-100 text-purple-700", "bg-pink-100 text-pink-700",
                "bg-orange-100 text-orange-700", "bg-teal-100 text-teal-700"
            ]
            const randomColor = colors[Math.floor(Math.random() * colors.length)]

            addSavingsGoal({
                name: goalName,
                targetAmount: parseFormattedNumber(goalTarget),
                currentAmount: 0,
                deadline: goalDeadline || undefined,
                color: randomColor,
                icon: goalIcon
            })
        }

        setIsModalOpen(false)
    }

    const renderIcon = (iconName: string) => {
        // @ts-ignore
        const Icon = Icons[iconName] || Icons.Target
        return <Icon className="h-5 w-5" />
    }

    const handleAllocate = (goal: SavingsGoal) => {
        const amountStr = allocationAmounts[goal.id]
        const mode = allocationModes[goal.id] || "add"
        if (!amountStr) return

        const amount = parseFormattedNumber(amountStr)
        if (isNaN(amount) || amount <= 0) return

        if (mode === "add") {
            // Check against remaining manual pool
            if (totalAllocated + amount > manualSavingsPool) {
                alert(t("Savings Alert Limit"))
                return
            }

            // 1. Create a savings transaction (expense)
            addSavingsTransaction({
                amount: amount,
                type: "expense",
                category: "savings",
                title: `${t("Savings")}: ${goal.name}`,
                date: new Date().toISOString(),
                linkedGoalId: goal.id
            })

            // 2. Update the goal current amount
            updateSavingsGoal(goal.id, { currentAmount: goal.currentAmount + amount })
        } else {
            // Subtract mode
            if (amount > goal.currentAmount) {
                alert(t("Savings Alert Negative"))
                return
            }

            // 1. Create a refund savings transaction (income)
            addSavingsTransaction({
                amount: amount,
                type: "income",
                category: "savings",
                title: `${t("Withdrawal")}: ${goal.name}`,
                date: new Date().toISOString(),
                linkedGoalId: goal.id
            })

            // 2. Update the goal current amount
            updateSavingsGoal(goal.id, { currentAmount: goal.currentAmount - amount })
        }

        // Clear input
        setAllocationAmounts(prev => ({ ...prev, [goal.id]: "" }))
    }

    return (
        <main className="min-h-screen bg-background pb-32 px-4 pt-6 max-w-md mx-auto space-y-6">
            <header className="px-1">
                <h1 className="text-2xl font-bold tracking-tight">{t("Savings")}</h1>
                <p className="text-muted-foreground text-sm">
                    {t("Goals and accumulated savings")}
                </p>
            </header>

            {/* Monthly Summary */}
            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Wallet className="h-24 w-24 text-primary" />
                </div>
                <div className="relative z-10 space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-primary/80 font-medium text-sm">{t("General Savings Pool")}</p>
                            {!isEditingPool && (
                                <button
                                    className="p-1 text-primary hover:bg-primary/10 rounded-md transition-colors"
                                    onClick={() => {
                                        setTempPoolValue(formatNumber(manualSavingsPool))
                                        setIsEditingPool(true)
                                    }}
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {isEditingPool ? (
                            <div className="flex gap-2 items-center mt-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 font-bold">$</span>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        className="h-10 pl-7 rounded-xl bg-background border-primary/30 text-lg font-bold"
                                        autoFocus
                                        value={tempPoolValue}
                                        onChange={(e) => handleNumericInputChange(e.target.value, setTempPoolValue)}
                                    />
                                </div>
                                <Button size="sm" className="rounded-xl h-10 px-4" onClick={handleUpdatePool}>{t("Save")}</Button>
                            </div>
                        ) : (
                            <div className="text-3xl font-bold text-primary">
                                {formatMoney(manualSavingsPool)}
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-2">
                            <p className="text-[10px] text-muted-foreground font-semibold">
                                {totalAllocated > manualSavingsPool ? (
                                    <span className="text-red-500">{t("Excess")}: {formatMoney(totalAllocated - manualSavingsPool)}</span>
                                ) : (
                                    <span>{t("Free to Allocate")}: {formatMoney(remainingInPool)}</span>
                                )}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                                {t("Total Allocated")}: {formatMoney(totalAllocated)}
                            </p>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-primary/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground font-medium text-[9px] uppercase tracking-wider">{t("Enabled to Save")}</p>
                                <div className="text-sm font-bold text-foreground">
                                    {formatMoney(recommendedSavings)}
                                </div>
                            </div>
                            {warningMessage && (
                                <div className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold max-w-[180px]",
                                    warningType === "warning" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                )}>
                                    {warningType === "warning" ? <AlertTriangle className="h-3 w-3 shrink-0" /> : <Info className="h-3 w-3 shrink-0" />}
                                    <span className="leading-tight">{warningMessage}</span>
                                </div>
                            )}
                        </div>
                        <p className="text-[8px] text-muted-foreground mt-1">{t("Suggestion based on real balance and fixed expenses")}</p>
                    </div>
                </div>
            </div>

            {/* Goals List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{t("My Goals")}</h2>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" onClick={openAddModal}>
                        <Plus className="h-4 w-4 mr-1" /> {t("New")}
                    </Button>
                </div>

                {savingsGoals.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-50 px-8">
                        <PiggyBank className="h-16 w-16 mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground font-medium">{t("No Goals Yet")}</p>
                    </div>
                )}

                <AnimatePresence mode="popLayout">
                    {savingsGoals.map(goal => {
                        const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
                        const isOverFunded = goal.currentAmount >= goal.targetAmount
                        const mode = allocationModes[goal.id] || "add"
                        const amountInput = allocationAmounts[goal.id] || ""
                        const amountVal = parseFormattedNumber(amountInput)

                        // Limit warning for the specific input
                        const isWarning = mode === "add" && !isNaN(amountVal) && (totalAllocated + amountVal > manualSavingsPool)

                        return (
                            <motion.div
                                key={goal.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm space-y-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center shrink-0", goal.color)}>
                                            {renderIcon(goal.icon)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-base leading-tight truncate">{goal.name}</h3>
                                            {goal.deadline && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                    <CalendarDays className="h-3 w-3" />
                                                    <span>{new Date(goal.deadline).toLocaleDateString(settings.language === "es" ? "es-ES" : "en-US")}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                            onClick={() => openEditModal(goal)}
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => deleteSavingsGoal(goal.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className={isOverFunded ? "text-green-600" : ""}>{formatMoney(goal.currentAmount)}</span>
                                        <span className="text-muted-foreground">{formatMoney(goal.targetAmount)}</span>
                                    </div>
                                    <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                                        <motion.div
                                            className={cn("h-full rounded-full", isOverFunded ? "bg-green-500" : "bg-primary")}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>

                                {/* Allocation Input */}
                                <div className="space-y-2 pt-2">
                                    <div className="flex gap-2">
                                        <div className="flex bg-secondary/30 rounded-xl p-0.5 shrink-0">
                                            <button
                                                className={cn(
                                                    "h-9 w-10 rounded-lg transition-all flex items-center justify-center",
                                                    mode === "add" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                                                )}
                                                onClick={() => setAllocationModes(prev => ({ ...prev, [goal.id]: "add" }))}
                                                title={t("Add")}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                            <button
                                                className={cn(
                                                    "h-9 w-10 rounded-lg transition-all flex items-center justify-center",
                                                    mode === "subtract" ? "bg-background shadow-sm text-destructive" : "text-muted-foreground"
                                                )}
                                                onClick={() => setAllocationModes(prev => ({ ...prev, [goal.id]: "subtract" }))}
                                                title={t("Subtract")}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder={t("Amount")}
                                                className={cn(
                                                    "h-10 pl-6 rounded-xl text-sm bg-secondary/30 border-transparent",
                                                    isWarning && "border-red-500 focus-visible:ring-red-500"
                                                )}
                                                value={amountInput}
                                                onChange={(e) => handleNumericInputChange(e.target.value, (v) => setAllocationAmounts(prev => ({ ...prev, [goal.id]: v })))}
                                            />
                                        </div>
                                        <Button
                                            className={cn(
                                                "rounded-xl h-10 px-6 font-bold transition-colors",
                                                mode === "subtract" && "bg-destructive hover:bg-destructive/90"
                                            )}
                                            onClick={() => handleAllocate(goal)}
                                            disabled={!amountInput || isWarning || isNaN(parseFormattedNumber(amountInput))}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {isWarning && (
                                        <p className="text-[10px] text-red-500 font-medium px-1">
                                            ⚠️ {t("Exceeds total available in pool")}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {/* Savings History Toggle */}
            <div className="pt-4">
                <Button
                    variant="outline"
                    className="w-full rounded-2xl h-12 flex items-center justify-between px-6 bg-secondary/20 border-border/40"
                    onClick={() => setShowHistory(!showHistory)}
                >
                    <span className="font-semibold text-sm">{t("Movement History")}</span>
                    <Icons.History className={cn("h-4 w-4 transition-transform", showHistory && "rotate-180")} />
                </Button>

                <AnimatePresence>
                    {showHistory && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-3 pt-4">
                                {savingsTransactions.length === 0 ? (
                                    <p className="text-center py-6 text-muted-foreground text-xs italic">{t("No movements recorded")}.</p>
                                ) : (
                                    savingsTransactions.map(tx => (
                                        <div key={tx.id} className="bg-secondary/20 rounded-2xl p-4 flex items-center justify-between border border-border/30">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-8 w-8 rounded-full flex items-center justify-center",
                                                    tx.type === "expense" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                                                )}>
                                                    {tx.type === "expense" ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm leading-tight">{tx.title}</p>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                                        {new Date(tx.date).toLocaleDateString(settings.language === "es" ? "es-ES" : "en-US")}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={cn(
                                                    "font-bold text-sm",
                                                    tx.type === "income" ? "text-destructive" : "text-primary"
                                                )}>
                                                    {tx.type === "income" ? "-" : "+"}{formatMoney(tx.amount)}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => {
                                                        if (confirm(t("Confirm Delete History"))) {
                                                            deleteSavingsTransaction(tx.id)
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Combined Add/Edit Goal Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-background border border-border rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold">
                                    {editingGoalId ? t("Edit Goal") : t("New Goal")}
                                </h2>
                                <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">{t("Name")}</label>
                                    <Input
                                        placeholder={t("Placeholder Trip")}
                                        value={goalName}
                                        onChange={(e) => setGoalName(e.target.value)}
                                        className="bg-secondary/20 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">{t("Target Amount")}</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder={t("Placeholder 2000")}
                                            value={goalTarget}
                                            onChange={(e) => handleNumericInputChange(e.target.value, setGoalTarget)}
                                            className="pl-7 bg-secondary/20 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">{t("Deadline Optional")}</label>
                                    <Input
                                        type="date"
                                        value={goalDeadline}
                                        onChange={(e) => setGoalDeadline(e.target.value)}
                                        className="bg-secondary/20 rounded-xl"
                                        onClick={e => e.currentTarget.showPicker()}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Icono</label>
                                    <div className="grid grid-cols-5 gap-2 h-24 overflow-y-auto p-1 bg-secondary/10 rounded-xl">
                                        {goalIcons.map((icon) => (
                                            <button
                                                key={icon}
                                                onClick={() => setGoalIcon(icon)}
                                                className={cn(
                                                    "aspect-square rounded-lg flex items-center justify-center transition-all",
                                                    goalIcon === icon ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                                )}
                                            >
                                                {renderIcon(icon)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full rounded-xl font-bold h-11"
                                onClick={handleSaveGoal}
                                disabled={!goalName || !goalTarget}
                            >
                                {editingGoalId ? t("Save Changes") : t("Create Goal")}
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}

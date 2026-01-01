"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Keypad } from "@/components/ui/keypad"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useFinance } from "@/context/finance-context"
import * as Icons from "lucide-react"

export default function EditTransactionPage() {
    const router = useRouter()
    const params = useParams()
    const id = params?.id as string
    const { transactions, updateTransaction, deleteTransaction, categories, formatMoney, formatNumber, parseFormattedNumber, t } = useFinance()

    const [amount, setAmount] = useState("0")
    const [type, setType] = useState<"expense" | "income">("expense")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [date, setDate] = useState("")

    // Filter categories
    const typeCategories = categories.filter(c => c.type === type)

    // Load Transaction
    useEffect(() => {
        if (!id) return
        const tx = transactions.find(t => t.id === id)
        if (tx) {
            setAmount(tx.amount.toString())
            setType(tx.type)
            setSelectedCategory(tx.category)
            setDate(new Date(tx.date).toISOString().split('T')[0])
        } else {
            // Redirect if not found (or wait for load)
            if (transactions.length > 0) router.push("/")
        }
    }, [id, transactions, router])

    // Ensure selection validity when switching types manually
    useEffect(() => {
        if (typeCategories.length > 0 && selectedCategory) {
            const exists = typeCategories.find(c => c.id === selectedCategory)
            if (!exists) setSelectedCategory(typeCategories[0].id)
        } else if (typeCategories.length > 0 && !selectedCategory) {
            setSelectedCategory(typeCategories[0].id)
        }
    }, [type, typeCategories, selectedCategory])

    const handleKeyPress = (key: string) => {
        if (amount === "0" && key !== ".") {
            setAmount(key)
        } else {
            if (key === "." && amount.includes(".")) return
            if (amount.replace(".", "").length >= 7) return
            setAmount((prev) => prev + key)
        }
    }

    const handleDeleteDigit = () => {
        if (amount.length === 1) {
            setAmount("0")
        } else {
            setAmount((prev) => prev.slice(0, -1))
        }
    }

    const handleSave = () => {
        const value = parseFloat(amount)
        if (value <= 0) return

        updateTransaction(id, {
            amount: value,
            type,
            category: selectedCategory,
            date: new Date(date).toISOString()
        })

        router.back()
    }

    const handleDeleteTransaction = () => {
        if (confirm(t("Confirm Delete Transaction"))) {
            deleteTransaction(id)
            router.back()
        }
    }

    // Helper to render icon dynamically
    const renderIcon = (iconName: string) => {
        // @ts-ignore
        const Icon = Icons[iconName] || Icons.CircleDollarSign
        return <Icon className="h-6 w-6" />
    }

    if (!selectedCategory) return null // Loading

    return (
        <motion.main
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="min-h-screen flex flex-col bg-background"
        >
            {/* Header */}
            <header className="px-4 py-4 flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <span className="font-semibold text-lg">{t("Edit")}</span>
                <Button variant="ghost" size="icon" onClick={handleDeleteTransaction} className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-5 w-5" />
                </Button>
            </header>

            {/* Type Toggle */}
            <div className="flex justify-center pb-4">
                <div className="flex bg-secondary p-1 rounded-full">
                    <button
                        onClick={() => setType("expense")}
                        className={cn(
                            "px-6 py-1.5 rounded-full text-sm font-medium transition-all",
                            type === "expense" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                        )}
                    >
                        {t("Expense")}
                    </button>
                    <button
                        onClick={() => setType("income")}
                        className={cn(
                            "px-6 py-1.5 rounded-full text-sm font-medium transition-all",
                            type === "income" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                        )}
                    >
                        {t("Income")}
                    </button>
                </div>
            </div>

            {/* Amount Input */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-2 py-4 px-6">
                <div className="relative w-full text-center">
                    <span className="absolute left-1/4 top-1/2 -translate-y-1/2 text-4xl text-muted-foreground">$</span>
                    <input
                        type="text"
                        inputMode="decimal"
                        className="text-6xl font-bold tracking-tighter tabular-nums bg-transparent border-none text-center focus:ring-0 w-full outline-none pl-16 pr-4"
                        value={amount}
                        onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, '')
                            const num = parseFormattedNumber(val)
                            setAmount(val === '' ? '' : formatNumber(num))
                        }}
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="px-4 pb-4">
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
                    {typeCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "flex flex-col items-center gap-2 min-w-[70px]",
                                selectedCategory === cat.id ? "opacity-100 scale-105" : "opacity-60 scale-100"
                            )}
                        >
                            <div className={cn("h-14 w-14 rounded-full flex items-center justify-center transition-all", cat.color, selectedCategory === cat.id && "ring-2 ring-offset-2 ring-primary")}>
                                {renderIcon(cat.icon)}
                            </div>
                            <span className="text-xs font-medium">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Date Picker */}
            <div className="px-4 pb-4">
                <div className="bg-secondary/50 p-2 rounded-xl">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-transparent border-none text-center font-medium focus:ring-0 text-lg"
                    />
                </div>
            </div>

            {/* Save Action */}
            <div className="bg-secondary/30 rounded-t-3xl p-6 pb-12">
                <Button className="w-full h-14 text-lg rounded-2xl shadow-xl" onClick={handleSave}>
                    {t("Update")}
                </Button>
            </div>
        </motion.main>
    )
}

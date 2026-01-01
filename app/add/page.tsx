"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useFinance } from "@/context/finance-context"
import { motion, AnimatePresence } from "framer-motion"
import * as Icons from "lucide-react"
import { Input } from "@/components/ui/input"

export default function AddTransactionPage() {
    const router = useRouter()
    const {
        fixedExpenses,
        addFixedExpense,
        updateFixedExpense,
        deleteFixedExpense,
        formatMoney,
        formatNumber,
        parseFormattedNumber,
        addTransaction,
        transactions,
        deleteTransaction,
        categories,
        addCategory,
        t,
        settings
    } = useFinance()
    const [type, setType] = useState<"expense" | "income">("expense")

    // Form States
    const [amount, setAmount] = useState("")
    const [title, setTitle] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    // Filter categories by type
    const typeCategories = categories.filter(c => c.type === type)
    const [selectedCategory, setSelectedCategory] = useState("")

    // Category Creation State
    const [isCreatingCategory, setIsCreatingCategory] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState("")
    const [newCategoryIcon, setNewCategoryIcon] = useState("Circle")

    // Curated Icon List
    const iconList = [
        "Utensils", "Bus", "Gamepad2", "HeartPulse", "ShoppingBag", "Zap",
        "Banknote", "Laptop", "Gift", "TrendingUp", "Coffee", "Dumbbell",
        "Plane", "Music", "Book", "Home", "Wifi", "Phone", "Camera", "Car",
        "Bike", "Code", "Cpu", "CreditCard", "DollarSign", "Droplet", "Eye",
        "FileText", "Film", "Flag", "Fuel", "Globe", "GraduationCap", "Hammer",
        "Briefcase", "Key", "Lightbulb", "MapPin", "Mic", "Moon", "Package",
        "Palette", "PiggyBank", "Plug", "Printer", "Rocket", "Scissors",
        "Search", "Server", "Shirt", "Smartphone", "Smile", "Speaker", "Star",
        "Sun", "Tag", "Thermometer", "ThumbsUp", "Ticket", "Trash2", "Truck",
        "Tv", "Umbrella", "User", "Video", "Watch", "Wrench"
    ]

    const handleCreateCategory = () => {
        if (!newCategoryName) return

        // Assign a high-contrast color based on type
        // We'll rotate through a few nice presets or just pick one standard high-contrast
        const colors = type === "expense"
            ? ["bg-pink-100 text-pink-700", "bg-purple-100 text-purple-700", "bg-indigo-100 text-indigo-700", "bg-blue-100 text-blue-700", "bg-teal-100 text-teal-700"]
            : ["bg-green-100 text-green-700", "bg-emerald-100 text-emerald-700", "bg-lime-100 text-lime-700"]

        const randomColor = colors[Math.floor(Math.random() * colors.length)]

        const newCatId = newCategoryName.toLowerCase().replace(/\s+/g, '-') + "-" + Date.now()

        addCategory({
            id: newCatId,
            name: newCategoryName,
            icon: newCategoryIcon,
            color: randomColor,
            type: type
        })

        setSelectedCategory(newCatId)
        setIsCreatingCategory(false)
        setNewCategoryName("")
        setNewCategoryIcon("Circle")
    }

    const handleNumericInputChange = (value: string, setter: (v: string) => void) => {
        const numericValue = parseFormattedNumber(value)
        if (value === "") {
            setter("")
        } else {
            setter(formatNumber(numericValue))
        }
    }

    // Update selected category when type changes or on init
    useEffect(() => {
        if (typeCategories.length > 0) {
            const currentExists = typeCategories.find(c => c.id === selectedCategory)
            if (!currentExists) {
                setSelectedCategory(typeCategories[0].id)
            }
        }
    }, [type, categories, selectedCategory, typeCategories]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = () => {
        const numericAmount = parseFormattedNumber(amount)
        if (!amount || numericAmount <= 0 || !title) return
        if (!selectedCategory) return

        addTransaction({
            amount: numericAmount,
            type,
            category: selectedCategory,
            title,
            date: date + "T12:00:00" // Simple mid-day time
        })

        router.push("/")
    }

    const renderIcon = (iconName: string) => {
        // @ts-ignore
        const Icon = Icons[iconName] || Icons.Circle
        return <Icon className="h-6 w-6" />
    }

    return (
        <main className="min-h-screen bg-background pb-8 relative overflow-hidden">
            {/* Header */}
            <header className="px-4 pt-6 flex items-center justify-between relative z-10">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-lg font-semibold">{t("New Transaction")}</h1>
                <div className="w-10" />
            </header>

            <div className="px-6 mt-6 space-y-6 max-w-md mx-auto relative z-10">

                {/* Type Toggle */}
                <div className="bg-secondary/50 p-1 rounded-2xl flex">
                    <button
                        onClick={() => setType("expense")}
                        className={cn(
                            "flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300",
                            type === "expense" ? "bg-background shadow text-red-500" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {t("Expense")}
                    </button>
                    <button
                        onClick={() => setType("income")}
                        className={cn(
                            "flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300",
                            type === "income" ? "bg-background shadow text-green-500" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {t("Income")}
                    </button>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">{t("Amount")}</label>
                    <div className="relative">
                        <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            className="text-4xl font-bold h-16 pl-12 bg-transparent border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/30"
                            value={amount}
                            onChange={(e) => handleNumericInputChange(e.target.value, setAmount)}
                        />
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">$</span>
                    </div>
                </div>

                {/* Title Input (Required) */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">{t("Concept")} *</label>
                    <Input
                        placeholder={t("Placeholder Concept")}
                        className="bg-secondary/20 border-transparent focus:bg-background focus:border-primary text-lg"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* Date Input */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">{t("Date")}</label>
                    <Input
                        type="date"
                        className="bg-secondary/20 border-transparent focus:bg-background focus:border-primary w-full"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                {/* Categories Grid */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">{t("Category")}</label>
                    <div className="grid grid-cols-4 gap-4">
                        {typeCategories.map((cat) => {
                            const isSelected = selectedCategory === cat.id
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        "aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all p-1",
                                        isSelected ? cn("ring-2 ring-offset-2 ring-primary scale-105", cat.color) : "bg-secondary/30 hover:bg-secondary/60 text-muted-foreground"
                                    )}
                                >
                                    <div className={cn(!isSelected && "opacity-70")}>
                                        {renderIcon(cat.icon)}
                                    </div>
                                    <span className="text-[9px] font-medium truncate w-full px-1 text-center leading-tight">
                                        {cat.name}
                                    </span>
                                </button>
                            )
                        })}

                        {/* Add Category Button */}
                        <button
                            onClick={() => setIsCreatingCategory(true)}
                            className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all p-1 bg-secondary/30 hover:bg-secondary/60 text-muted-foreground border border-dashed border-muted-foreground/30"
                        >
                            <Icons.Plus className="h-6 w-6 opacity-50" />
                            <span className="text-[9px] font-medium truncate w-full px-1 text-center leading-tight">
                                {t("New")}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Spacer */}
                <div className="h-20" />
            </div>

            {/* Create Category Modal */}
            <AnimatePresence>
                {isCreatingCategory && (
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
                                <h2 className="text-lg font-bold">{t("New Category")}</h2>
                                <Button variant="ghost" size="sm" onClick={() => setIsCreatingCategory(false)}>
                                    <Icons.X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <Input
                                    placeholder={t("Category Name")}
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />

                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("Select Icon")}</p>
                                <div className="grid grid-cols-6 gap-2 h-32 overflow-y-auto p-1">
                                    {iconList.map((icon) => (
                                        <button
                                            key={icon}
                                            onClick={() => setNewCategoryIcon(icon)}
                                            className={cn(
                                                "aspect-square rounded-xl flex items-center justify-center transition-all",
                                                newCategoryIcon === icon ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                            )}
                                        >
                                            {renderIcon(icon)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                className="w-full rounded-xl"
                                onClick={handleCreateCategory}
                                disabled={!newCategoryName}
                            >
                                {t("Save Category")}
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Save Button */}
            <div className="fixed bottom-6 left-0 right-0 px-6 z-20">
                <Button
                    className="w-full h-14 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={!amount || !title || !selectedCategory}
                >
                    {t("Save")}
                </Button>
            </div>
        </main >
    )
}

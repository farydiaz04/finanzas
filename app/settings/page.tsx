"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useFinance, Category } from "@/context/finance-context"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Input } from "@/components/ui/input"
import * as Icons from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function SettingsPage() {
    const router = useRouter()
    const { settings, updateSettings, categories, addCategory, deleteCategory, user, signOut, t } = useFinance()
    const { setTheme, theme } = useTheme()

    // State for navigation within settings
    const [activeSection, setActiveSection] = useState<string | null>(null)

    // Category Creation State
    const [isAddingCat, setIsAddingCat] = useState(false)
    const [newCatName, setNewCatName] = useState("")
    const [newCatType, setNewCatType] = useState<"expense" | "income">("expense")
    const [newCatIcon, setNewCatIcon] = useState("Circle")
    const [newCatColor, setNewCatColor] = useState("bg-gray-100 text-gray-600")

    const currencies = ["USD", "EUR", "COP", "MXN"]
    const languages = [{ code: "es", label: "Español" }, { code: "en", label: "English" }]

    const renderIcon = (iconName: string, className = "h-5 w-5") => {
        // @ts-ignore
        const Icon = Icons[iconName] || Icons.Circle
        return <Icon className={className} />
    }

    const handleAddCategory = () => {
        if (!newCatName) return
        addCategory({
            id: crypto.randomUUID(),
            name: newCatName,
            type: newCatType,
            icon: newCatIcon,
            color: newCatColor
        })
        setIsAddingCat(false)
        setNewCatName("")
        setNewCatType("expense")
    }

    const sections = [
        { id: "general", title: t("General"), icon: <Icons.Settings2 className="h-5 w-5" />, color: "bg-blue-500" },
        { id: "appearance", title: t("Appearance"), icon: <Sun className="h-5 w-5" />, color: "bg-orange-500" },
        { id: "categories", title: t("Categories"), icon: <Icons.LayoutGrid className="h-5 w-5" />, color: "bg-purple-500" },
        { id: "account", title: t("Account Settings"), icon: <Icons.User className="h-5 w-5" />, color: "bg-green-500" },
    ]

    return (
        <main className="min-h-screen bg-background pb-24 px-4 pt-6 max-w-md mx-auto space-y-6">
            <header className="px-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => activeSection ? setActiveSection(null) : router.push("/")} className="-ml-2">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {activeSection ? sections.find(s => s.id === activeSection)?.title : t("Settings")}
                    </h1>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {!activeSection ? (
                    <motion.div
                        key="menu"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* Profile Header */}
                        <section className="bg-secondary/30 rounded-3xl p-6 border border-border/40 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <Icons.User className="h-8 w-8" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-bold truncate">{settings.userName || t("User")}</h2>
                                    <p className="text-xs text-muted-foreground truncate">{user?.email || t("Guest")}</p>
                                </div>
                            </div>
                        </section>

                        {/* Category Buttons */}
                        <nav className="grid grid-cols-1 gap-3">
                            {sections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className="flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/50 rounded-2xl border border-border/40 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-xl text-white shadow-sm", section.color)}>
                                            {section.icon}
                                        </div>
                                        <span className="font-semibold text-sm">{section.title}</span>
                                    </div>
                                    <Icons.ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </button>
                            ))}
                        </nav>
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        {activeSection === "general" && (
                            <div className="bg-secondary/30 rounded-3xl p-4 space-y-6 border border-border/40">
                                <div className="space-y-2 px-1">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("Username")}</label>
                                    <Input
                                        value={settings.userName || ""}
                                        onChange={e => updateSettings({ userName: e.target.value })}
                                        placeholder={t("Username")}
                                        className="bg-background border-none h-12 rounded-2xl shadow-sm"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="font-semibold text-sm">{t("Currency")}</span>
                                        <div className="flex gap-1.5 p-1 bg-background/50 rounded-xl">
                                            {currencies.map(curr => (
                                                <button
                                                    key={curr}
                                                    onClick={() => updateSettings({ currency: curr })}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                                        settings.currency === curr ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-background"
                                                    )}
                                                >
                                                    {curr}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-1">
                                        <span className="font-semibold text-sm">{t("Language")}</span>
                                        <div className="flex gap-1.5 p-1 bg-background/50 rounded-xl">
                                            {languages.map(lang => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => updateSettings({ language: lang.code as "es" | "en" })}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                                        settings.language === lang.code ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-background"
                                                    )}
                                                >
                                                    {lang.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === "appearance" && (
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: "light", label: t("Light"), icon: <Sun className="h-5 w-5" /> },
                                    { id: "dark", label: t("Dark"), icon: <Moon className="h-5 w-5" /> },
                                    { id: "system", label: t("Auto"), icon: <Icons.Monitor className="h-5 w-5" /> }
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => { setTheme(t.id); updateSettings({ theme: t.id as any }) }}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                            settings.theme === t.id ? "border-primary bg-primary/10 text-primary" : "border-border/40 bg-secondary/30"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {t.icon}
                                            <span className="font-semibold text-sm">{t.label}</span>
                                        </div>
                                        {settings.theme === t.id && <Icons.Check className="h-5 w-5" />}
                                    </button>
                                ))}
                            </div>
                        )}

                        {activeSection === "categories" && (
                            <div className="space-y-6">
                                <Button onClick={() => setIsAddingCat(true)} className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-primary/20">
                                    <Plus className="h-5 w-5 mr-2" /> {t("Add Category")}
                                </Button>

                                <AnimatePresence>
                                    {isAddingCat && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="bg-secondary/30 rounded-3xl p-4 space-y-4 border border-border/40">
                                                <div className="flex justify-between items-center px-1">
                                                    <h3 className="font-bold text-sm">{t("New Category")}</h3>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsAddingCat(false)}><X className="h-4 w-4" /></Button>
                                                </div>
                                                <Input placeholder={t("Name")} value={newCatName} onChange={e => setNewCatName(e.target.value)} className="bg-background rounded-xl border-none h-11 shadow-sm" />
                                                <div className="flex gap-2 p-1 bg-background/50 rounded-xl">
                                                    <button onClick={() => setNewCatType("expense")} className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all", newCatType === "expense" ? "bg-red-500 text-white shadow-md" : "hover:bg-background")}>{t("Expense")}</button>
                                                    <button onClick={() => setNewCatType("income")} className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all", newCatType === "income" ? "bg-green-500 text-white shadow-md" : "hover:bg-background")}>{t("Income")}</button>
                                                </div>
                                                <Button className="w-full h-11 rounded-xl font-bold" onClick={handleAddCategory}>{t("Save")}</Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="grid grid-cols-1 gap-3 pb-8">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/40 group">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", cat.color)}>
                                                    {renderIcon(cat.icon)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm leading-tight">{cat.name}</p>
                                                    <p className="text-[10px] uppercase font-bold tracking-wider mt-1 opacity-50">{t(cat.type === "income" ? "Income" : "Expense")}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="opacity-0 group-hover:opacity-100 h-9 w-9 text-destructive rounded-xl transition-opacity"
                                                onClick={() => deleteCategory(cat.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeSection === "account" && (
                            <div className="space-y-4">
                                <div className="bg-secondary/30 rounded-3xl p-6 border border-border/40 space-y-4 shadow-sm">
                                    {user ? (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("Email")}</span>
                                                <span className="text-sm font-semibold">{user.email}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("Status")}</span>
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-[10px] font-bold uppercase">{t("Active Session")}</span>
                                            </div>
                                            <div className="pt-4 border-t border-border/40">
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-12 rounded-2xl font-bold border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20"
                                                    onClick={() => signOut().then(() => router.push("/"))}
                                                >
                                                    <Icons.LogOut className="h-5 w-5 mr-2" /> {t("Sign Out")}
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-4 space-y-4">
                                            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                                                <Icons.Cloud className="h-8 w-8 text-blue-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold">{t("Sync Cloud")}</p>
                                                <p className="text-xs text-muted-foreground leading-relaxed">{t("Auth Login Description")}</p>
                                            </div>
                                            <Button
                                                className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-primary/20 mt-2"
                                                onClick={() => router.push("/auth")}
                                            >
                                                {t("Login Register")}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}

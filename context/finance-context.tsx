"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

// Types
export type TransactionType = "income" | "expense"
export type ExpenseStatus = "paid" | "pending" | "late"

export interface Transaction {
    id: string
    amount: number
    type: TransactionType
    category: string
    title: string // Custom name (Concepto)
    date: string // ISO string
    note?: string
    linkedFixedExpenseId?: string // Link to FixedExpense
    paymentMonth?: string // YYYY-MM
    linkedGoalId?: string // Link to SavingsGoal
}

export interface FixedExpense {
    id: string
    name: string
    amount: number
    day: number // 1-31
    history: Record<string, ExpenseStatus>
    paidDates?: Record<string, string> // key: "YYYY-MM", value: ISO date
}

export interface Category {
    id: string
    name: string
    icon: string // Lucide icon name or emoji
    color: string // Tailwind classes
    type: "income" | "expense"
}

export interface SavingsGoal {
    id: string
    name: string
    targetAmount: number
    currentAmount: number
    deadline?: string // ISO date
    color: string
    icon: string
}

export interface AppSettings {
    currency: string
    language: "es" | "en"
    userName: string
    theme: "light" | "dark" | "system"
}

interface FinanceContextType {
    user: User | null
    signOut: () => Promise<void>
    transactions: Transaction[]
    fixedExpenses: FixedExpense[]
    categories: Category[]
    savingsGoals: SavingsGoal[]
    savingsTransactions: Transaction[]
    settings: AppSettings
    addTransaction: (tx: Omit<Transaction, "id">) => void
    updateTransaction: (id: string, updates: Partial<Transaction>) => void
    deleteTransaction: (id: string) => void
    addFixedExpense: (exp: Omit<FixedExpense, "id" | "history">) => void
    updateFixedExpense: (id: string, updates: Partial<FixedExpense>) => void
    deleteFixedExpense: (id: string) => void
    updateSettings: (updates: Partial<AppSettings>) => void
    addCategory: (cat: Category) => void
    deleteCategory: (id: string) => void
    addSavingsGoal: (goal: Omit<SavingsGoal, "id">) => void
    updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void
    deleteSavingsGoal: (id: string) => void
    addSavingsTransaction: (tx: Omit<Transaction, "id">) => void
    deleteSavingsTransaction: (id: string) => void
    formatMoney: (amount: number) => string
    formatNumber: (amount: number) => string
    parseFormattedNumber: (value: string) => number
    getSafeToSpend: () => number
    manualSavingsPool: number
    setManualSavingsPool: (amount: number) => void
    t: (key: string) => string
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

const defaultCategories: Category[] = [
    { id: "food", name: "Comida", icon: "Utensils", color: "bg-orange-100 text-orange-600", type: "expense" },
    { id: "transport", name: "Transporte", icon: "Bus", color: "bg-blue-100 text-blue-600", type: "expense" },
    { id: "entertainment", name: "Ocio", icon: "Gamepad2", color: "bg-purple-100 text-purple-600", type: "expense" },
    { id: "health", name: "Salud", icon: "HeartPulse", color: "bg-red-100 text-red-600", type: "expense" },
    { id: "shopping", name: "Compras", icon: "ShoppingBag", color: "bg-pink-100 text-pink-600", type: "expense" },
    { id: "utilities", name: "Servicios", icon: "Zap", color: "bg-yellow-100 text-yellow-600", type: "expense" },
    { id: "salary", name: "Salario", icon: "Banknote", color: "bg-green-100 text-green-600", type: "income" },
    { id: "freelance", name: "Freelance", icon: "Laptop", color: "bg-indigo-100 text-indigo-600", type: "income" },
    { id: "gift", name: "Regalo", icon: "Gift", color: "bg-teal-100 text-teal-600", type: "income" },
    { id: "investment", name: "Inversión", icon: "TrendingUp", color: "bg-emerald-100 text-emerald-600", type: "income" },
]

const translations: Record<string, Record<string, string>> = {
    es: {
        "Balance Card": "Disponible Libre",
        "Total Balance": "Saldo Total",
        "Recent Movements": "Movimientos",
        "No Transactions": "No hay transacciones aún.",
        "Load More": "Ver más movimientos",
        "Settings": "Configuración",
        "General": "General",
        "Currency": "Moneda",
        "Language": "Idioma",
        "Username": "Nombre de usuario",
        "Theme": "Tema",
        "Light": "Claro",
        "Dark": "Oscuro",
        "Auto": "Auto",
        "Account": "Cuenta",
        "Active Session": "Sesión activa",
        "Sign Out": "Cerrar sesión",
        "Sync Cloud": "Sincroniza tus datos en la nube",
        "Login Register": "Iniciar sesión / Registrarse",
        "Categories": "Categorías",
        "New": "Nueva",
        "Fixed Expenses": "Fijos",
        "Savings": "Ahorros",
        "Reports": "Reportes",
        "Home": "Inicio",
        "Income": "Ingreso",
        "Expense": "Gasto",
        "Concept": "Concepto",
        "Amount": "Monto",
        "Category": "Categoría",
        "Date": "Fecha",
        "Save": "Guardar",
        "New Transaction": "Nueva Transacción",
        "Save Category": "Crear Categoría",
        "Category Name": "Nombre de la categoría",
        "Select Icon": "Icono",
        "Placeholder Concept": "Ej: Almuerzo, Uber, Freelance...",
        "New Category": "Nueva Categoría",
        "Bank Balance": "Saldo Bancario",
        "Pending Fixed": "Fijos Pendientes",
        "Add Category": "Agregar Categoría",
        "Status": "Estado",
        "User": "Usuario",
        "Guest": "Invitado",
        "Hello": "Hola",
        "Financial Summary": "Resumen financiero",
        "Profile": "Perfil",
        "Appearance": "Apariencia",
        "Account Settings": "Ajustes de Cuenta",
        "Auth Join": "Únete para sincronizar tus finanzas",
        "Auth Login Description": "Ingresa para ver tus datos en todos tus dispositivos",
        "Login Welcome Back": "Bienvenido de nuevo",
        "Auth Account Created Confirm Email": "¡Cuenta creada! Revisa tu email para confirmar.",
        "Email": "Email",
        "Password": "Contraseña",
        "Processing": "Procesando...",
        "Register": "Registrarse",
        "Enter": "Entrar",
        "Auth Already Have Account": "¿Ya tienes cuenta? Entra aquí",
        "Auth Need Account": "¿No tienes cuenta? Regístrate aquí",
        "Savings Over Allocated": "Has distribuido más dinero del que tienes estipulado en tu pozo de ahorro.",
        "Savings Under Allocated": "Tienes más fondos habilitados para ahorrar de lo que has estipulado manualmente.",
        "No Goals Yet": "No tienes metas aún",
        "Savings Alert Limit": "No puedes agregar más fondos de los que tienes estipulados en tu pozo de ahorro general.",
        "Savings Alert Negative": "No puedes restar más de lo que ya tienes ahorrado en esta meta.",
        "Confirm Delete History": "¿Eliminar este registro del historial? (Esto no afectará el saldo de la meta)",
        "Placeholder Trip": "Ej: Viaje a Japón",
        "Deadline Optional": "Fecha Límite (Opcional)",
        "App Description": "Controla tus gastos e ingresos de forma simple.",
        "Monthly recurring expenses": "Gastos recurrentes mensuales",
        "Goals and accumulated savings": "Metas y ahorros acumulados",
        "Day Placeholder": "Día (1-31)",
        "Day Label": "Día",
        "Confirm Delete Transaction": "¿Estás seguro de eliminar esta transacción?",
        "Variable Expense Tooltip": "Gasto Variable son todas las transacciones diarias (Comida, Diversión) que has registrado manualmente.",
        "No Transactions Yet": "No hay transacciones aún.",
        "Weekly": "Semanal",
        "Monthly": "Mensual",
        "Custom": "Personalizado",
        "Balance vs Expenses": "Balance vs Gastos",
        "Accumulated Period": "Acumulado en el periodo",
        "Accum. Expenses": "Gastos Acum.",
        "Expense Detail": "Detalle de Gastos",
        "Financial Health 360": "Salud Financiera 360°",
        "Financial Health": "Salud Financiera",
        "Total Fixed Expenses Est": "Total gastos fijos (Est.)",
        "Daily Expenses": "Gastos diarios",
        "of income": "de ingresos",
        "Total Savings": "Ahorro Total",
        "Amount Saved": "Monto Ahorrado",
        "Fixed Cost Tooltip": "El Costo Fijo incluye obligaciones mensuales recurrentes (Alquiler, Servicios, etc.) configuradas en tu perfil.",
        "Total Savings Tooltip": "Tu Ahorro Total es la suma de todo lo que tienes guardado en el Pozo General (incluyendo metas).",
        "Edit": "Editar",
        "Delete": "Eliminar",
        "Transaction Details": "Detalles de Transacción",
        "Type": "Tipo",
        "Concept Title": "Concepto",
        "Update": "Actualizar",
        "No Fixed Expenses": "No tienes gastos fijos configurados.",
        "Withdrawal": "Retiro",
        "General Savings Pool": "Pozo de Ahorro General",
        "Excess": "Exceso",
        "Free to Allocate": "Libre para repartir",
        "Total Allocated": "Total Repartido",
        "Enabled to Save": "Habilitado para Ahorrar",
        "Suggestion based on real balance and fixed expenses": "Sugerencia basada en saldo real y gastos fijos",
        "My Goals": "Mis Metas",
        "Add": "Sumar",
        "Subtract": "Restar",
        "Exceeds total available in pool": "Excede el total disponible en el pozo",
        "Movement History": "Historial de Movimientos",
        "No movements recorded": "No hay movimientos registrados",
        "Edit Goal": "Editar Meta",
        "New Goal": "Nueva Meta",
        "Name": "Nombre",
        "Target Amount": "Monto Objetivo",
        "Placeholder 2000": "2.000",
        "From": "Desde",
        "To": "Hasta",
        "Clear": "Limpiar",
        "Paid": "Pagado",
        "Overdue": "Vencido",
        "Pending": "Pendiente",
        "Paid on": "Pagado el",
        "Landing Welcome": "Tu bienestar financiero, en un solo lugar.",
        "Landing Subtitle": "Controla tus gastos, planea tu ahorro y visualiza tu futuro de forma inteligente.",
        "Landing Feature Control": "Control Total",
        "Landing Feature Control Desc": "Registra cada movimiento con un toque y mantén tus cuentas claras.",
        "Landing Feature Planner": "Planificador Pro",
        "Landing Feature Planner Desc": "Anticipa tus gastos fijos y nunca más te sorprendas a fin de mes.",
        "Landing Feature Savings": "Metas de Ahorro",
        "Landing Feature Savings Desc": "Crea pozos de ahorro y alcanza tus objetivos paso a paso.",
        "Get Started": "Comenzar gratis",
        "Log In Landing": "Ya tengo cuenta",
    },
    en: {
        "Balance Card": "Available Funds",
        "Total Balance": "Total Balance",
        "Recent Movements": "Recent Movements",
        "No Transactions": "No transactions yet.",
        "Load More": "View more movements",
        "Settings": "Settings",
        "General": "General",
        "Currency": "Currency",
        "Language": "Language",
        "Username": "Username",
        "Theme": "Theme",
        "Light": "Light",
        "Dark": "Dark",
        "Auto": "Auto",
        "Account": "Account",
        "Active Session": "Active session",
        "Sign Out": "Sign Out",
        "Sync Cloud": "Sync your data to the cloud",
        "Login Register": "Login / Register",
        "Categories": "Categories",
        "New": "New",
        "Fixed Expenses": "Fixed Expenses",
        "Savings": "Savings",
        "Reports": "Reports",
        "Home": "Home",
        "Income": "Income",
        "Expense": "Expense",
        "Concept": "Concept",
        "Amount": "Amount",
        "Category": "Category",
        "Date": "Date",
        "Save": "Save",
        "New Transaction": "New Transaction",
        "Save Category": "Create Category",
        "Category Name": "Category Name",
        "Select Icon": "Select Icon",
        "Placeholder Concept": "e.g. Lunch, Uber, Freelance...",
        "New Category": "New Category",
        "Bank Balance": "Bank Balance",
        "Pending Fixed": "Pending Fixed",
        "Add Category": "Add Category",
        "Status": "Status",
        "User": "User",
        "Guest": "Guest",
        "Hello": "Hello",
        "Financial Summary": "Financial Summary",
        "Profile": "Profile",
        "Appearance": "Appearance",
        "Account Settings": "Account Settings",
        "Auth Join": "Join to sync your finances",
        "Auth Login Description": "Login to see your data on all devices",
        "Login Welcome Back": "Welcome back",
        "Auth Account Created Confirm Email": "Account created! Check your email to confirm.",
        "Email": "Email",
        "Password": "Password",
        "Processing": "Processing...",
        "Register": "Register",
        "Enter": "Enter",
        "Auth Already Have Account": "Already have an account? Login here",
        "Auth Need Account": "Don't have an account? Register here",
        "Savings Over Allocated": "You have distributed more money than you have stipulated in your savings pool.",
        "Savings Under Allocated": "You have more funds available for saving than you have manually stipulated.",
        "No Goals Yet": "You don't have any goals yet",
        "Savings Alert Limit": "You cannot add more funds than you have stipulated in your general savings pool.",
        "Savings Alert Negative": "You cannot subtract more than what you already have saved in this goal.",
        "Confirm Delete History": "Delete this record from history? (This will not affect the balance of the goal)",
        "Placeholder Trip": "e.g., Trip to Japan",
        "Deadline Optional": "Deadline (Optional)",
        "App Description": "Control your expenses and income easily.",
        "Monthly recurring expenses": "Monthly recurring expenses",
        "Goals and accumulated savings": "Goals and accumulated savings",
        "Day Placeholder": "Day (1-31)",
        "Day Label": "Day",
        "Confirm Delete Transaction": "Are you sure you want to delete this transaction?",
        "Variable Expense Tooltip": "Variable Expense includes all daily transactions (Food, Fun) that you have registered manually.",
        "No Transactions Yet": "No transactions yet.",
        "Weekly": "Weekly",
        "Monthly": "Monthly",
        "Custom": "Custom",
        "Balance vs Expenses": "Balance vs Expenses",
        "Accumulated Period": "Accumulated in the period",
        "Accum. Expenses": "Accum. Expenses",
        "Expense Detail": "Expense Detail",
        "Financial Health 360": "360° Financial Health",
        "Financial Health": "Financial Health",
        "Total Fixed Expenses Est": "Total Fixed Expenses (Est.)",
        "Daily Expenses": "Daily Expenses",
        "of income": "of income",
        "Total Savings": "Total Savings",
        "Amount Saved": "Amount Saved",
        "Fixed Cost Tooltip": "Fixed Cost includes recurring monthly obligations (Rent, Utilities, etc.) configured in your profile.",
        "Total Savings Tooltip": "Your Total Savings is the sum of everything you have in the General Pool (including goals).",
        "Edit": "Edit",
        "Delete": "Delete",
        "Transaction Details": "Transaction Details",
        "Type": "Type",
        "Concept Title": "Concept",
        "Update": "Update",
        "No Fixed Expenses": "You have no fixed expenses configured.",
        "Withdrawal": "Withdrawal",
        "General Savings Pool": "General Savings Pool",
        "Excess": "Excess",
        "Free to Allocate": "Free to Allocate",
        "Total Allocated": "Total Allocated",
        "Enabled to Save": "Enabled to Save",
        "Suggestion based on real balance and fixed expenses": "Suggestion based on real balance and fixed expenses",
        "My Goals": "My Goals",
        "Add": "Add",
        "Subtract": "Subtract",
        "Exceeds total available in pool": "Exceeds total available in pool",
        "Movement History": "Movement History",
        "No movements recorded": "No movements recorded",
        "Edit Goal": "Edit Goal",
        "New Goal": "New Goal",
        "Name": "Name",
        "Target Amount": "Target Amount",
        "Placeholder 2000": "2,000",
        "From": "From",
        "To": "To",
        "Clear": "Clear",
        "Paid": "Paid",
        "Overdue": "Overdue",
        "Pending": "Pending",
        "Paid on": "Paid on",
        "Landing Welcome": "Your financial wellbeing, in one place.",
        "Landing Subtitle": "Track your expenses, plan your savings, and visualize your future intelligently.",
        "Landing Feature Control": "Total Control",
        "Landing Feature Control Desc": "Record every movement with a tap and keep your accounts clear.",
        "Landing Feature Planner": "Pro Planner",
        "Landing Feature Planner Desc": "Anticipate your fixed expenses and never be surprised at month-end.",
        "Landing Feature Savings": "Savings Goals",
        "Landing Feature Savings Desc": "Create savings pools and reach your objectives step by step.",
        "Get Started": "Get Started Free",
        "Log In Landing": "I already have an account",
    }
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
    const [categories, setCategories] = useState<Category[]>(defaultCategories)
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
    const [savingsTransactions, setSavingsTransactions] = useState<Transaction[]>([])
    const [manualSavingsPool, setManualSavingsPool] = useState<number>(0)
    const [settings, setSettings] = useState<AppSettings>(() => {
        const defaultSettings: AppSettings = { currency: "USD", language: "es", userName: "Usuario", theme: "system" }
        if (typeof window === "undefined") return defaultSettings
        const saved = localStorage.getItem("appSettings")
        if (!saved) return defaultSettings
        try {
            return { ...defaultSettings, ...JSON.parse(saved) }
        } catch {
            return defaultSettings
        }
    })
    const [isLoaded, setIsLoaded] = useState(false)
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) console.error("Error signing out:", error)
        setUser(null)
        setTransactions([])
        setFixedExpenses([])
        setSavingsGoals([])
        setSavingsTransactions([])
        setManualSavingsPool(0)
        setSettings({ currency: "USD", language: "es", userName: "Usuario", theme: "system" })
        localStorage.removeItem("finance-app-data")
    }

    useEffect(() => {
        const savedData = localStorage.getItem("finance-app-data")
        if (savedData) {
            const parsed = JSON.parse(savedData)
            if (parsed.transactions) setTransactions(parsed.transactions)
            if (parsed.fixedExpenses) setFixedExpenses(parsed.fixedExpenses)
            if (parsed.categories) setCategories(parsed.categories)
            if (parsed.savingsGoals) setSavingsGoals(parsed.savingsGoals)
            if (parsed.savingsTransactions) setSavingsTransactions(parsed.savingsTransactions)
            if (parsed.manualSavingsPool !== undefined) setManualSavingsPool(parsed.manualSavingsPool)
            if (parsed.settings) setSettings(prev => ({ ...prev, ...parsed.settings }))
        }
        setIsLoaded(true)
    }, [])

    useEffect(() => {
        if (!user) return

        const fetchData = async () => {
            const { data: txs } = await supabase.from('transactions').select('*').order('date', { ascending: false })
            if (txs) {
                setTransactions(txs.map((t: any) => ({
                    id: t.id,
                    amount: Number(t.amount),
                    type: t.type,
                    category: t.category,
                    title: t.title,
                    date: t.date,
                    note: t.note,
                    linkedFixedExpenseId: t.linked_fixed_expense_id,
                    paymentMonth: t.payment_month,
                    linkedGoalId: t.linked_goal_id
                })))
            }

            const { data: fe } = await supabase.from('fixed_expenses').select('*')
            if (fe) {
                setFixedExpenses(fe.map((e: any) => ({
                    id: e.id,
                    name: e.name,
                    amount: Number(e.amount),
                    day: e.day,
                    history: e.history || {},
                    paidDates: e.paid_dates || {}
                })))
            }

            const { data: goals } = await supabase.from('savings_goals').select('*')
            if (goals) {
                setSavingsGoals(goals.map((g: any) => ({
                    id: g.id,
                    name: g.name,
                    targetAmount: Number(g.target_amount),
                    currentAmount: Number(g.current_amount),
                    deadline: g.deadline,
                    color: g.color,
                    icon: g.icon
                })))
            }

            const { data: stx } = await supabase.from('savings_transactions').select('*').order('date', { ascending: false })
            if (stx) {
                setSavingsTransactions(stx.map((t: any) => ({
                    id: t.id,
                    amount: Number(t.amount),
                    type: t.type,
                    category: t.category,
                    title: t.title,
                    date: t.date,
                    linkedGoalId: t.linked_goal_id
                })))
            }

            const { data: meta } = await supabase.from('user_settings').select('*').single()
            if (meta) {
                setSettings(prev => ({
                    ...prev,
                    currency: meta.currency,
                    language: meta.language,
                    userName: meta.user_name,
                    theme: meta.theme || "system"
                }))
                setManualSavingsPool(Number(meta.manual_savings_pool))
            }
        }

        fetchData()
    }, [user])

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("finance-app-data", JSON.stringify({
                transactions,
                fixedExpenses,
                categories,
                savingsGoals,
                savingsTransactions,
                manualSavingsPool,
                settings
            }))
        }
    }, [transactions, fixedExpenses, categories, savingsGoals, manualSavingsPool, settings, isLoaded])

    const generateId = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID()
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0
            const v = c === 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
        })
    }

    const syncSettings = async (newSettings: AppSettings, newPool: number) => {
        if (!user) return
        await supabase.from('user_settings').upsert({
            user_id: user.id,
            currency: newSettings.currency,
            language: newSettings.language,
            user_name: newSettings.userName,
            theme: newSettings.theme,
            manual_savings_pool: newPool,
            updated_at: new Date().toISOString()
        })
    }

    const addTransaction = async (tx: Omit<Transaction, "id">) => {
        const id = generateId()
        const newTx = { ...tx, id }
        setTransactions(prev => [newTx, ...prev])
        if (user) {
            await supabase.from('transactions').insert({
                id: newTx.id,
                user_id: user.id,
                amount: newTx.amount,
                type: newTx.type,
                category: newTx.category,
                title: newTx.title,
                date: newTx.date,
                note: newTx.note,
                linked_fixed_expense_id: newTx.linkedFixedExpenseId,
                payment_month: newTx.paymentMonth,
                linked_goal_id: newTx.linkedGoalId
            })
        }
    }

    const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
        if (user) {
            const dbUpdates: any = {}
            if (updates.amount !== undefined) dbUpdates.amount = updates.amount
            if (updates.type !== undefined) dbUpdates.type = updates.type
            if (updates.category !== undefined) dbUpdates.category = updates.category
            if (updates.title !== undefined) dbUpdates.title = updates.title
            if (updates.date !== undefined) dbUpdates.date = updates.date
            if (updates.note !== undefined) dbUpdates.note = updates.note
            if (updates.linkedFixedExpenseId !== undefined) dbUpdates.linked_fixed_expense_id = updates.linkedFixedExpenseId
            if (updates.paymentMonth !== undefined) dbUpdates.payment_month = updates.paymentMonth
            if (updates.linkedGoalId !== undefined) dbUpdates.linked_goal_id = updates.linkedGoalId

            await supabase.from('transactions').update(dbUpdates).eq('id', id)
        }
    }

    const deleteTransaction = async (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id))
        if (user) {
            await supabase.from('transactions').delete().eq('id', id)
        }
    }

    const addFixedExpense = async (exp: Omit<FixedExpense, "id" | "history">) => {
        const id = generateId()
        const newExp = { ...exp, id, history: {} }
        setFixedExpenses(prev => [...prev, newExp])
        if (user) {
            await supabase.from('fixed_expenses').insert({
                id: newExp.id,
                user_id: user.id,
                name: newExp.name,
                amount: newExp.amount,
                day: newExp.day,
                history: newExp.history,
                paid_dates: newExp.paidDates || {}
            })
        }
    }

    const updateFixedExpense = async (id: string, updates: Partial<FixedExpense>) => {
        setFixedExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
        if (user) {
            const dbUpdates: any = {}
            if (updates.name !== undefined) dbUpdates.name = updates.name
            if (updates.amount !== undefined) dbUpdates.amount = updates.amount
            if (updates.day !== undefined) dbUpdates.day = updates.day
            if (updates.history !== undefined) dbUpdates.history = updates.history
            if (updates.paidDates !== undefined) dbUpdates.paid_dates = updates.paidDates

            await supabase.from('fixed_expenses').update(dbUpdates).eq('id', id)
        }
    }

    const deleteFixedExpense = async (id: string) => {
        setFixedExpenses(prev => prev.filter(e => e.id !== id))
        if (user) {
            await supabase.from('fixed_expenses').delete().eq('id', id)
        }
    }

    const updateSettings = (updates: Partial<AppSettings>) => {
        const newSettings = { ...settings, ...updates }
        setSettings(newSettings)
        syncSettings(newSettings, manualSavingsPool)
    }

    const addCategory = (cat: Category) => {
        setCategories(prev => [...prev, cat])
    }

    const deleteCategory = (id: string) => {
        setCategories(prev => prev.filter(c => c.id !== id))
    }

    const addSavingsGoal = async (goal: Omit<SavingsGoal, "id">) => {
        const id = generateId()
        const newGoal = { ...goal, id }
        setSavingsGoals(prev => [...prev, newGoal])
        if (user) {
            await supabase.from('savings_goals').insert({
                id: newGoal.id,
                user_id: user.id,
                name: newGoal.name,
                target_amount: newGoal.targetAmount,
                current_amount: newGoal.currentAmount,
                deadline: newGoal.deadline,
                color: newGoal.color,
                icon: newGoal.icon
            })
        }
    }

    const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
        setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g))
        if (user) {
            const dbUpdates: any = {}
            if (updates.name !== undefined) dbUpdates.name = updates.name
            if (updates.targetAmount !== undefined) dbUpdates.target_amount = updates.targetAmount
            if (updates.currentAmount !== undefined) dbUpdates.current_amount = updates.currentAmount
            if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline
            if (updates.color !== undefined) dbUpdates.color = updates.color
            if (updates.icon !== undefined) dbUpdates.icon = updates.icon

            await supabase.from('savings_goals').update(dbUpdates).eq('id', id)
        }
    }

    const deleteSavingsGoal = async (id: string) => {
        setSavingsGoals(prev => prev.filter(g => g.id !== id))
        if (user) {
            await supabase.from('savings_goals').delete().eq('id', id)
        }
    }

    const addSavingsTransaction = async (tx: Omit<Transaction, "id">) => {
        const id = generateId()
        const newTx = { ...tx, id }
        setSavingsTransactions(prev => [newTx, ...prev])
        if (user) {
            await supabase.from('savings_transactions').insert({
                id: newTx.id,
                user_id: user.id,
                amount: newTx.amount,
                type: newTx.type,
                category: newTx.category,
                title: newTx.title,
                date: newTx.date,
                linked_goal_id: newTx.linkedGoalId
            })
        }
    }

    const deleteSavingsTransaction = async (id: string) => {
        setSavingsTransactions(prev => prev.filter(t => t.id !== id))
        if (user) {
            await supabase.from('savings_transactions').delete().eq('id', id)
        }
    }

    const updateManualSavingsPool = (amount: number) => {
        setManualSavingsPool(amount)
        syncSettings(settings, amount)
    }

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat(settings.language === "es" ? "es-CO" : "en-US", {
            style: "currency",
            currency: settings.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const formatNumber = (amount: number) => {
        return new Intl.NumberFormat(settings.language === "es" ? "es-CO" : "en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const parseFormattedNumber = (value: string) => {
        const cleanValue = value.replace(/[^\d]/g, "")
        return parseFloat(cleanValue) || 0
    }

    const getSafeToSpend = () => {
        const currentDate = new Date()
        const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

        const income = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0)
        const mainExpense = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0)

        const paidFixedThisMonth = fixedExpenses
            .filter(e => e.history?.[currentMonthKey] === "paid")
            .reduce((acc, e) => acc + e.amount, 0)

        const bankBalance = income - mainExpense - paidFixedThisMonth

        const pendingFixed = fixedExpenses
            .filter(e => {
                const status = e.history?.[currentMonthKey] || "pending"
                return status === "pending" || status === "late"
            })
            .reduce((acc, e) => acc + e.amount, 0)

        return bankBalance - pendingFixed - manualSavingsPool
    }

    const t = (key: string) => {
        return translations[settings.language]?.[key] || key
    }

    return (
        <FinanceContext.Provider value={{
            transactions,
            fixedExpenses,
            categories,
            savingsGoals,
            savingsTransactions,
            settings,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            addFixedExpense,
            updateFixedExpense,
            deleteFixedExpense,
            updateSettings,
            addCategory,
            deleteCategory,
            addSavingsGoal,
            updateSavingsGoal,
            deleteSavingsGoal,
            addSavingsTransaction,
            deleteSavingsTransaction,
            formatMoney,
            formatNumber,
            parseFormattedNumber,
            getSafeToSpend,
            manualSavingsPool,
            setManualSavingsPool: updateManualSavingsPool,
            user,
            signOut,
            t
        }}>
            {children}
        </FinanceContext.Provider>
    )
}

export function useFinance() {
    const context = useContext(FinanceContext)
    if (context === undefined) {
        throw new Error("useFinance must be used within a FinanceProvider")
    }
    return context
}

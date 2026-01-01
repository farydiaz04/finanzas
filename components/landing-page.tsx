"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useFinance } from "@/context/finance-context"
import { Wallet, Target, PieChart, BarChart3, ChevronRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function LandingPage() {
    const { t } = useFinance()

    const features = [
        {
            icon: <PieChart className="h-6 w-6 text-blue-500" />,
            title: t("Landing Feature Control"),
            description: t("Landing Feature Control Desc")
        },
        {
            icon: <BarChart3 className="h-6 w-6 text-purple-500" />,
            title: t("Landing Feature Planner"),
            description: t("Landing Feature Planner Desc")
        },
        {
            icon: <Target className="h-6 w-6 text-green-500" />,
            title: t("Landing Feature Savings"),
            description: t("Landing Feature Savings Desc")
        }
    ]

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 max-w-md mx-auto relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-purple-500/5 rounded-full blur-[80px]" />

            {/* Hero Section */}
            <header className="text-center space-y-6 pt-12 pb-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto w-20 h-20 bg-primary/10 rounded-[28%] flex items-center justify-center shadow-inner"
                >
                    <Wallet className="h-10 w-10 text-primary" />
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="space-y-4 px-2"
                >
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Pocket Finance
                    </h1>
                    <p className="text-xl font-medium leading-tight">
                        {t("Landing Welcome")}
                    </p>
                    <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
                        {t("Landing Subtitle")}
                    </p>
                </motion.div>
            </header>

            {/* Features List */}
            <section className="w-full space-y-4 mb-12">
                {features.map((feature, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
                        className="flex items-start gap-4 p-4 rounded-3xl bg-secondary/30 border border-border/40 backdrop-blur-sm"
                    >
                        <div className="p-3 bg-background rounded-2xl shadow-sm border border-border/20">
                            {feature.icon}
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-sm">{feature.title}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </section>

            {/* Actions */}
            <footer className="w-full space-y-4 mt-auto pb-12">
                <Link href="/auth">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group">
                            {t("Get Started")}
                            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </motion.div>
                </Link>

                <Link href="/auth">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button variant="ghost" className="w-full h-12 rounded-2xl font-semibold opacity-80 hover:opacity-100">
                            {t("Log In Landing")}
                        </Button>
                    </motion.div>
                </Link>

                <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-widest pt-4">
                    <Sparkles className="h-3 w-3" />
                    Premium Financial Experience
                </div>
            </footer>
        </div>
    )
}

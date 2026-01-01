"use client";

import { BalanceCard } from "@/components/balance-card";
import { RecentTransactions } from "@/components/recent-transactions";
import { FinancialHealthCards } from "@/components/financial-health-cards";
import { useFinance } from "../context/finance-context"; // Force refresh v1
import { LandingPage } from "@/components/landing-page";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { settings, user, t } = useFinance();

  if (!user) {
    return <LandingPage />;
  }

  return (
    <main className="min-h-screen pb-24 px-4 pt-6 max-w-md mx-auto space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("Hello")}, {settings.userName}</h1>
          <p className="text-muted-foreground text-sm">{t("Financial Summary")}</p>
        </div>
        <Link href="/settings">
          <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center text-sm font-semibold hover:bg-secondary/80 transition-colors cursor-pointer">
            <Settings className="h-5 w-5 text-foreground" />
          </div>
        </Link>
      </header>

      {/* Main Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <BalanceCard />
      </motion.div>

      {/* Financial Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <FinancialHealthCards />
      </motion.div>

      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <RecentTransactions />
      </motion.div>


    </main>
  );
}

"use client"

import { useFinance } from "@/context/finance-context";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeSync() {
    const { settings } = useFinance();
    const { setTheme } = useTheme();

    useEffect(() => {
        if (settings.theme) {
            setTheme(settings.theme);
        }
    }, [settings.theme, setTheme]);

    return null;
}

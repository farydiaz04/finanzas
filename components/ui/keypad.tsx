"use client"

import { Button } from "@/components/ui/button"
import { Delete } from "lucide-react"
import { motion } from "framer-motion"

interface KeypadProps {
    onKeyPress: (key: string) => void
    onDelete: () => void
    onConfirm: () => void
}

export function Keypad({ onKeyPress, onDelete, onConfirm }: KeypadProps) {
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"]

    return (
        <div className="grid grid-cols-3 gap-3 p-4">
            {keys.map((key) => (
                <Button
                    key={key}
                    variant="ghost"
                    className="h-16 w-full text-2xl font-normal rounded-2xl bg-secondary/50 hover:bg-secondary active:scale-95 transition-all"
                    onClick={() => onKeyPress(key)}
                >
                    {key}
                </Button>
            ))}
            <Button
                variant="ghost"
                className="h-16 w-full rounded-2xl bg-secondary/50 hover:bg-secondary/80 text-destructive active:scale-95 transition-all"
                onClick={onDelete}
            >
                <Delete className="h-6 w-6" />
            </Button>

            {/* Spacer if needed or just span col for confirm, but usually keypad is just input. Confirm is separate.
          However, usually 0 is centered. So we have . 0 Del
          Wait, I put . 0 Del. That works.
      */}
        </div>
    )
}

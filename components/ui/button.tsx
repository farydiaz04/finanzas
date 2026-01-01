"use client"

import * as React from "react"
// import { Slot } from "@radix-ui/react-slot"
// If I want "asChild", I need Radix Slot. I'll skip "asChild" for now to reduce dependencies or install it.
// Actually, simple buttons are fine. But shadcn uses Slot.
// I'll stick to simple motion.button.
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline:
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-full px-3",
                lg: "h-11 rounded-full px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

// Using generic motion.button wrapper
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        // If we really need asChild we'd need Radix Slot.
        // For now, I'll just render a motion.button.
        // Note: motion.button creates a button element.

        return (
            <motion.button
                whileTap={{ scale: 0.95 }}
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref as any} // Framer motion refs can be tricky with React.forwardRef types
                {...(props as any)}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }

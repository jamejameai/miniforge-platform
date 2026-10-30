import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "default" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 disabled:pointer-events-none disabled:opacity-50 text-sm";
    
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:scale-[0.99]",
      secondary: "bg-[#0F172A] text-white hover:bg-slate-800 shadow-sm",
      outline: "border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#CBD5E1]",
      ghost: "text-[#0F172A] hover:bg-[#F8FAFC]",
      danger: "bg-red-600 text-white hover:bg-red-700",
    };

    const sizes = {
      sm: "h-8 px-2.5 text-xs rounded-lg",
      default: "h-9 px-4 py-2 rounded-xl",
      lg: "h-11 px-6 rounded-xl text-base",
      icon: "h-9 w-9 rounded-xl",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

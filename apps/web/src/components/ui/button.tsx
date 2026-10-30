import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "default" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4146E] disabled:pointer-events-none disabled:opacity-50 text-sm";
    
    const variants = {
      primary: "bg-[#D4146E] text-white hover:bg-[#B80F5E] shadow-sm active:scale-[0.99]",
      secondary: "bg-[#171717] text-white hover:bg-[#262626] shadow-sm",
      outline: "border border-[#E8E8EA] bg-white text-[#171717] hover:bg-[#F7F7F8] hover:border-[#D4D4D8]",
      ghost: "text-[#171717] hover:bg-[#F7F7F8]",
      danger: "bg-red-600 text-white hover:bg-red-700",
    };

    const sizes = {
      sm: "h-8 px-2.5 text-xs rounded-md",
      default: "h-9 px-4 py-2 rounded-md",
      lg: "h-11 px-6 rounded-md text-base",
      icon: "h-9 w-9 rounded-md",
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


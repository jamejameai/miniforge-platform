import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "pink" | "blue" | "secondary" | "outline" | "success" | "warning";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[#0F172A] text-white",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
    pink: "bg-blue-50 text-blue-700 border border-blue-200",
    secondary: "bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0]",
    outline: "text-[#64748B] border border-[#E2E8F0]",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

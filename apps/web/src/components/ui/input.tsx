import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-[#E8E8EA] bg-white px-3 py-1 text-sm text-[#171717] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#777777] focus-visible:outline-none focus-visible:border-[#D4146E] focus-visible:ring-1 focus-visible:ring-[#D4146E] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

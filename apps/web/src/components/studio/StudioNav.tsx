"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  Database,
  Bot,
  ShoppingBag,
  Package,
  GitBranch,
  Palette,
  BarChart3,
  Sparkles,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudioNavProps {
  appId: string;
  appName: string;
  appSlug: string;
}

export function StudioNav({ appId, appName, appSlug }: StudioNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Visual Builder", href: `/studio/${appId}`, icon: Layers },
    { label: "Database Studio", href: `/studio/${appId}/database`, icon: Database },
    { label: "Telegram Bot", href: `/studio/${appId}/bot`, icon: Bot },
    { label: "POS & Checkout", href: `/studio/${appId}/pos`, icon: ShoppingBag },
    { label: "Inventory Ledger", href: `/studio/${appId}/inventory`, icon: Package },
    { label: "Workflow Studio", href: `/studio/${appId}/workflows`, icon: GitBranch },
    { label: "Design System", href: `/studio/${appId}/design`, icon: Palette },
    { label: "Analytics", href: `/studio/${appId}/analytics`, icon: BarChart3 },
    { label: "AI Studio", href: `/studio/${appId}/ai`, icon: Sparkles, highlight: true },
  ];

  return (
    <aside className="w-64 border-r border-[#E8E8EA] bg-[#F7F7F8] flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand & App Selector Header */}
        <div className="p-4 border-b border-[#E8E8EA] bg-white">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#777777] hover:text-[#171717] mb-2.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#171717] text-white flex items-center justify-center font-bold text-xs tracking-wider">
              {appName.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <h2 className="text-sm font-semibold text-[#171717] truncate leading-tight">{appName}</h2>
              <span className="text-[11px] text-[#777777] font-mono">/{appSlug}</span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#777777]">
            Studio Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                  isActive
                    ? "bg-white text-[#D4146E] shadow-sm font-semibold border border-[#E8E8EA]"
                    : "text-[#171717] hover:bg-white/80 hover:text-[#171717]"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-[#D4146E]" : item.highlight ? "text-[#D4146E]" : "text-[#777777]"
                  )}
                />
                <span className="truncate">{item.label}</span>
                {item.highlight && !isActive && (
                  <span className="ml-auto text-[10px] font-semibold bg-[#D4146E]/10 text-[#D4146E] px-1.5 py-0.5 rounded">
                    NEW
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Runtime Quick Links */}
      <div className="p-3 border-t border-[#E8E8EA] bg-white">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#777777] mb-2 px-1">
          Runtime Targets
        </div>
        <div className="space-y-1">
          <Link
            href={`/r/${appSlug}`}
            target="_blank"
            className="flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-[#171717] hover:bg-[#F7F7F8] border border-transparent hover:border-[#E8E8EA] transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Standalone Web
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[#777777]" />
          </Link>
          <Link
            href={`/tg/${appSlug}`}
            target="_blank"
            className="flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-[#171717] hover:bg-[#F7F7F8] border border-transparent hover:border-[#E8E8EA] transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              Telegram Mini App
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[#777777]" />
          </Link>
        </div>
      </div>
    </aside>
  );
}


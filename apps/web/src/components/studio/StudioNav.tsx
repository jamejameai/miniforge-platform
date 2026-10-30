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
    { label: "Visual Canvas", href: `/studio/${appId}`, icon: Layers },
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
    <aside className="w-60 border-r border-[#E2E8F0] bg-white flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand & App Header */}
        <div className="p-4 border-b border-[#E2E8F0]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
              {appName.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <h2 className="text-sm font-bold text-gray-900 truncate leading-tight">{appName}</h2>
              <span className="text-[10px] text-gray-400 font-mono">/{appSlug}</span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-1">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                  isActive
                    ? "bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-2xs"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-blue-600" : "text-gray-400"
                  )}
                />
                <span className="truncate">{item.label}</span>
                {item.highlight && !isActive && (
                  <span className="ml-auto text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.2 rounded-full">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <span>Engine</span>
          <span className="font-mono text-emerald-600 font-bold">Online</span>
        </div>
      </div>
    </aside>
  );
}

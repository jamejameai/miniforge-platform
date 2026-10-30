"use client";

import { ThemeConfig, NavigationConfig } from "@miniforge/app-schema";
import { Palette, Type, Square, Navigation, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ThemeTokensEditorProps {
  theme: ThemeConfig;
  navigation: NavigationConfig;
  onUpdateTheme: (updates: Partial<ThemeConfig>) => void;
  onUpdateNavigation: (updates: Partial<NavigationConfig>) => void;
}

const BRAND_PALETTES = [
  { name: "MiniForge Pink", primary: "#D4146E", dark: "#171717" },
  { name: "Telegram Blue", primary: "#2481CC", dark: "#1C2733" },
  { name: "Emerald SaaS", primary: "#059669", dark: "#064E3B" },
  { name: "Violet Tech", primary: "#7C3AED", dark: "#1E1B4B" },
  { name: "Amber Bistro", primary: "#D97706", dark: "#451A03" },
  { name: "Minimal Dark", primary: "#171717", dark: "#0A0A0A" },
];

export function ThemeTokensEditor({
  theme,
  navigation,
  onUpdateTheme,
  onUpdateNavigation,
}: ThemeTokensEditorProps) {
  return (
    <div className="flex flex-col h-full bg-white select-none">
      <div className="p-3 border-b border-[#E8E8EA] bg-[#F7F7F8]">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#777777]">
          <Palette className="w-3.5 h-3.5 text-[#171717]" />
          <span>Global Design System</span>
        </div>
        <p className="text-[11px] text-[#777777] mt-0.5">
          Changes reflect instantly across all pages and buttons.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* Color Presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#171717]">Preset Color Schemes</label>
          <div className="grid grid-cols-2 gap-2">
            {BRAND_PALETTES.map((pal) => (
              <button
                key={pal.name}
                onClick={() =>
                  onUpdateTheme({
                    primaryColor: pal.primary,
                    primaryDark: pal.dark,
                  })
                }
                className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 ${
                  theme.primaryColor.toLowerCase() === pal.primary.toLowerCase()
                    ? "border-[#D4146E] bg-[#D4146E]/5 ring-1 ring-[#D4146E]"
                    : "border-[#E8E8EA] hover:border-[#171717]"
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: pal.primary }}
                />
                <span className="text-[11px] font-medium text-[#171717] truncate">{pal.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Primary Color */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#171717]">Custom Primary Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.primaryColor}
              onChange={(e) => onUpdateTheme({ primaryColor: e.target.value })}
              className="w-9 h-9 rounded-md border border-[#E8E8EA] cursor-pointer p-0.5 bg-white shrink-0"
            />
            <Input
              value={theme.primaryColor}
              onChange={(e) => onUpdateTheme({ primaryColor: e.target.value })}
              className="h-8 text-xs font-mono uppercase"
            />
          </div>
        </div>

        {/* Border Radius */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#171717]">Corner Radius Tokens</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "4px (Subtle)", value: "4px" },
              { label: "8px (Standard)", value: "8px" },
              { label: "12px (Smooth)", value: "12px" },
              { label: "16px (Rounded)", value: "16px" },
              { label: "24px (Pill)", value: "24px" },
            ].map((r) => (
              <button
                key={r.value}
                onClick={() => onUpdateTheme({ borderRadius: r.value })}
                className={`py-1.5 px-2.5 rounded text-xs font-medium border text-center transition-all ${
                  theme.borderRadius === r.value
                    ? "border-[#D4146E] bg-[#D4146E]/10 text-[#D4146E] font-semibold"
                    : "border-[#E8E8EA] text-[#171717] hover:bg-[#F7F7F8]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#171717]">Font Family</label>
          <select
            value={theme.fontFamily}
            onChange={(e) => onUpdateTheme({ fontFamily: e.target.value })}
            className="w-full h-8 px-2.5 text-xs bg-white border border-[#E8E8EA] rounded-md focus:border-[#D4146E] focus:outline-none text-[#171717]"
          >
            <option value='Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'>
              Inter (Default Modern Sans)
            </option>
            <option value='-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'>
              SF Pro (Apple Native)
            </option>
            <option value='"Plus Jakarta Sans", sans-serif'>Plus Jakarta Sans</option>
            <option value='Roboto, sans-serif'>Roboto</option>
            <option value='system-ui, sans-serif'>System UI Default</option>
          </select>
        </div>

        {/* Navigation Style */}
        <div className="pt-2 border-t border-[#E8E8EA] space-y-1.5">
          <label className="text-xs font-semibold text-[#171717] flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#D4146E]" />
            <span>Navigation Bar Style</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Bottom Nav Bar", value: "bottom_nav" },
              { label: "Top Header Bar", value: "header" },
              { label: "None (Minimal)", value: "none" },
            ].map((n) => (
              <button
                key={n.value}
                onClick={() => onUpdateNavigation({ type: n.value as any })}
                className={`py-1.5 px-2.5 rounded text-xs font-medium border text-center transition-all ${
                  navigation.type === n.value
                    ? "border-[#D4146E] bg-[#D4146E]/10 text-[#D4146E] font-semibold"
                    : "border-[#E8E8EA] text-[#171717] hover:bg-[#F7F7F8]"
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

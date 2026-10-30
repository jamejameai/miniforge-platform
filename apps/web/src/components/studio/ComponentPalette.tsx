"use client";

import { useState } from "react";
import { getAllComponents, ComponentMetadata } from "@miniforge/component-registry";
import { ComponentCategory } from "@miniforge/app-schema";
import {
  Sparkles,
  Heading,
  ShoppingBag,
  ShoppingCart,
  MousePointerClick,
  Square,
  Activity,
  Table,
  TextCursor,
  Minus,
  Tag,
  Image as ImageIcon,
  AlertCircle,
  Search,
  Plus
} from "lucide-react";

interface ComponentPaletteProps {
  onAddComponent: (type: string) => void;
}

const ICON_MAP: Record<string, any> = {
  Sparkles,
  Heading,
  ShoppingBag,
  ShoppingCart,
  MousePointerClick,
  Square,
  Activity,
  Table,
  TextCursor,
  Minus,
  Tag,
  Image: ImageIcon,
  AlertCircle
};

const CATEGORIES: { id: "all" | ComponentCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "layout", label: "Layout" },
  { id: "commerce", label: "Commerce" },
  { id: "typography", label: "Typography" },
  { id: "inputs", label: "Forms" },
  { id: "data", label: "Data" },
  { id: "feedback", label: "Feedback" }
];

export function ComponentPalette({ onAddComponent }: ComponentPaletteProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | ComponentCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allComponents = getAllComponents();

  const filteredComponents = allComponents.filter((comp) => {
    const matchesCategory =
      activeCategory === "all" || comp.category === activeCategory;
    const matchesSearch =
      comp.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Search Input */}
      <div className="p-3 border-b border-[#E8E8EA]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#777777] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F7F8] border border-[#E8E8EA] rounded-md text-[#171717] placeholder:text-[#777777] focus:outline-none focus:border-[#D4146E] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-2 py-2 border-b border-[#E8E8EA] flex items-center gap-1 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap font-medium transition-all ${
              activeCategory === cat.id
                ? "bg-[#D4146E] text-white shadow-xs"
                : "bg-[#F7F7F8] text-[#777777] hover:text-[#171717] hover:bg-[#E8E8EA]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Component Cards Grid */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredComponents.length === 0 ? (
          <div className="text-center py-10 px-4 text-xs text-[#777777]">
            No components match your search.
          </div>
        ) : (
          filteredComponents.map((comp) => {
            const Icon = ICON_MAP[comp.icon] || Square;
            return (
              <div
                key={comp.type}
                onClick={() => onAddComponent(comp.type)}
                className="group p-2.5 rounded-lg border border-[#E8E8EA] hover:border-[#D4146E] bg-white hover:bg-[#D4146E]/5 cursor-pointer transition-all flex items-start gap-2.5"
              >
                <div className="w-7 h-7 rounded-md bg-[#F7F7F8] group-hover:bg-[#D4146E]/10 flex items-center justify-center shrink-0 text-[#171717] group-hover:text-[#D4146E] transition-colors border border-[#E8E8EA]">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-[#171717] group-hover:text-[#D4146E] transition-colors truncate">
                      {comp.label}
                    </h4>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#D4146E]">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="text-[11px] text-[#777777] line-clamp-2 mt-0.5 leading-snug">
                    {comp.description}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Quick Insertion Hint */}
      <div className="p-2.5 border-t border-[#E8E8EA] bg-[#F7F7F8] text-[10px] text-[#777777] text-center">
        Click any component to append to active page
      </div>
    </div>
  );
}

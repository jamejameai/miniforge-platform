"use client";

import { useState } from "react";
import { COMPONENT_REGISTRY, ComponentMetadata } from "@miniforge/component-registry";
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
  Minus
};

export function ComponentPalette({ onAddComponent }: ComponentPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const components = Object.values(COMPONENT_REGISTRY);

  const categories = [
    { id: "all", label: "All" },
    { id: "commerce", label: "Commerce" },
    { id: "layout", label: "Layout" },
    { id: "typography", label: "Typography" },
    { id: "inputs", label: "Inputs" },
    { id: "data", label: "Data" },
  ];

  const filteredComponents = components.filter((c) => {
    const matchesSearch = c.label.toLowerCase().includes(search.toLowerCase()) ||
                          c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Search Input */}
      <div className="p-3 border-b border-[#E8E8EA]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777777]" />
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F7F8] border border-[#E8E8EA] rounded-md focus:outline-none focus:border-[#D4146E] text-[#171717] placeholder:text-[#777777]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium shrink-0 transition-colors ${
                selectedCategory === cat.id
                  ? "bg-[#171717] text-white"
                  : "bg-[#F7F7F8] text-[#777777] hover:text-[#171717] hover:bg-[#E8E8EA]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Component Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {filteredComponents.map((comp) => {
            const Icon = ICON_MAP[comp.icon] || Square;
            return (
              <button
                key={comp.type}
                onClick={() => onAddComponent(comp.type)}
                className="group flex flex-col items-start p-2.5 rounded-lg border border-[#E8E8EA] bg-[#F7F7F8] hover:bg-white hover:border-[#D4146E] hover:shadow-xs transition-all text-left relative"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="w-6 h-6 rounded bg-white group-hover:bg-[#D4146E]/10 flex items-center justify-center text-[#171717] group-hover:text-[#D4146E] transition-colors border border-[#E8E8EA] group-hover:border-[#D4146E]/20">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <Plus className="w-3.5 h-3.5 text-[#777777] group-hover:text-[#D4146E] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="font-semibold text-xs text-[#171717] leading-tight">
                  {comp.label}
                </div>
                <div className="text-[10px] text-[#777777] line-clamp-2 mt-0.5 leading-snug">
                  {comp.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

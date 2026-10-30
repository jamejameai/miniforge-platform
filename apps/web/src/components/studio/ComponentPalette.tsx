"use client";

import { useState } from "react";
import {
  Type,
  Square,
  Minus,
  Smile,
  Image as ImageIcon,
  Video,
  MousePointerClick,
  SlidersHorizontal,
  ToggleLeft,
  Navigation,
  ShoppingBag,
  ShoppingCart,
  Table as TableIcon,
  Search,
  PlusCircle,
  Sparkles,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface ComponentPaletteProps {
  onAddComponent: (type: string) => void;
  onAddPageModal?: () => void;
}

export function ComponentPalette({ onAddComponent, onAddPageModal }: ComponentPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openSections, setOpenSections] = useState({
    basic: true,
    action: true,
    nav: true,
    commerce: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const basicComponents = [
    { type: "SectionHeading", label: "テキスト", sub: "Text", icon: Type },
    { type: "Card", label: "シェイプ", sub: "Shape", icon: Square },
    { type: "Divider", label: "線", sub: "Line", icon: Minus },
    { type: "Badge", label: "アイコン", sub: "Icon", icon: Smile },
    { type: "Image", label: "画像", sub: "Image", icon: ImageIcon },
    { type: "Notice", label: "通知", sub: "Notice", icon: Sparkles },
  ];

  const actionComponents = [
    { type: "Button", label: "ボタン1", sub: "Button", icon: MousePointerClick },
    { type: "HeroBanner", label: "ヒーロー", sub: "Banner", icon: Sparkles },
    { type: "Input", label: "入力", sub: "Input", icon: SlidersHorizontal },
    { type: "Button", label: "トグル", sub: "Toggle", icon: ToggleLeft },
  ];

  const navComponents = [
    { type: "HeroBanner", label: "トップ", sub: "Top Bar", icon: Navigation },
    { type: "Card", label: "ボトム", sub: "Bottom", icon: Square },
  ];

  const commerceComponents = [
    { type: "ProductGrid", label: "商品グリッド", sub: "Products", icon: ShoppingBag },
    { type: "CartView", label: "カート", sub: "Cart", icon: ShoppingCart },
    { type: "Table", label: "テーブル", sub: "Table", icon: TableIcon },
    { type: "StatCard", label: "統計カード", sub: "Stats", icon: Square },
  ];

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Search Input (Matching Image 1: 検索 Q) */}
      <div className="p-3 border-b border-[#E2E8F0]">
        <div className="relative">
          <input
            type="text"
            placeholder="検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-8 py-1.5 text-xs bg-[#F1F5F9] border border-transparent rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Blue Pill Button: + ページを追加する */}
        {onAddPageModal && (
          <button
            onClick={onAddPageModal}
            className="w-full mt-2.5 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>ページを追加する</span>
          </button>
        )}
      </div>

      {/* Accordion Component Categories with 3-Column / 2-Column Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* SECTION 1: ベーシック (Basic) */}
        <div>
          <button
            onClick={() => toggleSection("basic")}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-800 pb-2"
          >
            <span>ベーシック</span>
            {openSections.basic ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>

          {openSections.basic && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              {basicComponents.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={`${item.type}-${idx}`}
                    onClick={() => onAddComponent(item.type)}
                    className="p-2 bg-[#F8FAFC] hover:bg-blue-50/70 border border-[#E2E8F0] hover:border-blue-300 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 group-hover:text-blue-600 group-hover:border-blue-300 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium text-gray-800 mt-1.5 leading-none">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: アクション (Action) */}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => toggleSection("action")}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-800 pb-2"
          >
            <span>アクション</span>
            {openSections.action ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>

          {openSections.action && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              {actionComponents.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={`${item.type}-${idx}`}
                    onClick={() => onAddComponent(item.type)}
                    className="p-2 bg-[#F8FAFC] hover:bg-blue-50/70 border border-[#E2E8F0] hover:border-blue-300 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 group-hover:text-blue-600 group-hover:border-blue-300 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium text-gray-800 mt-1.5 leading-none">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 3: ナビゲーション (Navigation) */}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => toggleSection("nav")}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-800 pb-2"
          >
            <span>ナビゲーション</span>
            {openSections.nav ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>

          {openSections.nav && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              {navComponents.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={`${item.type}-${idx}`}
                    onClick={() => onAddComponent(item.type)}
                    className="p-2 bg-[#F8FAFC] hover:bg-blue-50/70 border border-[#E2E8F0] hover:border-blue-300 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 group-hover:text-blue-600 group-hover:border-blue-300 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium text-gray-800 mt-1.5 leading-none">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 4: コマース & データ (Commerce & Data) */}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => toggleSection("commerce")}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-800 pb-2"
          >
            <span>データ & コマース</span>
            {openSections.commerce ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>

          {openSections.commerce && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              {commerceComponents.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={`${item.type}-${idx}`}
                    onClick={() => onAddComponent(item.type)}
                    className="p-2 bg-[#F8FAFC] hover:bg-blue-50/70 border border-[#E2E8F0] hover:border-blue-300 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 group-hover:text-blue-600 group-hover:border-blue-300 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium text-gray-800 mt-1.5 leading-none">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

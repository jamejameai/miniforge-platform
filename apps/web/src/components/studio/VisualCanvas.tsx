"use client";

import { useState } from "react";
import { PageSpec, ComponentNode, ThemeConfig, NavigationConfig } from "@miniforge/app-schema";
import {
  Smartphone,
  MoveUp,
  MoveDown,
  Trash2,
  Plus,
  ShoppingBag,
  ShoppingCart,
  ChevronRight,
  Sparkles,
  Wifi,
  Battery,
  Signal,
  Copy,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  GraduationCap
} from "lucide-react";
import { Button } from "@/lib/../components/ui/button";
import { useLearningMode } from "@/lib/learning-mode";

const COMPONENT_LEARNING_GUIDE: Record<string, string> = {
  HeroBanner: "The visual anchor of your app. Highlights your value proposition with a high-contrast headline, badge, and primary action button.",
  ProductGrid: "Connects directly to your POS catalog. Items automatically reflect live prices, imagery, and deduct stock on checkout.",
  CartView: "Manages items chosen by the customer. Enables instant checkout, discounts, and triggers server-side order workflows.",
  SectionHeading: "Organizes your page into clear sections, improving readability on mobile Telegram screens.",
  Button: "Triggers navigation to another page or executes actions. Customize background color to match your brand token.",
  Card: "A versatile container that groups related content, images, and action links with subtle borders.",
  StatCard: "Presents key performance metrics or counts with a prominent number and positive/negative trend badge.",
  Table: "Renders tabular records. Can be connected to custom dynamic database tables created in Database Studio.",
  Input: "Collects user input such as inquiries, contact numbers, or feedback forms.",
  Divider: "Creates breathing room and visual rhythm between distinct content modules."
};

interface VisualCanvasProps {
  page: PageSpec;
  theme: ThemeConfig;
  navigation: NavigationConfig;
  viewport: "mobile" | "tablet" | "desktop";
  selectedComponentId: string | null;
  isPreview: boolean;
  onSelectComponent: (id: string | null) => void;
  onMoveComponent: (compIndex: number, direction: "up" | "down") => void;
  onDeleteComponent: (compIndex: number) => void;
  onDuplicateComponent?: (compIndex: number) => void;
  onNavigatePage?: (pageId: string) => void;
  onOpenAddModal?: () => void;
}

export function VisualCanvas({
  page,
  theme,
  navigation,
  viewport,
  selectedComponentId,
  isPreview,
  onSelectComponent,
  onMoveComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onNavigatePage,
  onOpenAddModal,
}: VisualCanvasProps) {
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const { isBeginner } = useLearningMode();

  const selectedComp = page.components.find((c) => c.id === selectedComponentId);

  const getContainerWidth = () => {
    switch (viewport) {
      case "mobile":
        return "w-[390px]";
      case "tablet":
        return "w-[768px]";
      case "desktop":
        return "w-full max-w-5xl";
    }
  };

  const renderComponent = (comp: ComponentNode, index: number) => {
    const isSelected = selectedComponentId === comp.id && !isPreview;

    let content = null;
    const props = comp.props || {};

    switch (comp.type) {
      case "HeroBanner":
        content = (
          <div
            className="p-6 rounded-xl border border-[#E8E8EA] bg-[#F7F7F8] relative overflow-hidden"
            style={{ borderRadius: theme.borderRadius }}
          >
            {props.badge && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-2"
                style={{ backgroundColor: `${theme.primaryColor}15`, color: theme.primaryColor }}
              >
                <Sparkles className="w-3 h-3" />
                {props.badge}
              </span>
            )}
            <h2 className="text-xl font-bold text-[#171717] tracking-tight mb-1">
              {props.title || "Banner Title"}
            </h2>
            <p className="text-xs text-[#777777] mb-4 max-w-sm">
              {props.subtitle || "Banner subtitle goes here..."}
            </p>
            {props.buttonText && (
              <button
                className="px-4 py-2 rounded-md text-xs font-semibold text-white shadow-sm transition-transform active:scale-95"
                style={{ backgroundColor: theme.primaryColor }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (props.buttonAction?.target && onNavigatePage) {
                    onNavigatePage(props.buttonAction.target);
                  }
                }}
              >
                {props.buttonText}
              </button>
            )}
          </div>
        );
        break;

      case "SectionHeading":
        content = (
          <div className="py-2">
            <h3 className="text-base font-bold text-[#171717] tracking-tight">{props.title}</h3>
            {props.subtitle && <p className="text-xs text-[#777777] mt-0.5">{props.subtitle}</p>}
          </div>
        );
        break;

      case "ProductGrid":
        content = (
          <div className={`grid gap-3 ${props.columns === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {[
              { id: "1", name: "Single Origin Pour Over", price: "$5.50", category: "Coffee", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80" },
              { id: "2", name: "Ceremonial Matcha Oat Latte", price: "$6.00", category: "Beverages", image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80" },
              { id: "3", name: "Almond Croissant", price: "$4.25", category: "Pastry", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80" },
              { id: "4", name: "Cold Brew Reserve", price: "$5.00", category: "Coffee", image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80" },
            ].slice(0, props.limit || 4).map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-[#E8E8EA] bg-white overflow-hidden flex flex-col group hover:border-[#D4146E] transition-colors"
                style={{ borderRadius: theme.borderRadius }}
              >
                <div className="h-28 bg-[#F7F7F8] relative overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2 left-2 text-[10px] font-medium bg-black/60 text-white px-1.5 py-0.5 rounded backdrop-blur-xs">
                    {p.category}
                  </span>
                </div>
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-[#171717] line-clamp-1">{p.name}</h4>
                    <span className="text-xs font-bold text-[#171717] mt-0.5 block">{p.price}</span>
                  </div>
                  {props.showAddToCart && (
                    <button
                      className="mt-2 w-full py-1.5 rounded text-[11px] font-semibold text-white transition-opacity flex items-center justify-center gap-1 shadow-xs"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
        break;

      case "CartView":
        content = (
          <div
            className="p-4 rounded-xl border border-[#E8E8EA] bg-white space-y-3"
            style={{ borderRadius: theme.borderRadius }}
          >
            <div className="flex items-center justify-between border-b border-[#E8E8EA] pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">Your Items (2)</span>
              <span className="text-xs font-semibold text-[#171717]">$11.50</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-[#171717]">Single Origin Pour Over</div>
                  <div className="text-[10px] text-[#777777]">Qty: 1 × $5.50</div>
                </div>
                <span className="font-semibold text-[#171717]">$5.50</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-[#171717]">Ceremonial Matcha Oat Latte</div>
                  <div className="text-[10px] text-[#777777]">Qty: 1 × $6.00</div>
                </div>
                <span className="font-semibold text-[#171717]">$6.00</span>
              </div>
            </div>
            <div className="pt-2 border-t border-[#E8E8EA] space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#171717]">
                <span>Total</span>
                <span>$11.50</span>
              </div>
              <button
                className="w-full py-2.5 rounded-md text-xs font-semibold text-white shadow-sm"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {props.checkoutButtonText || "Place Order"}
              </button>
            </div>
          </div>
        );
        break;

      case "Button":
        content = (
          <div>
            <button
              className="px-4 py-2 rounded-md text-xs font-semibold text-white shadow-sm"
              style={{
                backgroundColor: props.variant === "primary" ? theme.primaryColor : "#171717",
                borderRadius: theme.borderRadius
              }}
            >
              {props.label || "Action Button"}
            </button>
          </div>
        );
        break;

      case "Card":
        content = (
          <div
            className="p-4 rounded-xl border border-[#E8E8EA] bg-white shadow-xs"
            style={{ borderRadius: theme.borderRadius }}
          >
            <h4 className="text-sm font-semibold text-[#171717]">{props.title}</h4>
            <p className="text-xs text-[#777777] mt-1">{props.description}</p>
          </div>
        );
        break;

      case "StatCard":
        content = (
          <div
            className="p-3.5 rounded-lg border border-[#E8E8EA] bg-white flex items-center justify-between"
            style={{ borderRadius: theme.borderRadius }}
          >
            <div>
              <span className="text-[11px] font-medium text-[#777777]">{props.title}</span>
              <div className="text-lg font-bold text-[#171717] leading-tight mt-0.5">{props.value}</div>
            </div>
            {props.change && (
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {props.change}
              </span>
            )}
          </div>
        );
        break;

      case "Input":
        content = (
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#171717]">{props.label}</label>
            <input
              type="text"
              readOnly
              placeholder={props.placeholder}
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#E8E8EA] rounded-md text-[#171717]"
              style={{ borderRadius: theme.borderRadius }}
            />
          </div>
        );
        break;

      case "Divider":
        content = <div className="h-px bg-[#E8E8EA] w-full" style={{ margin: `${props.margin || 16}px 0` }} />;
        break;

      default:
        content = (
          <div className="p-3 bg-[#F7F7F8] border border-dashed border-[#E8E8EA] rounded text-xs text-[#777777] text-center">
            {comp.type} component
          </div>
        );
    }

    return (
      <div
        key={comp.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent(comp.id);
        }}
        className={`relative group/comp cursor-pointer transition-all ${
          isSelected
            ? "ring-2 ring-[#D4146E] ring-offset-2 rounded-lg"
            : !isPreview
            ? "hover:ring-1 hover:ring-[#E8E8EA] hover:ring-offset-1 rounded-lg"
            : ""
        }`}
      >
        {/* Selected Component Quick Action Toolbar */}
        {isSelected && (
          <div className="absolute -top-7 right-0 z-20 flex items-center gap-1 bg-[#171717] text-white px-2 py-1 rounded shadow-md text-[10px] font-mono animate-in fade-in duration-100">
            <span className="font-semibold text-[#D4146E]">{comp.type}</span>
            <div className="h-2.5 w-px bg-white/20 mx-0.5" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveComponent(index, "up");
              }}
              disabled={index === 0}
              className="hover:text-[#D4146E] disabled:opacity-30"
              title="Move up"
            >
              <MoveUp className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveComponent(index, "down");
              }}
              disabled={index === page.components.length - 1}
              className="hover:text-[#D4146E] disabled:opacity-30"
              title="Move down"
            >
              <MoveDown className="w-3 h-3" />
            </button>
            {onDuplicateComponent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateComponent(index);
                }}
                className="hover:text-[#D4146E]"
                title="Duplicate component"
              >
                <Copy className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteComponent(index);
              }}
              className="hover:text-red-400"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
        {content}
      </div>
    );
  };

  return (
    <div
      className="flex-1 bg-[#F7F7F8] overflow-y-auto flex items-start justify-center p-6 select-none relative"
      style={{
        background: showGrid
          ? "radial-gradient(circle, #D8D8DA 1px, transparent 1px) 0 0 / 16px 16px, #F7F7F8"
          : undefined,
      }}
      onClick={() => onSelectComponent(null)}
    >
      <div
        className={`${getContainerWidth()} bg-white min-h-[720px] rounded-2xl border border-[#E8E8EA] shadow-sm flex flex-col overflow-hidden transition-all duration-200 relative`}
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top center",
        }}
      >
        {/* Telegram Frame Simulated Top Bar */}
        {viewport === "mobile" && (
          <div className="h-10 bg-white border-b border-[#E8E8EA] px-5 flex items-center justify-between text-xs text-[#171717] shrink-0 font-medium">
            <span>9:41</span>
            <div className="w-16 h-4 bg-black rounded-full mx-auto" />
            <div className="flex items-center gap-1.5 text-[#171717]">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Telegram Mini App Header Bar */}
        <div className="h-12 bg-white px-4 border-b border-[#E8E8EA] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: theme.primaryColor }}
            />
            <span className="text-xs font-bold text-[#171717]">{page.title}</span>
          </div>
          <div className="text-[11px] text-[#777777] font-mono">mini app</div>
        </div>

        {/* Canvas Body (Components Scroll Area) */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {page.components.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-[#E8E8EA] rounded-xl">
              <Smartphone className="w-8 h-8 text-[#777777] mb-2" />
              <h4 className="text-sm font-semibold text-[#171717]">This page is empty</h4>
              <p className="text-xs text-[#777777] max-w-xs mt-1 mb-3">
                Click any component in the left palette to start building your application.
              </p>
              {onOpenAddModal && (
                <Button variant="primary" size="sm" onClick={onOpenAddModal} className="text-xs gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert Component</span>
                </Button>
              )}
            </div>
          ) : (
            page.components.map((comp, idx) => renderComponent(comp, idx))
          )}
        </div>

        {/* Simulated Telegram Bottom Nav Bar */}
        {navigation.type === "bottom_nav" && navigation.items.length > 0 && (
          <div className="h-14 border-t border-[#E8E8EA] bg-white px-6 flex items-center justify-around shrink-0">
            {navigation.items.map((item) => {
              const isCurrent = item.pageId === page.id;
              return (
                <button
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onNavigatePage) onNavigatePage(item.pageId);
                  }}
                  className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                    isCurrent ? "font-bold" : "text-[#777777] hover:text-[#171717]"
                  }`}
                  style={{ color: isCurrent ? theme.primaryColor : undefined }}
                >
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Mobile Home Indicator bar */}
        {viewport === "mobile" && (
          <div className="h-4 bg-white flex items-center justify-center shrink-0">
            <div className="w-32 h-1 bg-black/20 rounded-full" />
          </div>
        )}
      </div>

      {/* Canvas Tools Toolbar (Zoom, Grid) */}
      {!isPreview && (
        <div className="absolute bottom-6 left-6 z-30 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-[#E8E8EA] shadow-md px-2.5 py-1.5 rounded-lg text-xs">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => Math.max(50, z - 10));
            }}
            className="p-1 rounded hover:bg-[#F7F7F8] text-[#777777] hover:text-[#171717]"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] font-semibold text-[#171717] w-10 text-center">
            {zoom}%
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => Math.min(150, z + 10));
            }}
            className="p-1 rounded hover:bg-[#F7F7F8] text-[#777777] hover:text-[#171717]"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="h-3.5 w-px bg-[#E8E8EA] mx-1" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowGrid(!showGrid);
            }}
            className={`p-1 rounded transition-colors ${
              showGrid ? "bg-[#D4146E]/10 text-[#D4146E]" : "text-[#777777] hover:text-[#171717]"
            }`}
            title="Toggle alignment grid"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Beginner Mode Educational Guide Card */}
      {isBeginner && selectedComp && !isPreview && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-6 right-6 z-30 max-w-sm bg-white/95 backdrop-blur-sm border border-amber-200 shadow-lg p-3.5 rounded-xl text-xs space-y-1.5 animate-in slide-in-from-bottom-2"
        >
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Learn: {selectedComp.type}</span>
          </div>
          <p className="text-[11px] text-[#555555] leading-relaxed">
            {COMPONENT_LEARNING_GUIDE[selectedComp.type] || "Interactive component rendered inside your Mini App frame."}
          </p>
        </div>
      )}
    </div>
  );
}


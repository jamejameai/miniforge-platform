"use client";

import { useState, useRef, useEffect } from "react";
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
  Lock,
  Unlock,
  Eye,
  EyeOff,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Info,
  Tag,
  Image as ImageIcon,
  ArrowRight,
  Maximize2
} from "lucide-react";
import { Button } from "@/lib/../components/ui/button";
import { resolveComponentStyles, resolveMotionStyles } from "@/lib/studio-runtime";

interface VisualCanvasProps {
  page: PageSpec;
  allPages?: PageSpec[];
  theme: ThemeConfig;
  navigation: NavigationConfig;
  viewport: "mobile" | "tablet" | "desktop";
  selectedComponentId: string | null;
  selectedComponentIds?: string[];
  isPreview: boolean;
  onSelectComponent: (id: string | null, isMulti?: boolean) => void;
  onMoveComponent: (compIndex: number, direction: "up" | "down") => void;
  onDeleteComponent: (compIndex: number) => void;
  onDuplicateComponent?: (compIndex: number) => void;
  onToggleLockComponent?: (compId: string) => void;
  onToggleHideComponent?: (compId: string) => void;
  onNavigatePage?: (pageId: string) => void;
  onOpenAddModal?: () => void;
}

export function VisualCanvas({
  page,
  allPages = [],
  theme,
  navigation,
  viewport,
  selectedComponentId,
  selectedComponentIds = [],
  isPreview,
  onSelectComponent,
  onMoveComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onToggleLockComponent,
  onToggleHideComponent,
  onNavigatePage,
  onOpenAddModal,
}: VisualCanvasProps) {
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [viewMode, setViewMode] = useState<"flow" | "single">("flow");

  // Determine pages to display
  const pagesToDisplay = viewMode === "flow" && allPages.length > 1 ? allPages : [page];

  const renderComponent = (
    comp: ComponentNode,
    index: number,
    currentPage: PageSpec,
    isCurrentActivePage: boolean
  ) => {
    const isSelected =
      isCurrentActivePage &&
      (selectedComponentId === comp.id || selectedComponentIds.includes(comp.id)) &&
      !isPreview;
    const isLocked = comp.isLocked || false;
    const isHidden = comp.isHidden || false;

    if (isPreview && isHidden) return null;

    let content = null;
    const props = comp.props || {};
    const customStyles = resolveComponentStyles(comp.styles, theme);
    const motionResult = resolveMotionStyles(comp.motion);

    switch (comp.type) {
      case "HeroBanner":
        content = (
          <div
            className="p-5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] relative overflow-hidden transition-all"
            style={{
              borderRadius: comp.styles?.borderRadius || "12px",
              ...customStyles,
            }}
          >
            {props.badge && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-2 bg-blue-50 text-blue-600 border border-blue-200">
                <Sparkles className="w-3 h-3" />
                {props.badge}
              </span>
            )}
            <h2 className="text-base font-bold text-gray-900 tracking-tight mb-1">
              {props.title || "Banner Title"}
            </h2>
            <p className="text-xs text-gray-500 mb-3 leading-snug">
              {props.subtitle || "Banner subtitle goes here..."}
            </p>
            {props.buttonText && (
              <button
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs bg-blue-600 hover:bg-blue-700 transition-transform active:scale-95"
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
          <div className="py-2" style={customStyles}>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">{props.title}</h3>
            {props.subtitle && <p className="text-xs text-gray-500 mt-0.5">{props.subtitle}</p>}
          </div>
        );
        break;

      case "ProductGrid":
        content = (
          <div className="grid grid-cols-2 gap-3" style={customStyles}>
            {[
              { id: "1", name: "Single Origin Coffee", price: "$5.50", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80" },
              { id: "2", name: "Matcha Latte", price: "$6.00", image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80" },
            ].map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden flex flex-col group hover:border-blue-500 transition-colors shadow-2xs"
              >
                <div className="h-24 bg-gray-100 relative overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 truncate">{p.name}</h4>
                    <span className="text-xs font-bold text-gray-900 mt-0.5 block">{p.price}</span>
                  </div>
                  <button className="mt-2 w-full py-1.5 rounded-lg text-[11px] font-semibold text-white bg-blue-600 flex items-center justify-center gap-1 shadow-xs">
                    <ShoppingBag className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
        break;

      case "CartView":
        content = (
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-xs font-bold uppercase text-gray-500">Your Cart</span>
              <span className="text-xs font-semibold text-gray-900">$11.50</span>
            </div>
            <div className="text-xs space-y-1 text-gray-600">
              <div className="flex justify-between">
                <span>Single Origin Coffee</span>
                <span>$5.50</span>
              </div>
              <div className="flex justify-between">
                <span>Matcha Latte</span>
                <span>$6.00</span>
              </div>
            </div>
            <button className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 shadow-xs">
              Proceed to checkout
            </button>
          </div>
        );
        break;

      case "Button":
        content = (
          <div style={customStyles}>
            <button
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-white shadow-xs bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all"
            >
              {props.label || "Action Button"}
            </button>
          </div>
        );
        break;

      case "Card":
        content = (
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white shadow-2xs space-y-1">
            <h4 className="text-xs font-bold text-gray-900">{props.title || "Card"}</h4>
            <p className="text-xs text-gray-500">{props.description || "Card content"}</p>
          </div>
        );
        break;

      case "Input":
        content = (
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">{props.label}</label>
            <input
              type="text"
              readOnly
              placeholder={props.placeholder}
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-gray-900"
            />
          </div>
        );
        break;

      case "Divider":
        content = <div className="h-px bg-gray-200 w-full my-2" />;
        break;

      default:
        content = (
          <div className="p-2.5 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-xs text-gray-500 text-center">
            {comp.type}
          </div>
        );
    }

    return (
      <div
        key={comp.id}
        onClick={(e) => {
          e.stopPropagation();
          if (onNavigatePage && currentPage.id !== page.id) {
            onNavigatePage(currentPage.id);
          }
          onSelectComponent(comp.id, e.shiftKey);
        }}
        className={`relative group/comp cursor-pointer transition-all ${
          isSelected
            ? "ring-2 ring-blue-600 ring-offset-2 rounded-xl"
            : !isPreview
            ? "hover:ring-1 hover:ring-blue-300 rounded-xl"
            : ""
        }`}
      >
        {content}
      </div>
    );
  };

  return (
    <div
      className="flex-1 bg-[#F8FAFC] overflow-auto flex items-start justify-center p-8 select-none relative"
      style={{
        backgroundImage: showGrid
          ? "radial-gradient(#CBD5E1 1px, transparent 1px)"
          : undefined,
        backgroundSize: "20px 20px",
      }}
      onClick={() => onSelectComponent(null)}
    >
      {/* SVG Connecting Flow Arrows between Screens (Matching Image 1 Flow Canvas) */}
      {viewMode === "flow" && allPages.length > 1 && (
        <svg
          className="absolute inset-0 pointer-events-none z-10 w-full h-full"
          style={{ minWidth: "1600px", minHeight: "1200px" }}
        >
          {/* Decorative smooth curved flow connection arrows */}
          <defs>
            <marker
              id="flow-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#0284C7" />
            </marker>
          </defs>

          {/* Bezier connector from Screen 1 to Screen 2 */}
          <path
            d="M 440 220 C 490 220, 500 240, 560 240"
            fill="none"
            stroke="#0284C7"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            markerEnd="url(#flow-arrow)"
          />

          {/* Bezier connector from Screen 2 to Screen 3 */}
          <path
            d="M 940 280 C 1000 280, 1020 300, 1080 300"
            fill="none"
            stroke="#0284C7"
            strokeWidth="2.5"
            markerEnd="url(#flow-arrow)"
          />
        </svg>
      )}

      {/* Canvas Multi-Artboard Layout */}
      <div
        className="flex items-start gap-12 transition-transform duration-200 origin-top-left"
        style={{ transform: `scale(${zoom / 100})` }}
      >
        {pagesToDisplay.map((pg, pageIndex) => {
          const isCurrent = pg.id === page.id;

          return (
            <div key={pg.id} className="flex flex-col items-center">
              {/* Artboard Screen Header Label */}
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isCurrent
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {pg.title}
                </span>
                <span className="text-[10px] font-mono text-gray-400">({pg.slug})</span>
              </div>

              {/* Artboard Container with Figma/Canvas Selection Handles */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (onNavigatePage) onNavigatePage(pg.id);
                }}
                className={`w-[380px] min-h-[700px] bg-white rounded-3xl border shadow-sm flex flex-col overflow-hidden relative transition-all ${
                  isCurrent && !isPreview
                    ? "ring-2 ring-cyan-500 shadow-md border-cyan-400"
                    : "border-gray-200 opacity-95 hover:opacity-100"
                }`}
              >
                {/* Cyan Anchor Handles on selection border (Exact match to Image 1) */}
                {isCurrent && !isPreview && (
                  <>
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-cyan-500 border-2 border-white z-20" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-cyan-500 border-2 border-white z-20" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full bg-cyan-500 border-2 border-white z-20" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full bg-cyan-500 border-2 border-white z-20" />
                    <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-600 border-2 border-white z-20 cursor-pointer shadow-xs" title="Drag to connect flow" />
                  </>
                )}

                {/* iPhone Status Bar */}
                <div className="h-10 bg-white border-b border-gray-100 px-6 flex items-center justify-between text-xs text-gray-900 shrink-0 font-medium">
                  <span>9:41</span>
                  <div className="w-16 h-4 bg-black rounded-full mx-auto" />
                  <div className="flex items-center gap-1.5 text-gray-900">
                    <Signal className="w-3 h-3" />
                    <Wifi className="w-3 h-3" />
                    <Battery className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Telegram Header Bar */}
                <div className="h-11 bg-white px-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span className="text-xs font-bold text-gray-900">{pg.title}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">Telegram Mini App</div>
                </div>

                {/* Canvas Body Components */}
                <div className="flex-1 p-4 space-y-3.5 overflow-y-auto">
                  {pg.components.length === 0 ? (
                    <div className="py-20 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl p-4">
                      <p className="font-semibold text-gray-600">Screen is empty</p>
                      <p className="text-[11px] mt-1 text-gray-400">Click components on the left to add.</p>
                    </div>
                  ) : (
                    pg.components.map((comp, idx) =>
                      renderComponent(comp, idx, pg, isCurrent)
                    )
                  )}
                </div>

                {/* Bottom Navigation */}
                {navigation?.type === "bottom_nav" && (
                  <div className="h-14 border-t border-gray-100 bg-white px-6 flex items-center justify-around shrink-0">
                    {navigation.items.map((it) => (
                      <span
                        key={it.id}
                        className={`text-[10px] font-medium ${
                          it.pageId === pg.id ? "text-blue-600 font-bold" : "text-gray-400"
                        }`}
                      >
                        {it.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Home Indicator bar */}
                <div className="h-4 bg-white flex items-center justify-center shrink-0">
                  <div className="w-32 h-1 bg-black/20 rounded-full" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Floating Canvas Toolbar (Zoom, Grid, Flow Toggle) */}
      {!isPreview && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-[#E2E8F0] shadow-md px-3 py-1.5 rounded-full text-xs">
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] font-semibold text-gray-800 w-10 text-center">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(150, z + 10))}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="h-3.5 w-px bg-gray-200 mx-1" />
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1 rounded-full transition-colors ${
              showGrid ? "bg-blue-50 text-blue-600" : "text-gray-400"
            }`}
            title="Toggle grid dots"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>
          <div className="h-3.5 w-px bg-gray-200 mx-1" />
          <button
            onClick={() => setViewMode(viewMode === "flow" ? "single" : "flow")}
            className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            {viewMode === "flow" ? "Flow View" : "Single Screen"}
          </button>
        </div>
      )}
    </div>
  );
}

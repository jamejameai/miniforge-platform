"use client";

import { useEffect, useState, useRef } from "react";
import { getAllComponents } from "@miniforge/component-registry";
import { PageSpec } from "@miniforge/app-schema";
import {
  Search,
  PlusSquare,
  FileText,
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  Save,
  Send,
  X,
  Sparkles,
  Command
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  pages: PageSpec[];
  onSelectPage: (pageId: string) => void;
  onAddComponent: (type: string) => void;
  onViewportChange: (v: "mobile" | "tablet" | "desktop") => void;
  onTogglePreview: () => void;
  onSave: () => void;
  onPublish: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  pages,
  onSelectPage,
  onAddComponent,
  onViewportChange,
  onTogglePreview,
  onSave,
  onPublish,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent or handled outside
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allComponents = getAllComponents();
  const filteredComponents = allComponents.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.type.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPages = pages.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.slug.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-24 p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-[#E8E8EA] overflow-hidden flex flex-col max-h-[460px] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="h-12 border-b border-[#E8E8EA] px-3.5 flex items-center gap-2.5 bg-white">
          <Search className="w-4 h-4 text-[#777777]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search components, pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#777777]"
          />
          <kbd className="text-[10px] bg-[#F7F7F8] border border-[#E8E8EA] text-[#777777] px-1.5 py-0.5 rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {/* Actions Section */}
          <div>
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#777777]">
              Actions
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  onSave();
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#171717] hover:bg-[#F7F7F8] rounded-md transition-colors"
              >
                <Save className="w-3.5 h-3.5 text-[#D4146E]" />
                <span className="flex-1 text-left">Save Draft Changes</span>
                <span className="text-[10px] text-[#777777] font-mono">Cmd+S</span>
              </button>
              <button
                onClick={() => {
                  onPublish();
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#171717] hover:bg-[#F7F7F8] rounded-md transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span className="flex-1 text-left">Publish Snapshot</span>
              </button>
              <button
                onClick={() => {
                  onTogglePreview();
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#171717] hover:bg-[#F7F7F8] rounded-md transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-sky-600" />
                <span className="flex-1 text-left">Toggle Live Preview</span>
              </button>
              <div className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#777777]">
                <span className="text-[11px]">Viewport:</span>
                <button
                  onClick={() => {
                    onViewportChange("mobile");
                    onClose();
                  }}
                  className="px-2 py-0.5 rounded text-[11px] hover:bg-[#F7F7F8] text-[#171717] flex items-center gap-1"
                >
                  <Smartphone className="w-3 h-3" /> Mobile
                </button>
                <button
                  onClick={() => {
                    onViewportChange("tablet");
                    onClose();
                  }}
                  className="px-2 py-0.5 rounded text-[11px] hover:bg-[#F7F7F8] text-[#171717] flex items-center gap-1"
                >
                  <Tablet className="w-3 h-3" /> Tablet
                </button>
                <button
                  onClick={() => {
                    onViewportChange("desktop");
                    onClose();
                  }}
                  className="px-2 py-0.5 rounded text-[11px] hover:bg-[#F7F7F8] text-[#171717] flex items-center gap-1"
                >
                  <Monitor className="w-3 h-3" /> Desktop
                </button>
              </div>
            </div>
          </div>

          {/* Components Section */}
          {filteredComponents.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                Insert Component
              </div>
              <div className="grid grid-cols-2 gap-1">
                {filteredComponents.map((comp) => (
                  <button
                    key={comp.type}
                    onClick={() => {
                      onAddComponent(comp.type);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-2.5 py-2 text-xs text-[#171717] hover:bg-[#F7F7F8] rounded-md text-left transition-colors border border-transparent hover:border-[#E8E8EA]"
                  >
                    <PlusSquare className="w-3.5 h-3.5 text-[#D4146E] shrink-0" />
                    <div className="truncate">
                      <div className="font-semibold text-[11px] truncate">{comp.label}</div>
                      <div className="text-[10px] text-[#777777] capitalize">{comp.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Jump to Page Section */}
          {filteredPages.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                Go to Page
              </div>
              <div className="space-y-0.5">
                {filteredPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => {
                      onSelectPage(page.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-[#171717] hover:bg-[#F7F7F8] rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[#777777]" />
                      <span>{page.title}</span>
                      {page.isHome && (
                        <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1 rounded">
                          Home
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#777777] font-mono">{page.slug}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-8 border-t border-[#E8E8EA] bg-[#F7F7F8] px-3 flex items-center justify-between text-[10px] text-[#777777]">
          <span>MiniForge Studio Command Bar</span>
          <div className="flex items-center gap-2">
            <span>Navigate: ↑↓</span>
            <span>Select: ↵</span>
          </div>
        </div>
      </div>
    </div>
  );
}


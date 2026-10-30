"use client";

import { useState } from "react";
import { PageSpec, ComponentNode } from "@miniforge/app-schema";
import {
  FileText,
  Home,
  Plus,
  Trash2,
  ChevronRight,
  MoveUp,
  MoveDown,
  Layers,
  Copy
} from "lucide-react";
import { Button } from "@/lib/../components/ui/button";
import { Modal } from "@/lib/../components/ui/modal";
import { Input } from "@/lib/../components/ui/input";

interface PageTreeNavProps {
  pages: PageSpec[];
  activePageId: string;
  selectedComponentId: string | null;
  onSelectPage: (pageId: string) => void;
  onSelectComponent: (compId: string | null) => void;
  onAddPage: (title: string, slug: string) => void;
  onDeletePage: (pageId: string) => void;
  onMoveComponent: (pageId: string, compIndex: number, direction: "up" | "down") => void;
  onDeleteComponent: (pageId: string, compIndex: number) => void;
  onDuplicateComponent?: (pageId: string, compIndex: number) => void;
}

export function PageTreeNav({
  pages,
  activePageId,
  selectedComponentId,
  onSelectPage,
  onSelectComponent,
  onAddPage,
  onDeletePage,
  onMoveComponent,
  onDeleteComponent,
  onDuplicateComponent,
}: PageTreeNavProps) {
  const [isAddPageOpen, setIsAddPageOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");

  const activePage = pages.find((p) => p.id === activePageId) || pages[0];

  const handleCreatePage = () => {
    if (!newPageTitle.trim()) return;
    const slug = newPageSlug.trim() || `/${newPageTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    onAddPage(newPageTitle.trim(), slug);
    setNewPageTitle("");
    setNewPageSlug("");
    setIsAddPageOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-white select-none border-b border-[#E8E8EA]">
      {/* Pages Section Header */}
      <div className="p-3 border-b border-[#E8E8EA] flex items-center justify-between bg-[#F7F7F8]">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#777777]">
          <FileText className="w-3.5 h-3.5 text-[#171717]" />
          <span>Pages ({pages.length})</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddPageOpen(true)}
          className="h-6 px-2 text-[11px] gap-1 bg-white"
        >
          <Plus className="w-3 h-3" />
          <span>New</span>
        </Button>
      </div>

      {/* Pages List */}
      <div className="p-2 space-y-1 max-h-48 overflow-y-auto border-b border-[#E8E8EA]">
        {pages.map((p) => {
          const isActive = p.id === activePageId;
          return (
            <div
              key={p.id}
              onClick={() => {
                onSelectPage(p.id);
                onSelectComponent(null);
              }}
              className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                isActive
                  ? "bg-[#D4146E]/10 text-[#D4146E] font-semibold border border-[#D4146E]/20"
                  : "text-[#171717] hover:bg-[#F7F7F8]"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {p.isHome ? (
                  <Home className="w-3.5 h-3.5 text-[#D4146E] shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[#777777] shrink-0" />
                )}
                <span className="truncate">{p.title}</span>
                <span className="text-[10px] text-[#777777] font-mono">({p.slug})</span>
              </div>

              {!p.isHome && pages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete page "${p.title}"?`)) onDeletePage(p.id);
                  }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
                  title="Delete page"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Components in Current Page */}
      <div className="p-3 border-b border-[#E8E8EA] bg-[#F7F7F8] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#777777]">
          <Layers className="w-3.5 h-3.5 text-[#171717]" />
          <span>Hierarchy ({activePage?.components.length || 0})</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {(!activePage || activePage.components.length === 0) ? (
          <div className="text-center py-6 px-3 text-xs text-[#777777]">
            No components yet. Select one from the palette above to insert.
          </div>
        ) : (
          activePage.components.map((comp, idx) => {
            const isSelected = selectedComponentId === comp.id;
            return (
              <div
                key={comp.id}
                onClick={() => onSelectComponent(comp.id)}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#171717] text-white font-medium"
                    : "text-[#171717] hover:bg-[#F7F7F8] border border-transparent hover:border-[#E8E8EA]"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`text-[10px] font-mono ${isSelected ? "text-white/60" : "text-[#777777]"}`}>
                    #{idx + 1}
                  </span>
                  <span className="truncate">{comp.type}</span>
                </div>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    disabled={idx === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveComponent(activePage.id, idx, "up");
                    }}
                    className={`p-1 rounded disabled:opacity-20 ${isSelected ? "hover:bg-white/20" : "hover:bg-[#E8E8EA]"}`}
                    title="Move Up"
                  >
                    <MoveUp className="w-3 h-3" />
                  </button>
                  <button
                    disabled={idx === activePage.components.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveComponent(activePage.id, idx, "down");
                    }}
                    className={`p-1 rounded disabled:opacity-20 ${isSelected ? "hover:bg-white/20" : "hover:bg-[#E8E8EA]"}`}
                    title="Move Down"
                  >
                    <MoveDown className="w-3 h-3" />
                  </button>
                  {onDuplicateComponent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateComponent(activePage.id, idx);
                      }}
                      className={`p-1 rounded ${isSelected ? "hover:bg-white/20" : "hover:bg-[#E8E8EA]"}`}
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteComponent(activePage.id, idx);
                    }}
                    className={`p-1 rounded text-red-500 ${isSelected ? "hover:bg-white/20" : "hover:bg-red-50"}`}
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Page Modal */}
      <Modal
        isOpen={isAddPageOpen}
        onClose={() => setIsAddPageOpen(false)}
        title="Add New Application Page"
        description="Create a new navigational route in your application."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#171717] mb-1">Page Title</label>
            <Input
              value={newPageTitle}
              onChange={(e) => {
                setNewPageTitle(e.target.value);
                if (!newPageSlug) {
                  setNewPageSlug(`/${e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
                }
              }}
              placeholder="e.g. Special Events"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#171717] mb-1">Route Slug</label>
            <Input
              value={newPageSlug}
              onChange={(e) => setNewPageSlug(e.target.value)}
              placeholder="e.g. /special-events"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddPageOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreatePage}>
              Create Page
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


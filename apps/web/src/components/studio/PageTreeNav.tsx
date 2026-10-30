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
  Copy,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Edit2
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
  onToggleLockComponent?: (pageId: string, compId: string) => void;
  onToggleHideComponent?: (pageId: string, compId: string) => void;
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
  onToggleLockComponent,
  onToggleHideComponent,
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
    <div className="flex flex-col h-full bg-white select-none">
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
          className="h-6 px-2 text-[11px] gap-1 bg-white hover:border-[#D4146E] hover:text-[#D4146E]"
        >
          <Plus className="w-3 h-3" />
          <span>New Page</span>
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

      {/* Components in Current Page (Layers Hierarchy) */}
      <div className="p-3 border-b border-[#E8E8EA] bg-[#F7F7F8] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#777777]">
          <Layers className="w-3.5 h-3.5 text-[#171717]" />
          <span>Layers ({activePage?.components.length || 0})</span>
        </div>
        <span className="text-[10px] text-[#777777] font-mono truncate max-w-[100px]">
          {activePage?.title}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {!activePage || activePage.components.length === 0 ? (
          <div className="text-center py-8 px-4 text-xs text-[#777777]">
            No components yet. Add from the Components palette.
          </div>
        ) : (
          activePage.components.map((comp, idx) => {
            const isSelected = selectedComponentId === comp.id;
            const isLocked = comp.isLocked || false;
            const isHidden = comp.isHidden || false;

            return (
              <div
                key={comp.id}
                onClick={() => onSelectComponent(comp.id)}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#171717] text-white font-medium shadow-xs"
                    : "text-[#171717] hover:bg-[#F7F7F8] border border-transparent hover:border-[#E8E8EA]"
                } ${isHidden ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                  <span
                    className={`text-[10px] font-mono shrink-0 ${
                      isSelected ? "text-white/60" : "text-[#777777]"
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <span className="font-semibold truncate">{comp.type}</span>
                  {comp.props?.title && (
                    <span
                      className={`text-[11px] truncate ${
                        isSelected ? "text-white/70" : "text-[#777777]"
                      }`}
                    >
                      &quot;{comp.props.title}&quot;
                    </span>
                  )}
                </div>

                {/* Layer Quick Controls */}
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {/* Hide Toggle */}
                  {onToggleHideComponent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleHideComponent(activePage.id, comp.id);
                      }}
                      className={`p-1 rounded transition-opacity ${
                        isHidden
                          ? "text-amber-500 opacity-100"
                          : isSelected
                          ? "text-white/60 hover:text-white"
                          : "text-[#777777] opacity-0 group-hover:opacity-100 hover:text-[#171717]"
                      }`}
                      title={isHidden ? "Show component" : "Hide component"}
                    >
                      {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  )}

                  {/* Lock Toggle */}
                  {onToggleLockComponent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLockComponent(activePage.id, comp.id);
                      }}
                      className={`p-1 rounded transition-opacity ${
                        isLocked
                          ? "text-[#D4146E] opacity-100"
                          : isSelected
                          ? "text-white/60 hover:text-white"
                          : "text-[#777777] opacity-0 group-hover:opacity-100 hover:text-[#171717]"
                      }`}
                      title={isLocked ? "Unlock component" : "Lock component"}
                    >
                      {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    </button>
                  )}

                  {/* Reorder Up */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveComponent(activePage.id, idx, "up");
                    }}
                    disabled={idx === 0 || isLocked}
                    className={`p-1 rounded transition-opacity ${
                      isSelected
                        ? "text-white/60 hover:text-white disabled:opacity-20"
                        : "text-[#777777] opacity-0 group-hover:opacity-100 hover:text-[#171717] disabled:opacity-20"
                    }`}
                    title="Move up"
                  >
                    <MoveUp className="w-3 h-3" />
                  </button>

                  {/* Reorder Down */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveComponent(activePage.id, idx, "down");
                    }}
                    disabled={idx === activePage.components.length - 1 || isLocked}
                    className={`p-1 rounded transition-opacity ${
                      isSelected
                        ? "text-white/60 hover:text-white disabled:opacity-20"
                        : "text-[#777777] opacity-0 group-hover:opacity-100 hover:text-[#171717] disabled:opacity-20"
                    }`}
                    title="Move down"
                  >
                    <MoveDown className="w-3 h-3" />
                  </button>

                  {/* Duplicate */}
                  {onDuplicateComponent && !isLocked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateComponent(activePage.id, idx);
                      }}
                      className={`p-1 rounded transition-opacity ${
                        isSelected
                          ? "text-white/60 hover:text-white"
                          : "text-[#777777] opacity-0 group-hover:opacity-100 hover:text-[#171717]"
                      }`}
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}

                  {/* Delete */}
                  {!isLocked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteComponent(activePage.id, idx);
                      }}
                      className={`p-1 rounded transition-opacity ${
                        isSelected
                          ? "text-red-400 hover:text-red-200"
                          : "text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700"
                      }`}
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
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
        title="Create New Page"
        description="Add a new screen or sub-page to your Telegram Mini App or Web App."
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#171717]">Page Title</label>
            <Input
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              placeholder="e.g. Order Tracking, Profile, Special Deals"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#171717]">
              Route Slug (Telegram URL path)
            </label>
            <Input
              value={newPageSlug}
              onChange={(e) => setNewPageSlug(e.target.value)}
              placeholder="e.g. /tracking or leave empty for auto-generated"
              className="text-xs font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddPageOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreatePage}
              disabled={!newPageTitle.trim()}
              className="bg-[#D4146E] hover:bg-[#b0105b] text-white"
            >
              Create Page
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  Send,
  RotateCcw,
  RotateCw,
  CheckCircle2,
  Clock,
  Command,
  Save,
  Paintbrush,
  Workflow,
  GraduationCap,
  Zap
} from "lucide-react";
import { Button } from "@/lib/../components/ui/button";
import { Badge } from "@/lib/../components/ui/badge";
import { Modal } from "@/lib/../components/ui/modal";
import { Input } from "@/lib/../components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useLearningMode } from "@/lib/learning-mode";
import { api } from "@/lib/api";

interface StudioHeaderProps {
  appId: string;
  appName: string;
  appSlug: string;
  versionNumber: number;
  viewport?: "mobile" | "tablet" | "desktop";
  onViewportChange?: (v: "mobile" | "tablet" | "desktop") => void;
  studioMode?: "design" | "logic";
  onStudioModeChange?: (mode: "design" | "logic") => void;
  isPreview?: boolean;
  onPreviewToggle?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
  onPublished?: (newVer: number) => void;
  onOpenCommandPalette?: () => void;
}

export function StudioHeader({
  appId,
  appName,
  appSlug,
  versionNumber,
  viewport = "mobile",
  onViewportChange,
  studioMode = "design",
  onStudioModeChange,
  isPreview = false,
  onPreviewToggle,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  isSaving = false,
  hasUnsavedChanges = false,
  onSave,
  onPublished,
  onOpenCommandPalette,
}: StudioHeaderProps) {
  const { showToast } = useToast();
  const { mode, isBeginner, toggleMode } = useLearningMode();
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [changelog, setChangelog] = useState("Production release snapshot");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<number | null>(null);

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const res = await api.publishApp(appId, changelog);
      setPublishSuccess(res.version_number);
      if (onPublished) onPublished(res.version_number);
      showToast(`Snapshot version ${res.version_number} published successfully!`, "success");
      setTimeout(() => {
        setIsPublishModalOpen(false);
        setPublishSuccess(null);
      }, 1500);
    } catch (err: any) {
      showToast(err.message || "Publishing failed.", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <header className="h-14 border-b border-[#E8E8EA] bg-white px-4 flex items-center justify-between shrink-0 select-none">
        {/* Left: App Title, Version, and Save Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#171717]">{appName}</span>
            <Badge variant="outline" className="text-[11px] font-mono">
              v{versionNumber > 0 ? versionNumber : "draft"}
            </Badge>
          </div>

          <div className="h-4 w-px bg-[#E8E8EA]" />

          {/* Save Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-[#777777]">
            {isSaving ? (
              <>
                <Clock className="w-3.5 h-3.5 animate-spin text-[#D4146E]" />
                <span>Saving...</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-700 font-medium">Unsaved changes</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved</span>
              </>
            )}
          </div>
        </div>

        {/* Center: Mode Toggle & Viewport Switcher */}
        <div className="flex items-center gap-3">
          {/* Design Mode vs Logic Mode */}
          {onStudioModeChange && !isPreview && (
            <div className="flex items-center bg-[#F7F7F8] p-0.5 rounded-lg border border-[#E8E8EA]">
              <button
                onClick={() => onStudioModeChange("design")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  studioMode === "design"
                    ? "bg-white text-[#D4146E] shadow-xs"
                    : "text-[#777777] hover:text-[#171717]"
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5" />
                <span>Design</span>
              </button>
              <button
                onClick={() => onStudioModeChange("logic")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  studioMode === "logic"
                    ? "bg-white text-[#D4146E] shadow-xs"
                    : "text-[#777777] hover:text-[#171717]"
                }`}
              >
                <Workflow className="w-3.5 h-3.5" />
                <span>Logic</span>
              </button>
            </div>
          )}

          {/* Viewport Switcher */}
          {onViewportChange && (
            <div className="flex items-center gap-0.5 bg-[#F7F7F8] p-0.5 rounded-lg border border-[#E8E8EA]">
              <button
                onClick={() => onViewportChange("mobile")}
                className={`p-1.5 rounded transition-colors ${
                  viewport === "mobile"
                    ? "bg-white text-[#D4146E] shadow-xs font-semibold"
                    : "text-[#777777] hover:text-[#171717]"
                }`}
                title="Mobile (390px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewportChange("tablet")}
                className={`p-1.5 rounded transition-colors ${
                  viewport === "tablet"
                    ? "bg-white text-[#D4146E] shadow-xs font-semibold"
                    : "text-[#777777] hover:text-[#171717]"
                }`}
                title="Tablet (768px)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewportChange("desktop")}
                className={`p-1.5 rounded transition-colors ${
                  viewport === "desktop"
                    ? "bg-white text-[#D4146E] shadow-xs font-semibold"
                    : "text-[#777777] hover:text-[#171717]"
                }`}
                title="Desktop (100%)"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Command Palette Trigger */}
          {onOpenCommandPalette && !isPreview && (
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#777777] hover:text-[#171717] bg-[#F7F7F8] hover:bg-[#E8E8EA] border border-[#E8E8EA] rounded-md transition-colors"
              title="Open Command Palette (Cmd+K)"
            >
              <Command className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono text-[10px]">Cmd+K</span>
            </button>
          )}
        </div>

        {/* Right: Actions, Educational Guide & Preview */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          {!isPreview && (
            <div className="flex items-center border border-[#E8E8EA] rounded-md bg-[#F7F7F8] p-0.5">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-1 rounded text-[#777777] hover:text-[#171717] disabled:opacity-30 transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-1 rounded text-[#777777] hover:text-[#171717] disabled:opacity-30 transition-colors"
                title="Redo (Ctrl+Y)"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Beginner Guide Toggle */}
          <button
            onClick={toggleMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
              isBeginner
                ? "bg-amber-50 text-amber-800 border-amber-300 shadow-xs"
                : "bg-white text-[#777777] border-[#E8E8EA] hover:text-[#171717]"
            }`}
            title="Toggle Beginner / Pro Mode"
          >
            {isBeginner ? (
              <>
                <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline font-semibold">Guide</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-[#777777]" />
                <span className="hidden md:inline">Pro</span>
              </>
            )}
          </button>

          {/* Live Preview Toggle */}
          {onPreviewToggle && (
            <Button
              variant={isPreview ? "primary" : "outline"}
              size="sm"
              onClick={onPreviewToggle}
              className={`gap-1.5 text-xs ${isPreview ? "bg-[#171717] hover:bg-[#262626] text-white" : ""}`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPreview ? "Exit Preview" : "Preview"}</span>
            </Button>
          )}

          {/* Save Draft */}
          {onSave && !isPreview && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="gap-1.5 text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </Button>
          )}

          {/* Publish Snapshot */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPublishModalOpen(true)}
            className="gap-1.5 text-xs bg-[#D4146E] hover:bg-[#b0105b] text-white"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish</span>
          </Button>
        </div>
      </header>

      {/* Publish Snapshot Modal */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => !isPublishing && setIsPublishModalOpen(false)}
        title="Publish Production Snapshot"
        description="Creates an immutable snapshot of your application. All changes will be immediately live on Telegram and Standalone Web."
      >
        <div className="space-y-4 pt-2">
          {publishSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900">
                Version {publishSuccess} Published!
              </h4>
              <p className="text-xs text-emerald-700">
                Your application is live and accessible on Telegram Mini App and Web.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#171717]">
                  Release Notes / Changelog
                </label>
                <Input
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  placeholder="e.g. Updated home hero design and added coffee items"
                  className="text-xs"
                />
              </div>

              <div className="rounded-lg bg-[#F7F7F8] p-3 text-xs text-[#777777] space-y-1 border border-[#E8E8EA]">
                <div className="flex justify-between">
                  <span>Current Live Version:</span>
                  <span className="font-mono font-semibold text-[#171717]">v{versionNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Target Version:</span>
                  <span className="font-mono font-semibold text-[#D4146E]">v{versionNumber + 1}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPublishModalOpen(false)}
                  disabled={isPublishing}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="bg-[#D4146E] hover:bg-[#b0105b] text-white"
                >
                  {isPublishing ? "Publishing Snapshot..." : "Confirm & Publish"}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}

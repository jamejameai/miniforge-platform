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
  Clock
} from "lucide-react";
import { Button } from "@/lib/../components/ui/button";
import { Badge } from "@/lib/../components/ui/badge";
import { Modal } from "@/lib/../components/ui/modal";
import { Input } from "@/lib/../components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useLearningMode } from "@/lib/learning-mode";
import { api } from "@/lib/api";
import { GraduationCap, Zap } from "lucide-react";

interface StudioHeaderProps {
  appId: string;
  appName: string;
  appSlug: string;
  versionNumber: number;
  viewport?: "mobile" | "tablet" | "desktop";
  onViewportChange?: (v: "mobile" | "tablet" | "desktop") => void;
  isPreview?: boolean;
  onPreviewToggle?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  isSaving?: boolean;
  onSave?: () => void;
  onPublished?: (newVer: number) => void;
}

export function StudioHeader({
  appId,
  appName,
  appSlug,
  versionNumber,
  viewport = "mobile",
  onViewportChange,
  isPreview = false,
  onPreviewToggle,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  isSaving = false,
  onSave,
  onPublished,
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
        {/* Left: App Title and Version Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[#171717]">{appName}</span>
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
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>All changes saved</span>
              </>
            )}
          </div>
        </div>

        {/* Center: Viewport Switcher & History (when builder active) */}
        {onViewportChange && (
          <div className="flex items-center gap-1 bg-[#F7F7F8] p-1 rounded-md border border-[#E8E8EA]">
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

            <div className="h-3.5 w-px bg-[#E8E8EA] mx-1" />

            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 rounded text-[#777777] hover:text-[#171717] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Undo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 rounded text-[#777777] hover:text-[#171717] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Redo"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Learning Mode Switcher */}
          <button
            onClick={toggleMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
              isBeginner
                ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                : "bg-[#171717] text-white border-[#262626] hover:bg-[#262626]"
            }`}
            title={isBeginner ? "Switch to Pro Mode (Compact Developer Experience)" : "Switch to Beginner Mode (Guided Design & Database Tutorials)"}
          >
            {isBeginner ? (
              <>
                <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[11px] font-semibold">Beginner Guide</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-[#D4146E]" />
                <span className="text-[11px] font-semibold">Pro Mode</span>
              </>
            )}
          </button>

          {onPreviewToggle && (
            <Button
              variant={isPreview ? "secondary" : "outline"}
              size="sm"
              onClick={onPreviewToggle}
              className="gap-1.5 text-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPreview ? "Exit Preview" : "Preview"}</span>
            </Button>
          )}

          {onSave && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              className="text-xs"
              disabled={isSaving}
            >
              Save Draft
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPublishModalOpen(true)}
            className="gap-1.5 text-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish</span>
          </Button>
        </div>
      </header>

      {/* Publish Snapshot Modal */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Publish Application Snapshot"
        description="Creates an immutable version snapshot accessible via Telegram and Standalone Web."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#171717] mb-1">
              Version Release Notes / Changelog
            </label>
            <Input
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              placeholder="e.g. Added catalog filters and new hero banner..."
              className="text-xs"
            />
          </div>

          <div className="p-3 bg-[#F7F7F8] rounded-md border border-[#E8E8EA] space-y-1.5 text-xs text-[#777777]">
            <div className="font-semibold text-[#171717]">Publishing guarantees:</div>
            <div>• Next Version: <span className="font-mono text-[#D4146E]">v{versionNumber + 1}</span></div>
            <div>• Zero-downtime atomic deployment to Telegram and Web</div>
            <div>• Instant rollback supported at any time</div>
          </div>

          {publishSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Version {publishSuccess} published successfully!</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPublishModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePublish}
              disabled={isPublishing || !!publishSuccess}
            >
              {isPublishing ? "Publishing..." : "Confirm & Launch"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}


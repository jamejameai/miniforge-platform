"use client";

import { useState } from "react";
import Link from "next/link";
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
  Zap,
  Database,
  ArrowLeft,
  User,
  Share2
} from "lucide-react";
import { Button } from "@/lib/../components/ui/button";
import { Badge } from "@/lib/../components/ui/badge";
import { Modal } from "@/lib/../components/ui/modal";
import { Input } from "@/lib/../components/ui/input";
import { useToast } from "@/components/ui/toast";
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
  activeTopTab?: "canvas" | "database";
  onTopTabChange?: (tab: "canvas" | "database") => void;
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
  activeTopTab = "canvas",
  onTopTabChange,
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
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [changelog, setChangelog] = useState("Production release snapshot");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<number | null>(null);

  const isPublished = versionNumber > 0;

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const res = await api.publishApp(appId, changelog);
      setPublishSuccess(res.version_number);
      if (onPublished) onPublished(res.version_number);
      showToast(`Version ${res.version_number} published successfully!`, "success");
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
      <header className="h-14 border-b border-[#E2E8F0] bg-white px-5 flex items-center justify-between shrink-0 select-none z-20 shadow-2xs">
        {/* Left Side (Matching Image 1: Logo + Status Badge + App Title + Data Management Link) */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-7 h-7 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs hover:opacity-90 transition-opacity"
            title="Back to Dashboard"
          >
            C
          </Link>

          {/* Status Badge: Published | Pro Plan */}
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isPublished ? `Published (v${versionNumber})` : "Draft"}</span>
            <span className="text-emerald-300">|</span>
            <span>Pro Plan</span>
          </span>

          {/* App Title */}
          <span className="font-bold text-sm text-gray-900 truncate max-w-[180px]">
            {appName}
          </span>

          {/* Data Management Link Button */}
          <Link
            href={`/studio/${appId}/database`}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 rounded-lg transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Database</span>
          </Link>
        </div>

        {/* Center: Pill Capsule Toggle (Canvas | Database) */}
        <div className="flex items-center bg-[#F1F5F9] p-1 rounded-full border border-[#E2E8F0]">
          <button
            onClick={() => onTopTabChange && onTopTabChange("canvas")}
            className={`px-4 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTopTab === "canvas"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Canvas
          </button>
          <button
            onClick={() => onTopTabChange && onTopTabChange("database")}
            className={`px-4 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTopTab === "database"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Database
          </button>
        </div>

        {/* Right Side: ID, Preview Pill, Publish Blue Pill, Avatar */}
        <div className="flex items-center gap-2.5">
          {/* App ID */}
          <span className="hidden md:inline font-mono text-xs text-gray-400">
            ID: {appId.slice(0, 6)}
          </span>

          {/* Preview Button (Rounded Pill with subtle outline) */}
          {onPreviewToggle && (
            <button
              onClick={onPreviewToggle}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isPreview
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {isPreview ? "Back to Edit" : "Preview"}
            </button>
          )}

          {/* Publish Button (Vibrant Blue Pill) */}
          <button
            onClick={() => setIsPublishModalOpen(true)}
            title="Publish"
            className="px-5 py-1.5 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95 transition-all"
          >
            Publish
          </button>

          {/* User Avatar Circle */}
          <div className="w-7 h-7 rounded-full bg-gray-200 border border-gray-300 text-gray-600 flex items-center justify-center font-bold text-xs">
            A
          </div>
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
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900">
                Version {publishSuccess} is now Live!
              </h4>
              <p className="text-xs text-emerald-700">
                Your application is live on Telegram Mini App and Web.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-900">
                  Release Notes
                </label>
                <Input
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  placeholder="e.g. Updated menu layout and product prices"
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="rounded-xl bg-[#F8FAFC] p-3 text-xs text-gray-600 space-y-1 border border-[#E2E8F0]">
                <div className="flex justify-between">
                  <span>Current Version:</span>
                  <span className="font-mono font-semibold text-gray-900">v{versionNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Version:</span>
                  <span className="font-mono font-semibold text-blue-600">v{versionNumber + 1}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPublishModalOpen(false)}
                  disabled={isPublishing}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  {isPublishing ? "Publishing..." : "Publish Application"}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}

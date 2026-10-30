"use client";

import { useEffect, useState, use } from "react";
import {
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Sliders
} from "lucide-react";
import { api } from "@/lib/api";
import { StudioNav } from "@/components/studio/StudioNav";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface PageProps {
  params: Promise<{ appId: string }>;
}

export default function DesignStudioPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams.appId;
  const { showToast } = useToast();

  const [appData, setAppData] = useState<any>(null);
  const [theme, setTheme] = useState({
    primaryColor: "#D4146E",
    primaryDark: "#171717",
    backgroundColor: "#FFFFFF",
    surfaceColor: "#F7F7F8",
    borderColor: "#E8E8EA",
    fontFamily: "Inter, sans-serif",
    borderRadius: "8px",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const app = await api.getApp(appId);
        setAppData(app);
        if (app.draft_spec?.theme) {
          setTheme(app.draft_spec.theme);
        }
      } catch (err) {
        console.error("Failed to load design tokens:", err);
      }
    }
    loadData();
  }, [appId]);

  const handleSaveTheme = async () => {
    if (!appData) return;
    try {
      setIsSaving(true);
      const updatedSpec = {
        ...appData.draft_spec,
        theme,
      };
      await api.updateApp(appId, { draft_spec: updatedSpec });
      setAppData({ ...appData, draft_spec: updatedSpec });
      showToast("Design system tokens saved successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to save theme.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const presets = [
    {
      name: "MiniForge Official",
      primaryColor: "#D4146E",
      primaryDark: "#171717",
      borderRadius: "8px",
      surfaceColor: "#F7F7F8",
    },
    {
      name: "Monochrome Executive",
      primaryColor: "#171717",
      primaryDark: "#000000",
      borderRadius: "4px",
      surfaceColor: "#F4F4F5",
    },
    {
      name: "Nordic Minimalist",
      primaryColor: "#0F766E",
      primaryDark: "#134E4A",
      borderRadius: "10px",
      surfaceColor: "#F0FDFA",
    },
    {
      name: "Electric Indigo",
      primaryColor: "#4F46E5",
      primaryDark: "#312E81",
      borderRadius: "12px",
      surfaceColor: "#EEF2FF",
    },
  ];

  if (!appData) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-xs text-[#777777]">
        Loading Design Studio...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <StudioNav appId={appId} appName={appData.name} appSlug={appData.slug} />

      <div className="flex-1 flex flex-col min-w-0">
        <StudioHeader
          appId={appId}
          appName={appData.name}
          appSlug={appData.slug}
          versionNumber={appData.active_version_number}
        />

        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#171717] tracking-tight">Design System Studio</h2>
              <p className="text-xs text-[#777777] mt-0.5">
                Customize colors, surface elevations, and typographic rules applied uniformly across published runtimes.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveTheme}
              disabled={isSaving}
              className="text-xs font-semibold"
            >
              {isSaving ? "Saving..." : "Save Design Tokens"}
            </Button>
          </div>

          {/* Theme Presets */}
          <div className="bg-white p-6 rounded-xl border border-[#E8E8EA] shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#777777]">
              Curated Theme Presets
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {presets.map((p) => {
                const isSelected = theme.primaryColor === p.primaryColor;
                return (
                  <button
                    key={p.name}
                    onClick={() =>
                      setTheme({
                        ...theme,
                        primaryColor: p.primaryColor,
                        primaryDark: p.primaryDark,
                        borderRadius: p.borderRadius,
                        surfaceColor: p.surfaceColor,
                      })
                    }
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "border-[#D4146E] ring-1 ring-[#D4146E] bg-white shadow-xs"
                        : "border-[#E8E8EA] bg-[#F7F7F8] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: p.primaryColor }} />
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: p.primaryDark }} />
                    </div>
                    <div className="font-semibold text-xs text-[#171717]">{p.name}</div>
                    <div className="text-[10px] text-[#777777] mt-0.5 font-mono">{p.primaryColor}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Design Tokens Configuration Form */}
          <div className="bg-white p-6 rounded-xl border border-[#E8E8EA] shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#777777]">
              Design Tokens
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#171717]">Primary Brand Accent</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="w-9 h-9 rounded border border-[#E8E8EA] cursor-pointer p-0.5 bg-white"
                  />
                  <Input
                    value={theme.primaryColor}
                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#171717]">Primary Dark Surface</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.primaryDark}
                    onChange={(e) => setTheme({ ...theme, primaryDark: e.target.value })}
                    className="w-9 h-9 rounded border border-[#E8E8EA] cursor-pointer p-0.5 bg-white"
                  />
                  <Input
                    value={theme.primaryDark}
                    onChange={(e) => setTheme({ ...theme, primaryDark: e.target.value })}
                    className="font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#171717]">Corner Radius</label>
                <select
                  value={theme.borderRadius}
                  onChange={(e) => setTheme({ ...theme, borderRadius: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-white border border-[#E8E8EA] rounded-md focus:border-[#D4146E] focus:outline-none"
                >
                  <option value="4px">4px (Subtle)</option>
                  <option value="8px">8px (Standard SaaS)</option>
                  <option value="12px">12px (Smooth)</option>
                  <option value="16px">16px (Pill Soft)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#171717]">Font Family</label>
                <Input
                  value={theme.fontFamily}
                  onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


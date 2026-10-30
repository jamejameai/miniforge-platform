"use client";

import { useEffect, useState, use } from "react";
import {
  AppSpec,
  PageSpec,
  ComponentNode,
  DEFAULT_THEME,
  ComponentStyles,
  MotionSpec,
  InteractionRule,
  DataBindingSpec,
  NavigationConfig
} from "@miniforge/app-schema";
import { COMPONENT_REGISTRY } from "@miniforge/component-registry";
import { api } from "@/lib/api";
import { StudioNav } from "@/components/studio/StudioNav";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { ComponentPalette } from "@/components/studio/ComponentPalette";
import { PageTreeNav } from "@/components/studio/PageTreeNav";
import { AssetsManager } from "@/components/studio/AssetsManager";
import { ThemeTokensEditor } from "@/components/studio/ThemeTokensEditor";
import { VisualCanvas } from "@/components/studio/VisualCanvas";
import { PropertiesInspector } from "@/components/studio/PropertiesInspector";
import { CommandPalette } from "@/components/studio/CommandPalette";
import { useToast } from "@/components/ui/toast";
import {
  Layers,
  PlusSquare,
  Palette,
  Image as ImageIcon
} from "lucide-react";

interface PageProps {
  params: Promise<{ appId: string }>;
}

export default function AppStudioPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams.appId;
  const { showToast } = useToast();

  const [appData, setAppData] = useState<any>(null);
  const [appSpec, setAppSpec] = useState<AppSpec | null>(null);
  const [history, setHistory] = useState<AppSpec[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activePageId, setActivePageId] = useState<string>("");
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">("mobile");
  const [studioMode, setStudioMode] = useState<"design" | "logic">("design");
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [leftTab, setLeftTab] = useState<"palette" | "hierarchy" | "tokens" | "assets">("palette");

  // Load app on mount
  useEffect(() => {
    async function loadApp() {
      try {
        const data = await api.getApp(appId);
        setAppData(data);
        const spec = data.draft_spec as AppSpec;
        setAppSpec(spec);
        setHistory([spec]);
        setHistoryIndex(0);
        if (spec.pages && spec.pages.length > 0) {
          const home = spec.pages.find((p) => p.isHome) || spec.pages[0];
          setActivePageId(home.id);
        }
      } catch (err) {
        console.error("Failed to load app:", err);
      }
    }
    loadApp();
  }, [appId]);

  // Push new spec to undo history
  const pushSpecChange = (newSpec: AppSpec) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    setHistory([...updatedHistory, newSpec]);
    setHistoryIndex(updatedHistory.length);
    setAppSpec(newSpec);
    setHasUnsavedChanges(true);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setAppSpec(history[prevIndex]);
      setHasUnsavedChanges(true);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setAppSpec(history[nextIndex]);
      setHasUnsavedChanges(true);
    }
  };

  const handleSave = async () => {
    if (!appSpec) return;
    try {
      setIsSaving(true);
      await api.updateApp(appId, { draft_spec: appSpec });
      setHasUnsavedChanges(false);
      showToast("Draft saved successfully", "success");
    } catch (err: any) {
      console.error("Save failed:", err);
      showToast(err.message || "Failed to save draft.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard Shortcuts (Cmd+S, Cmd+Z, Cmd+Shift+Z, Cmd+K, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if ((e.key === "Backspace" || e.key === "Delete") && !isInput && selectedComponentId) {
        if (!appSpec) return;
        const page = appSpec.pages.find((p) => p.id === activePageId);
        const idx = page?.components.findIndex((c) => c.id === selectedComponentId);
        if (idx !== undefined && idx >= 0 && !page?.components[idx]?.isLocked) {
          e.preventDefault();
          handleDeleteComponent(activePageId, idx);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [appSpec, activePageId, selectedComponentId, historyIndex, history]);

  // Add Component from Palette
  const handleAddComponent = (type: string) => {
    if (!appSpec) return;
    const meta = COMPONENT_REGISTRY[type];
    const newComponent: ComponentNode = {
      id: `comp-${Date.now()}`,
      type,
      props: meta ? { ...meta.defaultProps } : {},
      styles: {},
      motion: { preset: "fadeIn", duration: 350, delay: 0, easing: "spring" },
    };

    const updatedPages = appSpec.pages.map((p) => {
      if (p.id === activePageId) {
        return {
          ...p,
          components: [...p.components, newComponent],
        };
      }
      return p;
    });

    const newSpec = { ...appSpec, pages: updatedPages };
    pushSpecChange(newSpec);
    setSelectedComponentId(newComponent.id);
    setSelectedComponentIds([newComponent.id]);
  };

  // Move Component in Page
  const handleMoveComponent = (pageId: string, compIndex: number, direction: "up" | "down") => {
    if (!appSpec) return;
    const updatedPages = appSpec.pages.map((p) => {
      if (p.id === pageId) {
        const comps = [...p.components];
        const targetIdx = direction === "up" ? compIndex - 1 : compIndex + 1;
        if (targetIdx < 0 || targetIdx >= comps.length) return p;
        const [moved] = comps.splice(compIndex, 1);
        comps.splice(targetIdx, 0, moved);
        return { ...p, components: comps };
      }
      return p;
    });

    pushSpecChange({ ...appSpec, pages: updatedPages });
  };

  // Delete Component in Page
  const handleDeleteComponent = (pageId: string, compIndex: number) => {
    if (!appSpec) return;
    const updatedPages = appSpec.pages.map((p) => {
      if (p.id === pageId) {
        const comps = [...p.components];
        comps.splice(compIndex, 1);
        return { ...p, components: comps };
      }
      return p;
    });

    pushSpecChange({ ...appSpec, pages: updatedPages });
    setSelectedComponentId(null);
    setSelectedComponentIds([]);
  };

  // Duplicate Component
  const handleDuplicateComponent = (pageId: string, compIndex: number) => {
    if (!appSpec) return;
    const page = appSpec.pages.find((p) => p.id === pageId);
    if (!page || compIndex < 0 || compIndex >= page.components.length) return;
    const targetComp = page.components[compIndex];
    const duplicatedComp: ComponentNode = {
      ...targetComp,
      id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      props: JSON.parse(JSON.stringify(targetComp.props || {})),
      styles: targetComp.styles ? JSON.parse(JSON.stringify(targetComp.styles)) : {},
      motion: targetComp.motion ? JSON.parse(JSON.stringify(targetComp.motion)) : undefined,
    };
    const updatedComponents = [...page.components];
    updatedComponents.splice(compIndex + 1, 0, duplicatedComp);
    const updatedPages = appSpec.pages.map((p) =>
      p.id === pageId ? { ...p, components: updatedComponents } : p
    );
    pushSpecChange({ ...appSpec, pages: updatedPages });
    setSelectedComponentId(duplicatedComp.id);
    setSelectedComponentIds([duplicatedComp.id]);
  };

  // Toggle Lock on Component
  const handleToggleLockComponent = (pageId: string, compId: string) => {
    if (!appSpec) return;
    const updatedPages = appSpec.pages.map((p) => {
      if (p.id === pageId) {
        return {
          ...p,
          components: p.components.map((c) =>
            c.id === compId ? { ...c, isLocked: !c.isLocked } : c
          ),
        };
      }
      return p;
    });
    pushSpecChange({ ...appSpec, pages: updatedPages });
  };

  // Toggle Hide on Component
  const handleToggleHideComponent = (pageId: string, compId: string) => {
    if (!appSpec) return;
    const updatedPages = appSpec.pages.map((p) => {
      if (p.id === pageId) {
        return {
          ...p,
          components: p.components.map((c) =>
            c.id === compId ? { ...c, isHidden: !c.isHidden } : c
          ),
        };
      }
      return p;
    });
    pushSpecChange({ ...appSpec, pages: updatedPages });
  };

  // Update Component Props
  const handleUpdateComponentProps = (compId: string, newProps: Record<string, any>) => {
    if (!appSpec) return;
    const updatedPages = appSpec.pages.map((p) => {
      if (p.id === activePageId) {
        return {
          ...p,
          components: p.components.map((c) =>
            c.id === compId ? { ...c, props: newProps } : c
          ),
        };
      }
      return p;
    });
    pushSpecChange({ ...appSpec, pages: updatedPages });
  };

  // Update Component Styles
  const handleUpdateComponentStyles = (compId: string, newStyles: ComponentStyles) => {
    if (!appSpec) return;
    const updatedPages = appSpec.pages.map((p) => {
      if (p.id === activePageId) {
        return {
          ...p,
          components: p.components.map((c) =>
            c.id === compId ? { ...c, styles: newStyles } : c
          ),
        };
      }
      return p;
    });
    pushSpecChange({ ...appSpec, pages: updatedPages });
  };

  // Update Component Motion
  const handleUpdateComponentMotion = (compId: string, newMotion: MotionSpec) => {
    if (!appSpec) return;
    const updatedPages = appSpec.pages.map((p) => {
      if (p.id === activePageId) {
        return {
          ...p,
          components: p.components.map((c) =>
            c.id === compId ? { ...c, motion: newMotion } : c
          ),
        };
      }
      return p;
    });
    pushSpecChange({ ...appSpec, pages: updatedPages });
  };

  // Add Page
  const handleAddPage = (title: string, slug: string) => {
    if (!appSpec) return;
    const newPage: PageSpec = {
      id: `page-${Date.now()}`,
      title,
      slug,
      isHome: false,
      components: [],
    };
    const newSpec = { ...appSpec, pages: [...appSpec.pages, newPage] };
    pushSpecChange(newSpec);
    setActivePageId(newPage.id);
    setSelectedComponentId(null);
    setSelectedComponentIds([]);
  };

  // Delete Page
  const handleDeletePage = (pageId: string) => {
    if (!appSpec || appSpec.pages.length <= 1) return;
    const updatedPages = appSpec.pages.filter((p) => p.id !== pageId);
    const newSpec = { ...appSpec, pages: updatedPages };
    pushSpecChange(newSpec);
    setActivePageId(updatedPages[0].id);
    setSelectedComponentId(null);
    setSelectedComponentIds([]);
  };

  // Update Page Attributes
  const handleUpdatePage = (updates: Partial<PageSpec>) => {
    if (!appSpec) return;
    const updatedPages = appSpec.pages.map((p) => {
      if (p.id === activePageId) {
        return { ...p, ...updates };
      }
      if (updates.isHome) {
        return { ...p, isHome: false };
      }
      return p;
    });
    pushSpecChange({ ...appSpec, pages: updatedPages });
  };

  // Update Theme
  const handleUpdateTheme = (updates: Partial<any>) => {
    if (!appSpec) return;
    const newSpec = {
      ...appSpec,
      theme: { ...appSpec.theme, ...updates },
    };
    pushSpecChange(newSpec);
  };

  // Update Navigation
  const handleUpdateNavigation = (updates: Partial<NavigationConfig>) => {
    if (!appSpec) return;
    const newSpec = {
      ...appSpec,
      navigation: { ...appSpec.navigation, ...updates },
    };
    pushSpecChange(newSpec);
  };

  // Handle Component Selection (Single or Multi with Shift)
  const handleSelectComponent = (id: string | null, isMulti: boolean = false) => {
    if (!id) {
      setSelectedComponentId(null);
      setSelectedComponentIds([]);
      return;
    }

    if (isMulti) {
      if (selectedComponentIds.includes(id)) {
        const next = selectedComponentIds.filter((item) => item !== id);
        setSelectedComponentIds(next);
        setSelectedComponentId(next.length > 0 ? next[next.length - 1] : null);
      } else {
        const next = [...selectedComponentIds, id];
        setSelectedComponentIds(next);
        setSelectedComponentId(id);
      }
    } else {
      setSelectedComponentId(id);
      setSelectedComponentIds([id]);
    }
  };

  if (!appData || !appSpec) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-xs text-[#777777]">
        Loading MiniForge Studio...
      </div>
    );
  }

  const activePage =
    appSpec.pages.find((p) => p.id === activePageId) || appSpec.pages[0];
  const selectedComponent =
    activePage?.components.find((c) => c.id === selectedComponentId) || null;

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Studio Navigation Sidebar */}
      <StudioNav
        appId={appId}
        appName={appData.name}
        appSlug={appData.slug}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <StudioHeader
          appId={appId}
          appName={appData.name}
          appSlug={appData.slug}
          versionNumber={appData.active_version_number}
          viewport={viewport}
          onViewportChange={setViewport}
          studioMode={studioMode}
          onStudioModeChange={setStudioMode}
          isPreview={isPreview}
          onPreviewToggle={() => setIsPreview(!isPreview)}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={handleSave}
          onPublished={(newVer) => setAppData({ ...appData, active_version_number: newVer })}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Builder Work Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Creation & System Tabs */}
          {!isPreview && (
            <div className="w-80 border-r border-[#E8E8EA] bg-white flex flex-col shrink-0">
              {/* Tab Selector */}
              <div className="flex border-b border-[#E8E8EA] bg-[#F7F7F8] p-1 gap-1">
                <button
                  onClick={() => setLeftTab("palette")}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                    leftTab === "palette"
                      ? "bg-white text-[#D4146E] shadow-xs"
                      : "text-[#777777] hover:text-[#171717]"
                  }`}
                  title="Components Library"
                >
                  <PlusSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add</span>
                </button>
                <button
                  onClick={() => setLeftTab("hierarchy")}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                    leftTab === "hierarchy"
                      ? "bg-white text-[#D4146E] shadow-xs"
                      : "text-[#777777] hover:text-[#171717]"
                  }`}
                  title="Pages & Layers"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Layers</span>
                </button>
                <button
                  onClick={() => setLeftTab("tokens")}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                    leftTab === "tokens"
                      ? "bg-white text-[#D4146E] shadow-xs"
                      : "text-[#777777] hover:text-[#171717]"
                  }`}
                  title="Design Tokens"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Theme</span>
                </button>
                <button
                  onClick={() => setLeftTab("assets")}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                    leftTab === "assets"
                      ? "bg-white text-[#D4146E] shadow-xs"
                      : "text-[#777777] hover:text-[#171717]"
                  }`}
                  title="Curated Stock Assets"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Assets</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-hidden">
                {leftTab === "palette" && (
                  <ComponentPalette onAddComponent={handleAddComponent} />
                )}
                {leftTab === "hierarchy" && (
                  <PageTreeNav
                    pages={appSpec.pages}
                    activePageId={activePageId}
                    selectedComponentId={selectedComponentId}
                    onSelectPage={setActivePageId}
                    onSelectComponent={(id) => handleSelectComponent(id)}
                    onAddPage={handleAddPage}
                    onDeletePage={handleDeletePage}
                    onMoveComponent={handleMoveComponent}
                    onDeleteComponent={handleDeleteComponent}
                    onDuplicateComponent={handleDuplicateComponent}
                    onToggleLockComponent={(pageId, compId) => handleToggleLockComponent(pageId, compId)}
                    onToggleHideComponent={(pageId, compId) => handleToggleHideComponent(pageId, compId)}
                  />
                )}
                {leftTab === "tokens" && (
                  <ThemeTokensEditor
                    theme={appSpec.theme || DEFAULT_THEME}
                    navigation={appSpec.navigation}
                    onUpdateTheme={handleUpdateTheme}
                    onUpdateNavigation={handleUpdateNavigation}
                  />
                )}
                {leftTab === "assets" && <AssetsManager />}
              </div>
            </div>
          )}

          {/* Center Canvas */}
          <VisualCanvas
            page={activePage}
            theme={appSpec.theme || DEFAULT_THEME}
            navigation={appSpec.navigation}
            viewport={viewport}
            selectedComponentId={selectedComponentId}
            selectedComponentIds={selectedComponentIds}
            isPreview={isPreview}
            onSelectComponent={handleSelectComponent}
            onMoveComponent={(idx, dir) => handleMoveComponent(activePageId, idx, dir)}
            onDeleteComponent={(idx) => handleDeleteComponent(activePageId, idx)}
            onDuplicateComponent={(idx) => handleDuplicateComponent(activePageId, idx)}
            onToggleLockComponent={(compId) => handleToggleLockComponent(activePageId, compId)}
            onToggleHideComponent={(compId) => handleToggleHideComponent(activePageId, compId)}
            onNavigatePage={setActivePageId}
            onOpenAddModal={() => setLeftTab("palette")}
          />

          {/* Right Inspector */}
          {!isPreview && (
            <PropertiesInspector
              page={activePage}
              theme={appSpec.theme || DEFAULT_THEME}
              allPages={appSpec.pages}
              selectedComponent={selectedComponent}
              onUpdateComponentProps={handleUpdateComponentProps}
              onUpdateComponentStyles={handleUpdateComponentStyles}
              onUpdateComponentMotion={handleUpdateComponentMotion}
              onUpdatePage={handleUpdatePage}
              onUpdateTheme={handleUpdateTheme}
            />
          )}
        </div>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        pages={appSpec.pages}
        onSelectPage={setActivePageId}
        onAddComponent={handleAddComponent}
        onViewportChange={setViewport}
        onTogglePreview={() => setIsPreview(!isPreview)}
        onSave={handleSave}
        onPublish={() => {
          // Open publish modal via studio header trigger or action
          const publishBtn = document.querySelector('button[title="Publish Snapshot"]') as HTMLButtonElement;
          if (publishBtn) publishBtn.click();
        }}
      />
    </div>
  );
}

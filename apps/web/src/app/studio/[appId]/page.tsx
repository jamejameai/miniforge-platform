"use client";

import { useEffect, useState, use } from "react";
import { AppSpec, PageSpec, ComponentNode, DEFAULT_THEME } from "@miniforge/app-schema";
import { COMPONENT_REGISTRY } from "@miniforge/component-registry";
import { api } from "@/lib/api";
import { StudioNav } from "@/components/studio/StudioNav";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { ComponentPalette } from "@/components/studio/ComponentPalette";
import { PageTreeNav } from "@/components/studio/PageTreeNav";
import { VisualCanvas } from "@/components/studio/VisualCanvas";
import { PropertiesInspector } from "@/components/studio/PropertiesInspector";
import { useToast } from "@/components/ui/toast";
import { Layers, PlusSquare } from "lucide-react";

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
  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">("mobile");
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [leftTab, setLeftTab] = useState<"palette" | "hierarchy">("palette");

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
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setAppSpec(history[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setAppSpec(history[nextIndex]);
    }
  };

  const handleSave = async () => {
    if (!appSpec) return;
    try {
      setIsSaving(true);
      await api.updateApp(appId, { draft_spec: appSpec });
      showToast("Draft saved successfully", "success");
    } catch (err: any) {
      console.error("Save failed:", err);
      showToast(err.message || "Failed to save draft.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Add Component from Palette
  const handleAddComponent = (type: string) => {
    if (!appSpec) return;
    const meta = COMPONENT_REGISTRY[type];
    const newComponent: ComponentNode = {
      id: `comp-${Date.now()}`,
      type,
      props: meta ? { ...meta.defaultProps } : {},
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
  };

  // Delete Page
  const handleDeletePage = (pageId: string) => {
    if (!appSpec || appSpec.pages.length <= 1) return;
    const updatedPages = appSpec.pages.filter((p) => p.id !== pageId);
    const newSpec = { ...appSpec, pages: updatedPages };
    pushSpecChange(newSpec);
    setActivePageId(updatedPages[0].id);
    setSelectedComponentId(null);
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
      props: JSON.parse(JSON.stringify(targetComp.props || {}))
    };
    const updatedComponents = [...page.components];
    updatedComponents.splice(compIndex + 1, 0, duplicatedComp);
    const updatedPages = appSpec.pages.map((p) =>
      p.id === pageId ? { ...p, components: updatedComponents } : p
    );
    pushSpecChange({ ...appSpec, pages: updatedPages });
    setSelectedComponentId(duplicatedComp.id);
  };

  // Update Page Attributes
  const handleUpdatePage = (updates: Partial<PageSpec>) => {
    if (!appSpec) return;
    const updatedPages = appSpec.pages.map((p) => {
      if (p.id === activePageId) {
        return { ...p, ...updates };
      }
      if (updates.isHome) {
        // Only one home page allowed
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
          isPreview={isPreview}
          onPreviewToggle={() => setIsPreview(!isPreview)}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          isSaving={isSaving}
          onSave={handleSave}
          onPublished={(newVer) => setAppData({ ...appData, active_version_number: newVer })}
        />

        {/* Builder Work Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Component Palette & Hierarchy Switcher */}
          {!isPreview && (
            <div className="w-72 border-r border-[#E8E8EA] bg-white flex flex-col shrink-0">
              {/* Tab Selector */}
              <div className="flex border-b border-[#E8E8EA] bg-[#F7F7F8] p-1 gap-1">
                <button
                  onClick={() => setLeftTab("palette")}
                  className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    leftTab === "palette"
                      ? "bg-white text-[#D4146E] shadow-xs"
                      : "text-[#777777] hover:text-[#171717]"
                  }`}
                >
                  <PlusSquare className="w-3.5 h-3.5" />
                  <span>Components</span>
                </button>
                <button
                  onClick={() => setLeftTab("hierarchy")}
                  className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    leftTab === "hierarchy"
                      ? "bg-white text-[#D4146E] shadow-xs"
                      : "text-[#777777] hover:text-[#171717]"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Pages & Tree</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-hidden">
                {leftTab === "palette" ? (
                  <ComponentPalette onAddComponent={handleAddComponent} />
                ) : (
                  <PageTreeNav
                    pages={appSpec.pages}
                    activePageId={activePageId}
                    selectedComponentId={selectedComponentId}
                    onSelectPage={setActivePageId}
                    onSelectComponent={setSelectedComponentId}
                    onAddPage={handleAddPage}
                    onDeletePage={handleDeletePage}
                    onMoveComponent={handleMoveComponent}
                    onDeleteComponent={handleDeleteComponent}
                    onDuplicateComponent={handleDuplicateComponent}
                  />
                )}
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
            isPreview={isPreview}
            onSelectComponent={setSelectedComponentId}
            onMoveComponent={(idx, dir) => handleMoveComponent(activePageId, idx, dir)}
            onDeleteComponent={(idx) => handleDeleteComponent(activePageId, idx)}
            onDuplicateComponent={(idx) => handleDuplicateComponent(activePageId, idx)}
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
              onUpdatePage={handleUpdatePage}
              onUpdateTheme={handleUpdateTheme}
            />
          )}
        </div>
      </div>
    </div>
  );
}

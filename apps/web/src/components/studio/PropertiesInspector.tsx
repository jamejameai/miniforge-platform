"use client";

import { PageSpec, ComponentNode, ThemeConfig } from "@miniforge/app-schema";
import { COMPONENT_REGISTRY } from "@miniforge/component-registry";
import {
  Sliders,
  Sparkles,
  Settings,
  Layers,
  Palette,
  MousePointerClick,
  Check
} from "lucide-react";
import { Input } from "@/lib/../components/ui/input";
import { Badge } from "@/lib/../components/ui/badge";

interface PropertiesInspectorProps {
  page: PageSpec;
  theme: ThemeConfig;
  allPages: PageSpec[];
  selectedComponent: ComponentNode | null;
  onUpdateComponentProps: (compId: string, newProps: Record<string, any>) => void;
  onUpdatePage: (updates: Partial<PageSpec>) => void;
  onUpdateTheme: (updates: Partial<ThemeConfig>) => void;
}

export function PropertiesInspector({
  page,
  theme,
  allPages,
  selectedComponent,
  onUpdateComponentProps,
  onUpdatePage,
  onUpdateTheme,
}: PropertiesInspectorProps) {
  if (selectedComponent) {
    const meta = COMPONENT_REGISTRY[selectedComponent.type];
    const props = selectedComponent.props || {};

    const handlePropChange = (key: string, value: any) => {
      onUpdateComponentProps(selectedComponent.id, {
        ...props,
        [key]: value,
      });
    };

    return (
      <aside className="w-80 border-l border-[#E8E8EA] bg-white flex flex-col h-full overflow-y-auto select-none">
        {/* Component Header */}
        <div className="p-4 border-b border-[#E8E8EA] bg-[#F7F7F8]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777777]">
              Properties Inspector
            </span>
            <Badge variant="pink" className="text-[10px] font-mono">
              {selectedComponent.type}
            </Badge>
          </div>
          <h3 className="text-sm font-semibold text-[#171717]">
            {meta?.label || selectedComponent.type}
          </h3>
          <p className="text-[11px] text-[#777777] mt-0.5">{meta?.description}</p>
        </div>

        {/* Component Properties Fields */}
        <div className="p-4 space-y-4 flex-1">
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#777777]">
              Content & Layout
            </div>

            {/* Standard Props Controls */}
            {meta?.propertySchemas.map((schema) => {
              const val = props[schema.name] !== undefined ? props[schema.name] : schema.defaultValue;

              if (schema.type === "boolean") {
                return (
                  <div key={schema.name} className="flex items-center justify-between pt-1">
                    <label className="text-xs font-medium text-[#171717]">{schema.label}</label>
                    <input
                      type="checkbox"
                      checked={!!val}
                      onChange={(e) => handlePropChange(schema.name, e.target.checked)}
                      className="rounded border-[#E8E8EA] text-[#D4146E] focus:ring-[#D4146E] w-4 h-4 cursor-pointer"
                    />
                  </div>
                );
              }

              if (schema.type === "select" && schema.options) {
                return (
                  <div key={schema.name} className="space-y-1">
                    <label className="text-xs font-medium text-[#171717]">{schema.label}</label>
                    <select
                      value={val}
                      onChange={(e) => {
                        const parsed = isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value);
                        handlePropChange(schema.name, parsed);
                      }}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-[#E8E8EA] rounded-md focus:border-[#D4146E] focus:outline-none text-[#171717]"
                    >
                      {schema.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              return (
                <div key={schema.name} className="space-y-1">
                  <label className="text-xs font-medium text-[#171717]">{schema.label}</label>
                  <Input
                    type={schema.type === "number" ? "number" : "text"}
                    value={val || ""}
                    onChange={(e) =>
                      handlePropChange(
                        schema.name,
                        schema.type === "number" ? Number(e.target.value) : e.target.value
                      )
                    }
                    className="h-8 text-xs"
                  />
                </div>
              );
            })}

            {/* Navigation Target (for Buttons and Hero banners) */}
            {(selectedComponent.type === "Button" || selectedComponent.type === "HeroBanner") && (
              <div className="pt-2 border-t border-[#E8E8EA] space-y-1">
                <label className="text-xs font-medium text-[#171717] flex items-center gap-1.5">
                  <MousePointerClick className="w-3.5 h-3.5 text-[#D4146E]" />
                  <span>Click Action (Target Page)</span>
                </label>
                <select
                  value={
                    selectedComponent.type === "Button"
                      ? props.action?.target || ""
                      : props.buttonAction?.target || ""
                  }
                  onChange={(e) => {
                    const targetPageId = e.target.value;
                    if (selectedComponent.type === "Button") {
                      handlePropChange("action", { type: "NAVIGATE", target: targetPageId });
                    } else {
                      handlePropChange("buttonAction", { type: "NAVIGATE", target: targetPageId });
                    }
                  }}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-[#E8E8EA] rounded-md focus:border-[#D4146E] focus:outline-none text-[#171717]"
                >
                  <option value="">No Action / Stay on Page</option>
                  {allPages.map((p) => (
                    <option key={p.id} value={p.id}>
                      Navigate to: {p.title} ({p.slug})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </aside>
    );
  }

  // Page Level & Theme Settings (When no component is selected)
  return (
    <aside className="w-80 border-l border-[#E8E8EA] bg-white flex flex-col h-full overflow-y-auto select-none">
      <div className="p-4 border-b border-[#E8E8EA] bg-[#F7F7F8]">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777777]">
          Page & Theme Settings
        </span>
        <h3 className="text-sm font-semibold text-[#171717] mt-0.5">{page.title}</h3>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* Page Configuration */}
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#777777]">
            Active Page
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#171717]">Page Title</label>
            <Input
              value={page.title}
              onChange={(e) => onUpdatePage({ title: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#171717]">Route Slug</label>
            <Input
              value={page.slug}
              onChange={(e) => onUpdatePage({ slug: e.target.value })}
              className="h-8 text-xs font-mono"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-medium text-[#171717]">Set as Homepage</label>
            <input
              type="checkbox"
              checked={page.isHome}
              onChange={(e) => onUpdatePage({ isHome: e.target.checked })}
              className="rounded border-[#E8E8EA] text-[#D4146E] focus:ring-[#D4146E] w-4 h-4 cursor-pointer"
            />
          </div>
        </div>

        {/* Global Design Tokens */}
        <div className="pt-4 border-t border-[#E8E8EA] space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#777777] flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#D4146E]" />
            <span>Theme Tokens</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#171717]">Primary Brand Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => onUpdateTheme({ primaryColor: e.target.value })}
                className="w-8 h-8 rounded border border-[#E8E8EA] cursor-pointer p-0.5 bg-white"
              />
              <Input
                value={theme.primaryColor}
                onChange={(e) => onUpdateTheme({ primaryColor: e.target.value })}
                className="h-8 text-xs font-mono uppercase"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#171717]">Border Radius</label>
            <select
              value={theme.borderRadius}
              onChange={(e) => onUpdateTheme({ borderRadius: e.target.value })}
              className="w-full h-8 px-2.5 text-xs bg-white border border-[#E8E8EA] rounded-md focus:border-[#D4146E] focus:outline-none text-[#171717]"
            >
              <option value="4px">4px (Subtle)</option>
              <option value="8px">8px (Standard)</option>
              <option value="12px">12px (Smooth)</option>
              <option value="16px">16px (Rounded)</option>
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
}

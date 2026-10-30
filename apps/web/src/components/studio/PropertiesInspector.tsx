"use client";

import { useState } from "react";
import {
  PageSpec,
  ComponentNode,
  ThemeConfig,
  ComponentStyles,
  MotionSpec,
  InteractionRule,
  DataBindingSpec
} from "@miniforge/app-schema";
import { COMPONENT_REGISTRY } from "@miniforge/component-registry";
import {
  Sliders,
  Sparkles,
  Settings,
  Layers,
  Palette,
  MousePointerClick,
  Check,
  Play,
  RotateCcw,
  Zap,
  Layout,
  Eye,
  Database,
  ArrowRight,
  Shield,
  Smartphone
} from "lucide-react";
import { Input } from "@/lib/../components/ui/input";
import { Badge } from "@/lib/../components/ui/badge";
import { Button } from "@/lib/../components/ui/button";

interface PropertiesInspectorProps {
  page: PageSpec;
  theme: ThemeConfig;
  allPages: PageSpec[];
  selectedComponent: ComponentNode | null;
  onUpdateComponentProps: (compId: string, newProps: Record<string, any>) => void;
  onUpdateComponentStyles?: (compId: string, newStyles: ComponentStyles) => void;
  onUpdateComponentMotion?: (compId: string, newMotion: MotionSpec) => void;
  onUpdateComponentInteractions?: (compId: string, interactions: InteractionRule[]) => void;
  onUpdateComponentDataBinding?: (compId: string, binding: DataBindingSpec) => void;
  onUpdatePage: (updates: Partial<PageSpec>) => void;
  onUpdateTheme: (updates: Partial<ThemeConfig>) => void;
}

export function PropertiesInspector({
  page,
  theme,
  allPages,
  selectedComponent,
  onUpdateComponentProps,
  onUpdateComponentStyles,
  onUpdateComponentMotion,
  onUpdateComponentInteractions,
  onUpdateComponentDataBinding,
  onUpdatePage,
  onUpdateTheme,
}: PropertiesInspectorProps) {
  const [activeTab, setActiveTab] = useState<
    "content" | "layout" | "style" | "motion" | "interactions" | "data"
  >("content");
  const [isPlayingMotion, setIsPlayingMotion] = useState(false);

  if (selectedComponent) {
    const meta = COMPONENT_REGISTRY[selectedComponent.type];
    const props = selectedComponent.props || {};
    const styles: ComponentStyles = selectedComponent.styles || {};
    const motion: MotionSpec = selectedComponent.motion || {
      preset: "none",
      duration: 350,
      delay: 0,
      easing: "spring",
    };

    const handlePropChange = (key: string, value: any) => {
      onUpdateComponentProps(selectedComponent.id, {
        ...props,
        [key]: value,
      });
    };

    const handleStyleChange = (key: keyof ComponentStyles, value: any) => {
      if (onUpdateComponentStyles) {
        onUpdateComponentStyles(selectedComponent.id, {
          ...styles,
          [key]: value,
        });
      }
    };

    const handleMotionChange = (key: keyof MotionSpec, value: any) => {
      if (onUpdateComponentMotion) {
        onUpdateComponentMotion(selectedComponent.id, {
          ...motion,
          [key]: value,
        });
      }
    };

    const handleTriggerTestAnimation = () => {
      setIsPlayingMotion(true);
      if (onUpdateComponentMotion) {
        // Temporarily reset then apply to trigger CSS animation restart
        const currentPreset = motion.preset || "fadeIn";
        onUpdateComponentMotion(selectedComponent.id, { ...motion, preset: "none" });
        setTimeout(() => {
          onUpdateComponentMotion(selectedComponent.id, { ...motion, preset: currentPreset });
          setIsPlayingMotion(false);
        }, 80);
      }
    };

    return (
      <aside className="w-80 border-l border-[#E8E8EA] bg-white flex flex-col h-full overflow-hidden select-none">
        {/* Component Header */}
        <div className="p-3 border-b border-[#E8E8EA] bg-[#F7F7F8]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
              Inspector
            </span>
            <Badge variant="pink" className="text-[10px] font-mono">
              {selectedComponent.type}
            </Badge>
          </div>
          <h3 className="text-xs font-bold text-[#171717] truncate">
            {meta?.label || selectedComponent.type}
          </h3>
          <p className="text-[10px] text-[#777777] line-clamp-1 mt-0.5">{meta?.description}</p>
        </div>

        {/* Structured Tabs Bar */}
        <div className="flex border-b border-[#E8E8EA] bg-white overflow-x-auto no-scrollbar">
          {[
            { id: "content", label: "Content" },
            { id: "layout", label: "Layout" },
            { id: "style", label: "Style" },
            { id: "motion", label: "Motion" },
            { id: "interactions", label: "Logic" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3 text-[11px] font-semibold border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "border-[#D4146E] text-[#D4146E] bg-[#D4146E]/5"
                  : "border-transparent text-[#777777] hover:text-[#171717]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* TAB 1: CONTENT */}
          {activeTab === "content" && (
            <div className="space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                Content Properties
              </div>

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

              {/* Navigation Target for Button & HeroBanner */}
              {(selectedComponent.type === "Button" || selectedComponent.type === "HeroBanner") && (
                <div className="pt-2 border-t border-[#E8E8EA] space-y-1">
                  <label className="text-xs font-medium text-[#171717] flex items-center gap-1.5">
                    <MousePointerClick className="w-3.5 h-3.5 text-[#D4146E]" />
                    <span>Click Target Page</span>
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
          )}

          {/* TAB 2: LAYOUT */}
          {activeTab === "layout" && (
            <div className="space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                Dimensions & Spacing
              </div>

              {/* Width Mode */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#171717]">Width</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleStyleChange("width", "full")}
                    className={`py-1 text-xs border rounded-md ${
                      styles.width === "full" || !styles.width
                        ? "border-[#D4146E] bg-[#D4146E]/10 text-[#D4146E] font-semibold"
                        : "border-[#E8E8EA] text-[#171717]"
                    }`}
                  >
                    100% (Fill)
                  </button>
                  <button
                    onClick={() => handleStyleChange("width", "auto")}
                    className={`py-1 text-xs border rounded-md ${
                      styles.width === "auto"
                        ? "border-[#D4146E] bg-[#D4146E]/10 text-[#D4146E] font-semibold"
                        : "border-[#E8E8EA] text-[#171717]"
                    }`}
                  >
                    Auto (Hug)
                  </button>
                </div>
              </div>

              {/* Padding */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#171717]">Padding</label>
                <select
                  value={styles.padding || ""}
                  onChange={(e) => handleStyleChange("padding", e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-[#E8E8EA] rounded-md text-[#171717]"
                >
                  <option value="">Default Component Padding</option>
                  <option value="8px">8px (Compact)</option>
                  <option value="12px">12px (Standard)</option>
                  <option value="16px">16px (Comfortable)</option>
                  <option value="24px">24px (Spacious)</option>
                </select>
              </div>

              {/* Margin */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#171717]">Vertical Spacing (Margin)</label>
                <select
                  value={styles.margin || ""}
                  onChange={(e) => handleStyleChange("margin", e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-[#E8E8EA] rounded-md text-[#171717]"
                >
                  <option value="">Default Spacing</option>
                  <option value="4px 0">4px</option>
                  <option value="8px 0">8px</option>
                  <option value="16px 0">16px</option>
                  <option value="24px 0">24px</option>
                </select>
              </div>

              {/* Text Align */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#171717]">Text Alignment</label>
                <div className="grid grid-cols-3 gap-1">
                  {["left", "center", "right"].map((align) => (
                    <button
                      key={align}
                      onClick={() => handleStyleChange("textAlign", align)}
                      className={`py-1 text-xs border rounded-md capitalize ${
                        styles.textAlign === align
                          ? "border-[#D4146E] bg-[#D4146E]/10 text-[#D4146E] font-semibold"
                          : "border-[#E8E8EA] text-[#171717]"
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STYLE */}
          {activeTab === "style" && (
            <div className="space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                Visual Styling
              </div>

              {/* Background Color */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#171717]">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styles.backgroundColor || "#FFFFFF"}
                    onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                    className="w-8 h-8 rounded border border-[#E8E8EA] cursor-pointer p-0.5 bg-white"
                  />
                  <Input
                    value={styles.backgroundColor || ""}
                    placeholder="#FFFFFF or transparent"
                    onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#171717]">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styles.textColor || "#171717"}
                    onChange={(e) => handleStyleChange("textColor", e.target.value)}
                    className="w-8 h-8 rounded border border-[#E8E8EA] cursor-pointer p-0.5 bg-white"
                  />
                  <Input
                    value={styles.textColor || ""}
                    placeholder="#171717"
                    onChange={(e) => handleStyleChange("textColor", e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Corner Radius Override */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#171717]">Corner Radius</label>
                <select
                  value={styles.borderRadius || ""}
                  onChange={(e) => handleStyleChange("borderRadius", e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-[#E8E8EA] rounded-md text-[#171717]"
                >
                  <option value="">Inherit Theme ({theme.borderRadius})</option>
                  <option value="4px">4px (Subtle)</option>
                  <option value="8px">8px (Standard)</option>
                  <option value="12px">12px (Smooth)</option>
                  <option value="16px">16px (Rounded)</option>
                  <option value="9999px">Pill / Circle</option>
                </select>
              </div>

              {/* Box Shadow */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#171717]">Box Shadow</label>
                <select
                  value={styles.boxShadow || "none"}
                  onChange={(e) => handleStyleChange("boxShadow", e.target.value as any)}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-[#E8E8EA] rounded-md text-[#171717]"
                >
                  <option value="none">None</option>
                  <option value="subtle">Subtle Elevation</option>
                  <option value="medium">Medium Shadow</option>
                  <option value="float">Floating Card</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 4: MOTION STUDIO */}
          {activeTab === "motion" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                  Motion & Animation
                </div>
                <button
                  onClick={handleTriggerTestAnimation}
                  disabled={isPlayingMotion}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#D4146E] hover:underline"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Preview</span>
                </button>
              </div>

              {/* Preset Animation */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#171717]">Entrance Animation</label>
                <select
                  value={motion.preset || "none"}
                  onChange={(e) => handleMotionChange("preset", e.target.value as any)}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-[#E8E8EA] rounded-md text-[#171717]"
                >
                  <option value="none">None (Static)</option>
                  <option value="fadeIn">Fade In</option>
                  <option value="slideUp">Slide Up</option>
                  <option value="slideDown">Slide Down</option>
                  <option value="slideLeft">Slide Left</option>
                  <option value="slideRight">Slide Right</option>
                  <option value="scaleIn">Scale In</option>
                  <option value="bounceIn">Bounce In</option>
                  <option value="pulse">Pulse</option>
                </select>
              </div>

              {/* Duration Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="font-medium text-[#171717]">Duration</label>
                  <span className="font-mono text-[#777777]">{motion.duration || 350}ms</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1200"
                  step="50"
                  value={motion.duration || 350}
                  onChange={(e) => handleMotionChange("duration", Number(e.target.value))}
                  className="w-full accent-[#D4146E] cursor-pointer"
                />
              </div>

              {/* Delay Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="font-medium text-[#171717]">Delay</label>
                  <span className="font-mono text-[#777777]">{motion.delay || 0}ms</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="800"
                  step="50"
                  value={motion.delay || 0}
                  onChange={(e) => handleMotionChange("delay", Number(e.target.value))}
                  className="w-full accent-[#D4146E] cursor-pointer"
                />
              </div>

              {/* Easing Curve */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#171717]">Easing Curve</label>
                <select
                  value={motion.easing || "spring"}
                  onChange={(e) => handleMotionChange("easing", e.target.value as any)}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-[#E8E8EA] rounded-md text-[#171717]"
                >
                  <option value="spring">Spring (Natural iOS physics)</option>
                  <option value="ease-out">Ease Out (Smooth Stop)</option>
                  <option value="ease-in-out">Ease In-Out</option>
                  <option value="linear">Linear</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 5: LOGIC & INTERACTIONS */}
          {activeTab === "interactions" && (
            <div className="space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                Low-Code Logic & Actions
              </div>

              <div className="p-3 bg-[#F7F7F8] rounded-lg border border-[#E8E8EA] space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-[#171717]">
                  <Zap className="w-3.5 h-3.5 text-[#D4146E]" />
                  <span>On Click Trigger</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-[#777777]">Action Type</label>
                  <select
                    value={props.action?.type || "NAVIGATE"}
                    onChange={(e) =>
                      handlePropChange("action", {
                        ...props.action,
                        type: e.target.value,
                      })
                    }
                    className="w-full h-7 px-2 text-xs bg-white border border-[#E8E8EA] rounded text-[#171717]"
                  >
                    <option value="NAVIGATE">Navigate Page</option>
                    <option value="SHOW_TOAST">Show Toast Alert</option>
                    <option value="TELEGRAM_HAPTIC">Telegram Haptic Tap</option>
                    <option value="ADD_TO_CART">Add to Cart</option>
                    <option value="CHECKOUT_CART">Trigger Checkout</option>
                  </select>
                </div>

                {props.action?.type === "SHOW_TOAST" && (
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] text-[#777777]">Toast Message</label>
                    <Input
                      value={props.action?.payload?.message || "Action successful"}
                      onChange={(e) =>
                        handlePropChange("action", {
                          ...props.action,
                          payload: { message: e.target.value },
                        })
                      }
                      className="h-7 text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // Page Level & Theme Settings (When no component is selected)
  return (
    <aside className="w-80 border-l border-[#E8E8EA] bg-white flex flex-col h-full overflow-y-auto select-none">
      <div className="p-3 border-b border-[#E8E8EA] bg-[#F7F7F8]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
          Page & Theme Settings
        </span>
        <h3 className="text-sm font-semibold text-[#171717] mt-0.5">{page.title}</h3>
      </div>

      <div className="p-3 space-y-5 flex-1">
        {/* Page Configuration */}
        <div className="space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
            Active Screen
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
            <label className="text-xs font-medium text-[#171717]">Homepage Screen</label>
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
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#777777] flex items-center gap-1.5">
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

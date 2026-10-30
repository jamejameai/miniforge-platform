"use client";

import { useState } from "react";
import {
  PageSpec,
  ComponentNode,
  ThemeConfig,
  ComponentStyles,
  MotionSpec,
  InteractionRule,
} from "@miniforge/app-schema";
import { COMPONENT_REGISTRY } from "@miniforge/component-registry";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Lock,
  Unlock,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Sliders,
  Play,
  RotateCcw,
  Zap,
  MousePointerClick
} from "lucide-react";
import { Input } from "@/lib/../components/ui/input";
import { Badge } from "@/lib/../components/ui/badge";

interface PropertiesInspectorProps {
  page: PageSpec;
  theme: ThemeConfig;
  allPages: PageSpec[];
  selectedComponent: ComponentNode | null;
  onUpdateComponentProps: (compId: string, newProps: Record<string, any>) => void;
  onUpdateComponentStyles?: (compId: string, newStyles: ComponentStyles) => void;
  onUpdateComponentMotion?: (compId: string, newMotion: MotionSpec) => void;
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
  onUpdatePage,
  onUpdateTheme,
}: PropertiesInspectorProps) {
  const [activeTab, setActiveTab] = useState<"elements" | "style" | "action">("style");
  const [isRatioLocked, setIsRatioLocked] = useState(false);
  const [coordX, setCoordX] = useState("0");
  const [coordY, setCoordY] = useState("0");
  const [pinMode, setPinMode] = useState<"top" | "bottom" | "none">("none");
  const [widthVal, setWidthVal] = useState("390");
  const [heightVal, setHeightVal] = useState("auto");
  const [opacityVal, setOpacityVal] = useState(100);

  if (selectedComponent) {
    const meta = COMPONENT_REGISTRY[selectedComponent.type];
    const props = selectedComponent.props || {};
    const styles: ComponentStyles = selectedComponent.styles || {};
    const motion: MotionSpec = selectedComponent.motion || { preset: "none" };

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

    return (
      <aside className="w-80 border-l border-[#E2E8F0] bg-white flex flex-col h-full overflow-hidden select-none">
        {/* Top Tab Pills (Matching Image 1: エレメント | スタイル | アクション) */}
        <div className="p-3 border-b border-[#E2E8F0] flex items-center justify-center gap-1 bg-[#F8FAFC]">
          <button
            onClick={() => setActiveTab("elements")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTab === "elements"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            エレメント
          </button>
          <button
            onClick={() => setActiveTab("style")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTab === "style"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            スタイル
          </button>
          <button
            onClick={() => setActiveTab("action")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTab === "action"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            アクション
          </button>
        </div>

        {/* Selected Component Title Bar */}
        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-900">
              {meta?.label || selectedComponent.type}
            </span>
            <Badge variant="blue" className="text-[10px] font-mono">
              {selectedComponent.type}
            </Badge>
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {/* TAB 1: スタイル (Style - Exact match to Image 1) */}
          {activeTab === "style" && (
            <>
              {/* Alignment Controls (6 icons) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-gray-500">位置 (Alignment & Position)</span>
                <div className="flex items-center justify-between p-1 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0]">
                  <button
                    onClick={() => handleStyleChange("textAlign", "left")}
                    className="p-1.5 rounded hover:bg-white text-gray-600 hover:text-blue-600 transition-colors"
                    title="Align Left"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStyleChange("textAlign", "center")}
                    className="p-1.5 rounded hover:bg-white text-gray-600 hover:text-blue-600 transition-colors"
                    title="Align Center"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStyleChange("textAlign", "right")}
                    className="p-1.5 rounded hover:bg-white text-gray-600 hover:text-blue-600 transition-colors"
                    title="Align Right"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-px h-3.5 bg-gray-300" />
                  <button
                    className="p-1.5 rounded hover:bg-white text-gray-600 hover:text-blue-600 transition-colors"
                    title="Align Top"
                  >
                    <AlignStartVertical className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-white text-gray-600 hover:text-blue-600 transition-colors"
                    title="Align Middle"
                  >
                    <AlignCenterVertical className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-white text-gray-600 hover:text-blue-600 transition-colors"
                    title="Align Bottom"
                  >
                    <AlignEndVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Coordinates X, Y */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg px-2.5 py-1">
                  <span className="text-[11px] font-mono text-gray-400 mr-2">X</span>
                  <input
                    type="text"
                    value={coordX}
                    onChange={(e) => setCoordX(e.target.value)}
                    className="w-full bg-transparent text-xs text-gray-800 outline-none"
                  />
                </div>
                <div className="flex items-center bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg px-2.5 py-1">
                  <span className="text-[11px] font-mono text-gray-400 mr-2">Y</span>
                  <input
                    type="text"
                    value={coordY}
                    onChange={(e) => setCoordY(e.target.value)}
                    className="w-full bg-transparent text-xs text-gray-800 outline-none"
                  />
                </div>
              </div>

              {/* Constraints / Pinning (上部固定, 下部固定, 固定なし) */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "top", label: "上部固定" },
                  { id: "bottom", label: "下部固定" },
                  { id: "none", label: "固定なし" },
                ].map((pin) => (
                  <button
                    key={pin.id}
                    onClick={() => setPinMode(pin.id as any)}
                    className={`py-1 px-2 rounded-md text-[11px] font-medium border text-center transition-all ${
                      pinMode === pin.id
                        ? "bg-blue-50 border-blue-400 text-blue-600 font-semibold"
                        : "bg-white border-[#E2E8F0] text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {pin.label}
                  </button>
                ))}
              </div>

              {/* Dimensions W, H with Ratio Lock */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-gray-500">サイズ (Size)</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg px-2.5 py-1">
                    <span className="text-[11px] font-mono text-gray-400 mr-2">W</span>
                    <input
                      type="text"
                      value={widthVal}
                      onChange={(e) => {
                        setWidthVal(e.target.value);
                        handleStyleChange("width", e.target.value);
                      }}
                      className="w-full bg-transparent text-xs text-gray-800 outline-none"
                    />
                  </div>
                  <div className="flex-1 flex items-center bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg px-2.5 py-1">
                    <span className="text-[11px] font-mono text-gray-400 mr-2">H</span>
                    <input
                      type="text"
                      value={heightVal}
                      onChange={(e) => {
                        setHeightVal(e.target.value);
                        handleStyleChange("height", e.target.value);
                      }}
                      className="w-full bg-transparent text-xs text-gray-800 outline-none"
                    />
                  </div>
                  <button
                    onClick={() => setIsRatioLocked(!isRatioLocked)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isRatioLocked
                        ? "bg-blue-50 border-blue-300 text-blue-600"
                        : "bg-white border-[#E2E8F0] text-gray-400 hover:text-gray-700"
                    }`}
                    title="Lock aspect ratio"
                  >
                    {isRatioLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Opacity Slider (不透明度 100%) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-500 font-medium">不透明度 (Opacity)</span>
                  <span className="font-mono text-gray-700">{opacityVal}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacityVal}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setOpacityVal(val);
                    handleStyleChange("opacity", val / 100);
                  }}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Typography Section (文字) */}
              <div className="pt-3 border-t border-gray-100 space-y-2.5">
                <span className="text-[11px] font-bold text-gray-800">文字 (Typography)</span>

                {/* Font family */}
                <select
                  value={styles.fontSize || "Inter"}
                  onChange={(e) => handleStyleChange("fontSize", e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-gray-800 outline-none"
                >
                  <option value="Inter">Inter</option>
                  <option value="SF Pro Display">SF Pro Display</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                  <option value="Roboto">Roboto</option>
                </select>

                {/* Weight & Size */}
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={styles.fontWeight || "Regular"}
                    onChange={(e) => handleStyleChange("fontWeight", e.target.value)}
                    className="h-8 px-2 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-gray-800 outline-none"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Medium">Medium</option>
                    <option value="SemiBold">SemiBold</option>
                    <option value="Bold">Bold</option>
                  </select>
                  <select
                    className="h-8 px-2 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-gray-800 outline-none"
                  >
                    <option value="12">12</option>
                    <option value="14">14</option>
                    <option value="16">16</option>
                    <option value="18">18</option>
                    <option value="20">20</option>
                    <option value="24">24</option>
                  </select>
                </div>

                {/* Line Height & Letter Spacing */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg px-2 py-1">
                    <span className="text-[10px] text-gray-400 mr-1.5">行高</span>
                    <span className="text-xs text-gray-800 font-mono">180%</span>
                  </div>
                  <div className="flex items-center bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg px-2 py-1">
                    <span className="text-[10px] text-gray-400 mr-1.5">字間</span>
                    <span className="text-xs text-gray-800 font-mono">0%</span>
                  </div>
                </div>

                {/* Formatting Toggles: B, I, U, S */}
                <div className="flex items-center justify-between p-1 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0]">
                  <button className="p-1 rounded hover:bg-white text-gray-600 hover:text-blue-600">
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 rounded hover:bg-white text-gray-600 hover:text-blue-600">
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 rounded hover:bg-white text-gray-600 hover:text-blue-600">
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 rounded hover:bg-white text-gray-600 hover:text-blue-600">
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-px h-3.5 bg-gray-300" />
                  <button
                    onClick={() => handleStyleChange("textAlign", "left")}
                    className="p-1 rounded hover:bg-white text-gray-600 hover:text-blue-600"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStyleChange("textAlign", "center")}
                    className="p-1 rounded hover:bg-white text-gray-600 hover:text-blue-600"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStyleChange("textAlign", "right")}
                    className="p-1 rounded hover:bg-white text-gray-600 hover:text-blue-600"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: エレメント (Content Properties) */}
          {activeTab === "elements" && (
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-gray-800">コンポーネント設定 (Properties)</span>
              {meta?.propertySchemas.map((schema) => {
                const val = props[schema.name] !== undefined ? props[schema.name] : schema.defaultValue;

                if (schema.type === "boolean") {
                  return (
                    <div key={schema.name} className="flex items-center justify-between pt-1">
                      <label className="text-xs font-medium text-gray-700">{schema.label}</label>
                      <input
                        type="checkbox"
                        checked={!!val}
                        onChange={(e) => handlePropChange(schema.name, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </div>
                  );
                }

                if (schema.type === "select" && schema.options) {
                  return (
                    <div key={schema.name} className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">{schema.label}</label>
                      <select
                        value={val}
                        onChange={(e) => {
                          const parsed = isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value);
                          handlePropChange(schema.name, parsed);
                        }}
                        className="w-full h-8 px-2 text-xs bg-white border border-[#E2E8F0] rounded-lg text-gray-800"
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
                    <label className="text-xs font-medium text-gray-700">{schema.label}</label>
                    <Input
                      type={schema.type === "number" ? "number" : "text"}
                      value={val || ""}
                      onChange={(e) =>
                        handlePropChange(
                          schema.name,
                          schema.type === "number" ? Number(e.target.value) : e.target.value
                        )
                      }
                      className="h-8 text-xs rounded-lg"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: アクション (Navigation Triggers & Workflows) */}
          {activeTab === "action" && (
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-gray-800">クリックアクション (Click Action)</span>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">ターゲット画面 (Target Screen)</label>
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
                  className="w-full h-8 px-2 text-xs bg-white border border-[#E2E8F0] rounded-lg text-gray-800"
                >
                  <option value="">画面遷移なし (No Action)</option>
                  {allPages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.slug})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // Page Level Settings (When no component is selected)
  return (
    <aside className="w-80 border-l border-[#E2E8F0] bg-white flex flex-col h-full overflow-y-auto select-none p-4 space-y-4">
      <div className="pb-3 border-b border-gray-100">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          画面設定 (Screen Settings)
        </span>
        <h3 className="text-sm font-bold text-gray-900 mt-0.5">{page.title}</h3>
      </div>

      <div className="space-y-3 text-xs">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">画面タイトル (Title)</label>
          <Input
            value={page.title}
            onChange={(e) => onUpdatePage({ title: e.target.value })}
            className="h-8 text-xs rounded-lg"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">URLパス (Slug)</label>
          <Input
            value={page.slug}
            onChange={(e) => onUpdatePage({ slug: e.target.value })}
            className="h-8 text-xs font-mono rounded-lg"
          />
        </div>
        <div className="flex items-center justify-between pt-1">
          <label className="text-xs font-medium text-gray-700">ホーム画面に設定</label>
          <input
            type="checkbox"
            checked={page.isHome}
            onChange={(e) => onUpdatePage({ isHome: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
          />
        </div>
      </div>
    </aside>
  );
}

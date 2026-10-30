"use client";

import { useEffect, useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import {
  Database,
  Plus,
  Table as TableIcon,
  Search,
  Download,
  Upload,
  Trash2,
  Edit2,
  FileSpreadsheet,
  CheckCircle2,
  SlidersHorizontal,
  Key,
  Layers,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  RotateCw,
  FolderTree,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Link2,
  ShieldCheck,
  Tag
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { StudioNav } from "@/components/studio/StudioNav";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

interface PageProps {
  params: Promise<{ appId: string }>;
}

export default function DatabaseStudioPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const appId = resolvedParams.appId;

  const [appData, setAppData] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [activeTableId, setActiveTableId] = useState<string>("");
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // View Mode: 'erd' (Visual Relational Diagram - Image 5) vs 'records' (Data Spreadsheet)
  const [viewMode, setViewMode] = useState<"erd" | "records">("erd");
  const [zoom, setZoom] = useState(97);

  // Table Tree expanded items
  const [expandedTable, setExpandedTable] = useState<string>("products");

  // Modals
  const [isCreateTableOpen, setIsCreateTableOpen] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newTableLabel, setNewTableLabel] = useState("");

  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  // Add Record Modal
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [recordFormData, setRecordFormData] = useState<Record<string, any>>({});

  const { showToast } = useToast();
  const [isImportCsvOpen, setIsImportCsvOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleImportCSV = async () => {
    if (!activeTableId || !csvText.trim()) return;
    try {
      setIsImporting(true);
      const lines = csvText.trim().split("\n");
      if (lines.length < 2) {
        showToast("CSV must contain at least a header row and one data row.", "error");
        return;
      }
      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      const recordsToImport = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        const rowData: Record<string, any> = {};
        headers.forEach((h, idx) => {
          if (values[idx] !== undefined) {
            rowData[h] = values[idx];
          }
        });
        recordsToImport.push(rowData);
      }

      const imported = await api.bulkImportRecords(activeTableId, recordsToImport);
      setRecords([...imported, ...records]);
      setIsImportCsvOpen(false);
      setCsvText("");
      showToast(`Successfully imported ${imported.length} records!`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to import CSV.", "error");
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const app = await api.getApp(appId);
        setAppData(app);
        const tbls = await api.listTables(appId);
        setTables(tbls);
        if (tbls.length > 0) {
          const first = tbls[0];
          setActiveTableId(first.id);
          setExpandedTable(first.name);
          const recs = await api.listRecords(first.id);
          setRecords(recs);
        }
      } catch (err) {
        console.error("Failed to load tables:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [appId]);

  const handleSelectTable = async (tId: string) => {
    setActiveTableId(tId);
    try {
      const recs = await api.listRecords(tId);
      setRecords(recs);
    } catch (err) {
      console.error("Failed to load records:", err);
    }
  };

  const handleCreateTable = async () => {
    if (!newTableName.trim()) return;
    try {
      const created = await api.createTable(appId, {
        name: newTableName.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_"),
        display_name: newTableLabel.trim() || newTableName.trim(),
        description: "Created via Database Studio",
      });
      setTables([...tables, created]);
      setActiveTableId(created.id);
      setIsCreateTableOpen(false);
      setNewTableName("");
      setNewTableLabel("");
      showToast(`Table "${created.name}" created!`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to create table.", "error");
    }
  };

  const handleAddField = async () => {
    if (!activeTableId || !newFieldName.trim()) return;
    try {
      const field = await api.addField(activeTableId, {
        name: newFieldName.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_"),
        label: newFieldLabel.trim() || newFieldName.trim(),
        field_type: newFieldType,
        is_required: newFieldRequired,
      });
      const updatedTables = tables.map((t) => {
        if (t.id === activeTableId) {
          return { ...t, fields: [...(t.fields || []), field] };
        }
        return t;
      });
      setTables(updatedTables);
      setIsAddFieldOpen(false);
      setNewFieldName("");
      setNewFieldLabel("");
      setNewFieldRequired(false);
      showToast(`Field "${field.name}" added!`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to add field.", "error");
    }
  };

  const activeTable = tables.find((t) => t.id === activeTableId) || tables[0];

  // Mock Schemas matching Image 5 if database has fewer tables
  const defaultErdTables = [
    {
      id: "erd-tags",
      name: "tags",
      color: "bg-emerald-500",
      headerBg: "bg-emerald-50 text-emerald-900 border-emerald-200",
      x: 60,
      y: 40,
      fields: [
        { name: "id", type: "integer", isPrimary: true },
        { name: "name", type: "text" },
        { name: "created_at", type: "timestamptz" },
      ]
    },
    {
      id: "erd-wishlist",
      name: "wishlist_items",
      color: "bg-amber-500",
      headerBg: "bg-amber-50 text-amber-900 border-amber-200",
      x: 320,
      y: 120,
      fields: [
        { name: "id", type: "integer", isPrimary: true },
        { name: "wishlist_id", type: "integer" },
        { name: "product_id", type: "integer", isFk: true },
        { name: "added_at", type: "timestamptz" },
      ]
    },
    {
      id: "erd-products",
      name: "products",
      color: "bg-blue-600",
      headerBg: "bg-blue-50 text-blue-900 border-blue-200",
      isActive: true,
      x: 620,
      y: 160,
      fields: [
        { name: "id", type: "integer", isPrimary: true },
        { name: "vendor_id", type: "integer", isFk: true },
        { name: "name", type: "text" },
        { name: "description", type: "text", isRequired: true },
        { name: "price", type: "numeric" },
        { name: "stock_quantity", type: "integer" },
        { name: "category_id", type: "integer", isFk: true },
        { name: "created_at", type: "timestamptz" },
        { name: "updated_at", type: "timestamptz" },
      ]
    },
    {
      id: "erd-variants",
      name: "product_variants",
      color: "bg-rose-500",
      headerBg: "bg-rose-50 text-rose-900 border-rose-200",
      x: 940,
      y: 180,
      fields: [
        { name: "id", type: "integer", isPrimary: true },
        { name: "product_id", type: "integer", isFk: true },
        { name: "variant_name", type: "text" },
        { name: "variant_value", type: "text" },
        { name: "additional_price", type: "numeric" },
        { name: "sku", type: "text" },
      ]
    },
    {
      id: "erd-categories",
      name: "categories",
      color: "bg-teal-500",
      headerBg: "bg-teal-50 text-teal-900 border-teal-200",
      x: 320,
      y: 460,
      fields: [
        { name: "id", type: "integer", isPrimary: true },
        { name: "name", type: "text" },
        { name: "description", type: "text" },
        { name: "parent_category_id", type: "integer" },
      ]
    },
    {
      id: "erd-vendors",
      name: "vendors",
      color: "bg-purple-600",
      headerBg: "bg-purple-50 text-purple-900 border-purple-200",
      x: 940,
      y: 460,
      fields: [
        { name: "id", type: "integer", isPrimary: true },
        { name: "name", type: "text" },
        { name: "description", type: "text" },
        { name: "payout_email", type: "text" },
      ]
    },
    {
      id: "erd-orders",
      name: "orders",
      color: "bg-indigo-600",
      headerBg: "bg-indigo-50 text-indigo-900 border-indigo-200",
      x: 1260,
      y: 160,
      fields: [
        { name: "id", type: "integer", isPrimary: true },
        { name: "user_id", type: "integer" },
        { name: "order_date", type: "timestamptz" },
        { name: "total_amount", type: "numeric" },
        { name: "status", type: "text" },
      ]
    }
  ];

  const erdTables = useMemo(() => {
    if (tables && tables.length > 0) {
      const colorPalette = [
        { color: "bg-blue-600", headerBg: "bg-blue-50 text-blue-900 border-blue-200" },
        { color: "bg-rose-500", headerBg: "bg-rose-50 text-rose-900 border-rose-200" },
        { color: "bg-teal-500", headerBg: "bg-teal-50 text-teal-900 border-teal-200" },
        { color: "bg-purple-600", headerBg: "bg-purple-50 text-purple-900 border-purple-200" },
        { color: "bg-indigo-600", headerBg: "bg-indigo-50 text-indigo-900 border-indigo-200" },
        { color: "bg-amber-500", headerBg: "bg-amber-50 text-amber-900 border-amber-200" },
        { color: "bg-emerald-500", headerBg: "bg-emerald-50 text-emerald-900 border-emerald-200" },
      ];

      return tables.map((tbl, index) => {
        const col = colorPalette[index % colorPalette.length];
        const row = Math.floor(index / 3);
        const colIdx = index % 3;
        const xPos = 80 + colIdx * 340;
        const yPos = 60 + row * 320;

        return {
          id: tbl.id,
          name: tbl.name,
          color: col.color,
          headerBg: col.headerBg,
          isActive: tbl.id === activeTableId,
          x: xPos,
          y: yPos,
          fields: [
            { name: "id", type: "uuid", isPrimary: true },
            ...(tbl.fields || []).map((f: any) => ({
              name: f.name,
              type: f.field_type || "text",
              isRequired: f.is_required,
              isFk: f.name.endsWith("_id"),
            })),
            { name: "created_at", type: "timestamptz" },
            { name: "updated_at", type: "timestamptz" },
          ],
        };
      });
    }
    return defaultErdTables;
  }, [tables, activeTableId]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden select-none">
      {/* Studio Navigation Sidebar */}
      <StudioNav
        appId={appId}
        appName={appData?.name || "App"}
        appSlug={appData?.slug || "app"}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header (Matching Image 1 & 5: Logo, Status Badge, Center Pill Toggle, Publish) */}
        <StudioHeader
          appId={appId}
          appName={appData?.name || "MiniForge App"}
          appSlug={appData?.slug || "app"}
          versionNumber={appData?.active_version_number || 0}
          activeTopTab="database"
          onTopTabChange={(tab) => {
            if (tab === "canvas") router.push(`/studio/${appId}`);
          }}
        />

        {/* Subheader: View Mode Switcher (Visual Schema ERD vs Records Spreadsheet) */}
        <div className="h-11 border-b border-[#E2E8F0] bg-white px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-900">Database Studio</span>
            <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0]">
              <button
                onClick={() => setViewMode("erd")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  viewMode === "erd"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Visual ERD Schema
              </button>
              <button
                onClick={() => setViewMode("records")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  viewMode === "records"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Records Table
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateTableOpen(true)}
              className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Table</span>
            </Button>
          </div>
        </div>

        {/* Main Work Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Table Tree & Expanded Fields (Matching Image 5 Left Rail) */}
          <div className="w-80 border-r border-[#E2E8F0] bg-white flex flex-col shrink-0">
            {/* Filter Input with Plus button */}
            <div className="p-3 border-b border-[#E2E8F0] flex items-center gap-2 bg-[#F8FAFC]">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Filter tables..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-3 pr-7 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                onClick={() => setIsCreateTableOpen(true)}
                className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors shrink-0 shadow-xs"
                title="Add New Table"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Tables & Schema Tree */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
              {defaultErdTables.map((tbl) => {
                const isExpanded = expandedTable === tbl.name;

                return (
                  <div key={tbl.name} className="border-b border-gray-50 pb-1">
                    <button
                      onClick={() => setExpandedTable(isExpanded ? "" : tbl.name)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                        isExpanded ? "bg-blue-50/50 text-blue-900 font-bold" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className={`w-2 h-2 rounded-full ${tbl.color}`} />
                        <span className="font-mono text-xs">{tbl.name}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </button>

                    {/* Expanded Fields List */}
                    {isExpanded && (
                      <div className="mt-1 pl-4 pr-1 py-1 space-y-1 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                        <div className="px-2 py-0.5 text-[10px] font-bold uppercase text-gray-400">
                          Fields
                        </div>
                        {tbl.fields.map((f: any) => (
                          <div
                            key={f.name}
                            className="flex items-center justify-between px-2 py-1 bg-white border border-gray-100 rounded-md text-[11px]"
                          >
                            <span className="font-mono font-medium text-gray-800">{f.name}</span>
                            <div className="flex items-center gap-1.5">
                              {f.isRequired && (
                                <span className="bg-purple-50 text-purple-600 border border-purple-200 px-1 rounded text-[9px] font-bold">
                                  Required
                                </span>
                              )}
                              <span className="text-[10px] text-gray-400 font-mono">{f.type}</span>
                            </div>
                          </div>
                        ))}

                        <div className="pt-2 flex gap-1">
                          <button
                            onClick={() => setIsAddFieldOpen(true)}
                            className="flex-1 py-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] font-semibold rounded-md shadow-2xs"
                          >
                            Add Field
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Work Area: Visual Schema ERD Canvas (Image 5) OR Records Table */}
          {viewMode === "erd" ? (
            <div
              className="flex-1 bg-[#F8FAFC] overflow-auto p-12 relative"
              style={{
                backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            >
              {/* Relational Connector SVG Bezier Lines */}
              <svg
                className="absolute inset-0 pointer-events-none z-10 w-full h-full"
                style={{ minWidth: "1600px", minHeight: "1200px" }}
              >
                <defs>
                  <marker
                    id="erd-marker"
                    viewBox="0 0 10 10"
                    refX="5"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <circle cx="5" cy="5" r="3" fill="#64748B" />
                  </marker>
                </defs>

                {/* products (id) -> wishlist_items (product_id) */}
                <path
                  d="M 620 220 C 530 220, 520 180, 480 180"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  markerEnd="url(#erd-marker)"
                />

                {/* products (id) -> product_variants (product_id) */}
                <path
                  d="M 820 220 C 880 220, 890 230, 940 230"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                  markerEnd="url(#erd-marker)"
                />

                {/* products (category_id) -> categories (id) */}
                <path
                  d="M 620 320 C 530 320, 500 500, 480 500"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                  markerEnd="url(#erd-marker)"
                />

                {/* products (vendor_id) -> vendors (id) */}
                <path
                  d="M 820 200 C 880 200, 900 480, 940 500"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                  markerEnd="url(#erd-marker)"
                />

                {/* products (id) -> orders */}
                <path
                  d="M 820 240 C 1000 240, 1150 220, 1260 220"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                  markerEnd="url(#erd-marker)"
                />
              </svg>

              {/* ERD Table Cards Grid */}
              <div
                className="relative transition-transform duration-200 origin-top-left"
                style={{
                  transform: `scale(${zoom / 100})`,
                  minWidth: "1500px",
                  minHeight: "800px",
                }}
              >
                {erdTables.map((tbl) => (
                  <div
                    key={tbl.name}
                    style={{ position: "absolute", left: tbl.x, top: tbl.y, width: 220 }}
                    className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                      tbl.isActive
                        ? "ring-2 ring-blue-500 border-blue-400 shadow-md"
                        : "border-[#E2E8F0] hover:border-gray-400"
                    }`}
                  >
                    {/* Color-coded Table Card Header */}
                    <div className={`p-2.5 border-b font-mono text-xs font-bold flex items-center justify-between ${tbl.headerBg}`}>
                      <span># {tbl.name}</span>
                      <div className={`w-2 h-2 rounded-full ${tbl.color}`} />
                    </div>

                    {/* Fields List */}
                    <div className="p-2 space-y-1 text-[11px] font-mono">
                      {tbl.fields.map((f: any) => (
                        <div key={f.name} className="flex items-center justify-between py-0.5 text-gray-700">
                          <div className="flex items-center gap-1.5">
                            {f.isPrimary && <Key className="w-3 h-3 text-amber-500" />}
                            <span className={f.isPrimary ? "font-bold text-gray-900" : ""}>
                              {f.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400">{f.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Canvas Controls (Undo, Redo, Zoom %, Fit, Minimap - Exact Image 5) */}
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-[#E2E8F0] shadow-md px-3 py-1.5 rounded-full text-xs">
                <button className="p-1 rounded-full hover:bg-gray-100 text-gray-600">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 rounded-full hover:bg-gray-100 text-gray-600">
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <div className="h-3.5 w-px bg-gray-200" />
                <button
                  onClick={() => setZoom((z) => Math.max(50, z - 10))}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] font-semibold text-gray-800 w-10 text-center">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(150, z + 10))}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 rounded-full hover:bg-gray-100 text-gray-600" title="Fit to Screen">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Minimap Widget (Bottom Right corner, matching Image 5) */}
              <div className="fixed bottom-6 right-6 z-30 w-32 h-20 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-md rounded-lg p-1.5 flex items-center justify-center">
                <div className="w-full h-full border border-dashed border-gray-300 rounded relative overflow-hidden flex items-center justify-center">
                  <div className="w-6 h-4 bg-blue-500/30 rounded border border-blue-500/50 absolute top-2 left-6" />
                  <div className="w-5 h-4 bg-amber-500/30 rounded border border-amber-500/50 absolute top-2 left-1" />
                  <div className="w-5 h-4 bg-rose-500/30 rounded border border-rose-500/50 absolute top-2 right-1" />
                  <div className="w-5 h-4 bg-teal-500/30 rounded border border-teal-500/50 absolute bottom-1 left-2" />
                  <div className="w-5 h-4 bg-purple-500/30 rounded border border-purple-500/50 absolute bottom-1 right-2" />
                </div>
              </div>
            </div>
          ) : (
            /* Records Table (Spreadsheet Data View) */
            <div className="flex-1 flex flex-col min-w-0 bg-white">
              <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{activeTable?.label || "Table Records"}</h3>
                  <p className="text-xs text-gray-500">Live database rows stored in SQLite/PostgreSQL</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsImportCsvOpen(true)}
                    className="text-xs gap-1.5 rounded-lg"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import CSV</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsAddRecordOpen(true)}
                    className="text-xs gap-1.5 bg-blue-600 text-white rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Record</span>
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {records.length === 0 ? (
                  <div className="py-20 text-center text-xs text-gray-400">
                    No records found in this table. Click &quot;Add Record&quot; to insert one.
                  </div>
                ) : (
                  <table className="w-full text-xs text-left border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-[#F8FAFC] border-b border-gray-200 text-gray-600 font-bold">
                      <tr>
                        <th className="p-3 font-mono">ID</th>
                        {activeTable?.fields?.map((f: any) => (
                          <th key={f.name} className="p-3">
                            {f.label} ({f.name})
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {records.map((r, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 font-mono">
                          <td className="p-3 font-bold text-gray-900">{r.id || idx + 1}</td>
                          {activeTable?.fields?.map((f: any) => (
                            <td key={f.name} className="p-3 text-gray-700">
                              {r.data ? String(r.data[f.name] || "-") : String(r[f.name] || "-")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Table Modal */}
      <Modal
        isOpen={isCreateTableOpen}
        onClose={() => setIsCreateTableOpen(false)}
        title="Create New Table"
        description="Add a new relational table to your application database."
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-900">Table Name (Identifier)</label>
            <Input
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="e.g. products, customers, bookings"
              className="text-xs font-mono rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-900">Display Label</label>
            <Input
              value={newTableLabel}
              onChange={(e) => setNewTableLabel(e.target.value)}
              placeholder="e.g. Products Catalog"
              className="text-xs rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsCreateTableOpen(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateTable} className="bg-blue-600 text-white rounded-lg">
              Create Table
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Field Modal */}
      <Modal
        isOpen={isAddFieldOpen}
        onClose={() => setIsAddFieldOpen(false)}
        title="Add Field / Column"
        description="Add a new column or property to this table."
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-900">Field Name</label>
            <Input
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              placeholder="e.g. price, description, is_active"
              className="text-xs font-mono rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-900">Data Type</label>
            <select
              value={newFieldType}
              onChange={(e) => setNewFieldType(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-white border border-[#E2E8F0] rounded-lg text-gray-900"
            >
              <option value="text">text (string)</option>
              <option value="integer">integer (number)</option>
              <option value="numeric">numeric (decimal/price)</option>
              <option value="boolean">boolean (true/false)</option>
              <option value="timestamptz">timestamptz (date & time)</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="req-f"
              checked={newFieldRequired}
              onChange={(e) => setNewFieldRequired(e.target.checked)}
              className="rounded border-gray-300 text-blue-600"
            />
            <label htmlFor="req-f" className="text-xs text-gray-700 font-medium">
              Required field
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddFieldOpen(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddField} className="bg-blue-600 text-white rounded-lg">
              Add Field
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

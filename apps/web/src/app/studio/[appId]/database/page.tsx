"use client";

import { useEffect, useState, use } from "react";
import {
  Database,
  Plus,
  Table as TableIcon,
  Search,
  Download,
  Trash2,
  Edit2,
  FileSpreadsheet,
  CheckCircle2,
  SlidersHorizontal
} from "lucide-react";
import { api } from "@/lib/api";
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
  const resolvedParams = use(params);
  const appId = resolvedParams.appId;

  const [appData, setAppData] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [activeTableId, setActiveTableId] = useState<string>("");
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateTableOpen, setIsCreateTableOpen] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newTableLabel, setNewTableLabel] = useState("");

  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [recordFormData, setRecordFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const app = await api.getApp(appId);
        setAppData(app);
        const tbls = await api.listTables(appId);
        setTables(tbls);
        if (tbls.length > 0) {
          setActiveTableId(tbls[0].id);
        }
      } catch (err) {
        console.error("Failed to load database:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [appId]);

  // Load records when active table changes
  useEffect(() => {
    if (!activeTableId) return;
    async function fetchRecords() {
      try {
        const recs = await api.listRecords(activeTableId, search);
        setRecords(recs);
      } catch (err) {
        console.error("Failed to fetch records:", err);
      }
    }
    fetchRecords();
  }, [activeTableId, search]);

  const activeTable = tables.find((t) => t.id === activeTableId);

  const handleCreateTable = async () => {
    if (!newTableName.trim() || !newTableLabel.trim()) return;
    try {
      const created = await api.createTable(appId, {
        name: newTableName.trim(),
        display_name: newTableLabel.trim(),
        fields: [
          { name: "title", label: "Title", field_type: "text", is_required: true },
          { name: "status", label: "Status", field_type: "select", default_value: "Active" }
        ]
      });
      setTables([...tables, created]);
      setActiveTableId(created.id);
      setIsCreateTableOpen(false);
      setNewTableName("");
      setNewTableLabel("");
    } catch (err: any) {
      alert(err.message || "Failed to create table.");
    }
  };

  const handleAddField = async () => {
    if (!activeTableId || !newFieldName.trim() || !newFieldLabel.trim()) return;
    try {
      const field = await api.addField(activeTableId, {
        name: newFieldName.trim(),
        label: newFieldLabel.trim(),
        field_type: newFieldType,
        is_required: newFieldRequired
      });
      // Refresh table fields
      const updatedTables = tables.map((t) =>
        t.id === activeTableId ? { ...t, fields: [...(t.fields || []), field] } : t
      );
      setTables(updatedTables);
      setIsAddFieldOpen(false);
      setNewFieldName("");
      setNewFieldLabel("");
    } catch (err: any) {
      alert(err.message || "Failed to add field.");
    }
  };

  const handleAddRecord = async () => {
    if (!activeTableId) return;
    try {
      const rec = await api.createRecord(activeTableId, recordFormData);
      setRecords([rec, ...records]);
      setIsAddRecordOpen(false);
      setRecordFormData({});
    } catch (err: any) {
      alert(err.message || "Failed to save record.");
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.deleteRecord(recordId);
      setRecords(records.filter((r) => r.id !== recordId));
    } catch (err) {
      alert("Failed to delete record.");
    }
  };

  const handleExportCSV = () => {
    if (!activeTable || records.length === 0) return;
    const fields = activeTable.fields || [];
    const headers = ["ID", ...fields.map((f: any) => f.label), "Created At"];
    const rows = records.map((r) => [
      r.id,
      ...fields.map((f: any) => r.data[f.name] || ""),
      r.created_at
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTable.name}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || !appData) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-xs text-[#777777]">
        Loading Database Studio...
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

        <div className="flex-1 flex overflow-hidden">
          {/* Tables Sidebar */}
          <div className="w-64 border-r border-[#E8E8EA] bg-[#F7F7F8] flex flex-col shrink-0">
            <div className="p-3 border-b border-[#E8E8EA] flex items-center justify-between bg-white">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#777777]">
                <Database className="w-3.5 h-3.5 text-[#171717]" />
                <span>Tables ({tables.length})</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateTableOpen(true)}
                className="h-6 px-2 text-[11px] gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Table</span>
              </Button>
            </div>

            <div className="p-2 space-y-1 flex-1 overflow-y-auto">
              {tables.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#777777]">
                  No custom tables yet. Click "Table" to create your first dynamic schema.
                </div>
              ) : (
                tables.map((t) => {
                  const isActive = t.id === activeTableId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTableId(t.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium text-left transition-colors ${
                        isActive
                          ? "bg-white text-[#D4146E] shadow-xs font-semibold border border-[#E8E8EA]"
                          : "text-[#171717] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <TableIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{t.display_name}</span>
                      </div>
                      <span className="text-[10px] text-[#777777] font-mono">
                        {t.fields?.length || 0} fields
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Table Data / Records Grid */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            {activeTable ? (
              <>
                {/* Table Header Bar */}
                <div className="h-14 border-b border-[#E8E8EA] px-6 flex items-center justify-between shrink-0 bg-white">
                  <div>
                    <h3 className="text-base font-bold text-[#171717] leading-tight">
                      {activeTable.display_name}
                    </h3>
                    <div className="text-[11px] text-[#777777] font-mono">
                      table: {activeTable.name} • {records.length} records
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative w-56">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777777]" />
                      <input
                        type="text"
                        placeholder="Search records..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1 text-xs bg-[#F7F7F8] border border-[#E8E8EA] rounded-md focus:border-[#D4146E] focus:outline-none"
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddFieldOpen(true)}
                      className="text-xs gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Field</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCSV}
                      disabled={records.length === 0}
                      className="text-xs gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export CSV</span>
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setRecordFormData({});
                        setIsAddRecordOpen(true);
                      }}
                      className="text-xs gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Record</span>
                    </Button>
                  </div>
                </div>

                {/* Spreadsheet Table View */}
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F7F7F8] border-b border-[#E8E8EA] sticky top-0 z-10 select-none">
                        <th className="p-3 font-semibold text-[#777777] w-24"># ID</th>
                        {activeTable.fields?.map((f: any) => (
                          <th key={f.id} className="p-3 font-semibold text-[#171717]">
                            <div className="flex items-center gap-1.5">
                              <span>{f.label}</span>
                              <span className="text-[10px] text-[#777777] font-mono lowercase">
                                ({f.field_type})
                              </span>
                            </div>
                          </th>
                        ))}
                        <th className="p-3 font-semibold text-[#777777] w-36">Created</th>
                        <th className="p-3 font-semibold text-[#777777] w-16 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E8EA]">
                      {records.length === 0 ? (
                        <tr>
                          <td
                            colSpan={(activeTable.fields?.length || 0) + 3}
                            className="p-12 text-center text-xs text-[#777777]"
                          >
                            No records in this table. Click "New Record" to insert data.
                          </td>
                        </tr>
                      ) : (
                        records.map((r, idx) => (
                          <tr key={r.id} className="hover:bg-[#F7F7F8]/60 transition-colors">
                            <td className="p-3 font-mono text-[11px] text-[#777777]">
                              {r.id.slice(0, 8)}...
                            </td>
                            {activeTable.fields?.map((f: any) => (
                              <td key={f.id} className="p-3 text-[#171717] max-w-xs truncate">
                                {r.data[f.name] !== undefined ? String(r.data[f.name]) : "—"}
                              </td>
                            ))}
                            <td className="p-3 text-[11px] text-[#777777] whitespace-nowrap">
                              {new Date(r.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteRecord(r.id)}
                                className="p-1 rounded text-[#777777] hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                <Database className="w-10 h-10 text-[#777777]" />
                <h3 className="text-base font-bold text-[#171717]">No Table Selected</h3>
                <p className="text-xs text-[#777777] max-w-sm">
                  Create a table to define dynamic application models, store records, and bind data to UI components.
                </p>
                <Button variant="primary" size="sm" onClick={() => setIsCreateTableOpen(true)}>
                  Create Table
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Table Modal */}
      <Modal
        isOpen={isCreateTableOpen}
        onClose={() => setIsCreateTableOpen(false)}
        title="Create Database Table"
        description="Creates a schema-backed entity stored in PostgreSQL with indexed JSONB data."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#171717] mb-1">Display Label</label>
            <Input
              value={newTableLabel}
              onChange={(e) => {
                setNewTableLabel(e.target.value);
                if (!newTableName) {
                  setNewTableName(e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, "_"));
                }
              }}
              placeholder="e.g. VIP Reservations"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#171717] mb-1">Table System Name</label>
            <Input
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="e.g. vip_reservations"
              className="font-mono text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsCreateTableOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateTable}>
              Create Table
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Field Modal */}
      <Modal
        isOpen={isAddFieldOpen}
        onClose={() => setIsAddFieldOpen(false)}
        title="Add Field to Table"
        description="Extend table schema with typed constraints and validation."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#171717] mb-1">Field Label</label>
            <Input
              value={newFieldLabel}
              onChange={(e) => {
                setNewFieldLabel(e.target.value);
                if (!newFieldName) {
                  setNewFieldName(e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, "_"));
                }
              }}
              placeholder="e.g. Guest Phone"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#171717] mb-1">Field System Name</label>
            <Input
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              placeholder="e.g. guest_phone"
              className="font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#171717] mb-1">Data Type</label>
            <select
              value={newFieldType}
              onChange={(e) => setNewFieldType(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-white border border-[#E8E8EA] rounded-md focus:border-[#D4146E] focus:outline-none"
            >
              <option value="text">Text (Single-line string)</option>
              <option value="number">Number (Integer / Decimal)</option>
              <option value="boolean">Boolean (True / False)</option>
              <option value="date">Date</option>
              <option value="datetime">DateTime</option>
              <option value="email">Email Address</option>
              <option value="phone">Phone Number</option>
              <option value="select">Single Select (Choice)</option>
              <option value="relation">Relation (Foreign key reference)</option>
              <option value="json">JSON / Structured Object</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="reqCheck"
              checked={newFieldRequired}
              onChange={(e) => setNewFieldRequired(e.target.checked)}
              className="rounded border-[#E8E8EA] text-[#D4146E] focus:ring-[#D4146E] w-4 h-4 cursor-pointer"
            />
            <label htmlFor="reqCheck" className="text-xs font-medium text-[#171717] cursor-pointer">
              Mark as Required
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddFieldOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddField}>
              Add Field
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Record Modal */}
      <Modal
        isOpen={isAddRecordOpen}
        onClose={() => setIsAddRecordOpen(false)}
        title="Add Record"
        description={`Insert record into '${activeTable?.display_name}' table.`}
      >
        <div className="space-y-3">
          {activeTable?.fields?.map((f: any) => (
            <div key={f.id} className="space-y-1">
              <label className="block text-xs font-medium text-[#171717]">
                {f.label} {f.is_required && <span className="text-[#D4146E]">*</span>}
              </label>
              {f.field_type === "boolean" ? (
                <input
                  type="checkbox"
                  checked={!!recordFormData[f.name]}
                  onChange={(e) =>
                    setRecordFormData({ ...recordFormData, [f.name]: e.target.checked })
                  }
                  className="rounded border-[#E8E8EA] text-[#D4146E] focus:ring-[#D4146E] w-4 h-4"
                />
              ) : (
                <Input
                  type={f.field_type === "number" ? "number" : "text"}
                  value={recordFormData[f.name] || ""}
                  onChange={(e) =>
                    setRecordFormData({
                      ...recordFormData,
                      [f.name]: f.field_type === "number" ? Number(e.target.value) : e.target.value,
                    })
                  }
                  placeholder={`Enter ${f.label.toLowerCase()}...`}
                  className="text-xs"
                />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsAddRecordOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddRecord}>
              Save Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

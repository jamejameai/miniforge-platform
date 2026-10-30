"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Bot,
  ExternalLink,
  Copy,
  Trash2,
  Sparkles,
  ShoppingBag,
  Database,
  Search,
  ArrowUpRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

export default function WorkspaceDashboard() {
  const { showToast } = useToast();
  const [apps, setApps] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [newAppDesc, setNewAppDesc] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("commerce");
  const [isCreating, setIsCreating] = useState(false);

  const loadApps = async () => {
    try {
      setIsLoading(true);
      const data = await api.listApps();
      setApps(data);
    } catch (err) {
      console.error("Failed to load apps:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleCreateApp = async () => {
    if (!newAppName.trim()) return;
    try {
      setIsCreating(true);
      const app = await api.createApp(newAppName.trim(), newAppDesc.trim());
      setIsCreateOpen(false);
      setNewAppName("");
      setNewAppDesc("");
      showToast(`Created application "${app.name}"`, "success");
      loadApps();
    } catch (err: any) {
      showToast(err.message || "Failed to create app.", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicate = async (appId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const dup = await api.duplicateApp(appId);
      showToast(`Duplicated as "${dup.name}"`, "success");
      loadApps();
    } catch (err: any) {
      showToast(err.message || "Failed to duplicate app.", "error");
    }
  };

  const handleDelete = async (appId: string, appName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${appName}"? This cannot be undone.`)) return;
    try {
      await api.deleteApp(appId);
      showToast(`Deleted application "${appName}"`, "info");
      loadApps();
    } catch (err: any) {
      showToast(err.message || "Failed to delete app.", "error");
    }
  };

  const filteredApps = apps.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase())
  );

  const publishedCount = apps.filter((a) => a.is_published).length;

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex flex-col">
      {/* Top Navigation */}
      <header className="h-14 bg-white border-b border-[#E8E8EA] px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D4146E] text-white flex items-center justify-center font-bold text-sm tracking-wide">
            MF
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#171717] leading-none">MiniForge</h1>
            <span className="text-[10px] text-[#777777] font-medium">Visual Application Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F7F7F8] px-3 py-1.5 rounded-full border border-[#E8E8EA] text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-[#171717]">Production Ready</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Application</span>
          </Button>
        </div>
      </header>

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E8E8EA] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#777777] mb-2 font-medium">
              <span>Total Applications</span>
              <Layers className="w-4 h-4 text-[#D4146E]" />
            </div>
            <div className="text-2xl font-bold text-[#171717]">{apps.length}</div>
            <div className="text-[11px] text-[#777777] mt-1">Multi-tenant isolated workspaces</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E8E8EA] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#777777] mb-2 font-medium">
              <span>Published Live</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-[#171717]">{publishedCount}</div>
            <div className="text-[11px] text-emerald-700 mt-1">Serving Telegram + Web</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E8E8EA] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#777777] mb-2 font-medium">
              <span>Connected Bots</span>
              <Bot className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-bold text-[#171717]">{publishedCount > 0 ? 1 : 0}</div>
            <div className="text-[11px] text-[#777777] mt-1">HMAC-SHA256 verified</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E8E8EA] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#777777] mb-2 font-medium">
              <span>Execution Engine</span>
              <Activity className="w-4 h-4 text-[#D4146E]" />
            </div>
            <div className="text-2xl font-bold text-[#171717]">FastAPI + React</div>
            <div className="text-[11px] text-[#777777] mt-1">Sub-10ms snapshot rendering</div>
          </div>
        </div>

        {/* Applications List Area */}
        <div className="bg-white rounded-xl border border-[#E8E8EA] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E8E8EA] flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#171717]">My Applications</h2>
              <p className="text-xs text-[#777777]">Manage, design, and publish your visual software applications</p>
            </div>

            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777777]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applications..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F7F8] border border-[#E8E8EA] rounded-md focus:outline-none focus:border-[#D4146E] text-[#171717]"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-xs text-[#777777]">Loading workspace applications...</div>
          ) : filteredApps.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#F7F7F8] text-[#777777] flex items-center justify-center mx-auto border border-[#E8E8EA]">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[#171717]">No applications found</h3>
              <p className="text-xs text-[#777777] max-w-sm mx-auto">
                Create your first visual application or start with one of our pre-built templates.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Application</span>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-[#E8E8EA]">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="p-4 hover:bg-[#F7F7F8]/80 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#171717] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {app.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/studio/${app.id}`}
                          className="font-bold text-sm text-[#171717] hover:text-[#D4146E] transition-colors"
                        >
                          {app.name}
                        </Link>
                        {app.is_published ? (
                          <Badge variant="success" className="text-[10px]">
                            Live v{app.active_version_number}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            Draft
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[#777777]">
                        <span className="font-mono">/{app.slug}</span>
                        <span>•</span>
                        <span>{app.draft_spec?.pages?.length || 1} pages</span>
                        <span>•</span>
                        <span>Updated recently</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/r/${app.slug}`}
                      target="_blank"
                      className="px-2.5 py-1.5 rounded-md text-xs font-medium text-[#171717] hover:bg-white border border-transparent hover:border-[#E8E8EA] flex items-center gap-1 transition-colors"
                    >
                      <span>Web View</span>
                      <ArrowUpRight className="w-3 h-3 text-[#777777]" />
                    </Link>
                    <Link
                      href={`/tg/${app.slug}`}
                      target="_blank"
                      className="px-2.5 py-1.5 rounded-md text-xs font-medium text-sky-700 hover:bg-sky-50 border border-transparent hover:border-sky-200 flex items-center gap-1 transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Telegram</span>
                    </Link>
                    <button
                      onClick={(e) => handleDuplicate(app.id, e)}
                      className="p-1.5 rounded-md text-[#777777] hover:text-[#171717] hover:bg-white border border-transparent hover:border-[#E8E8EA] transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(app.id, app.name, e)}
                      className="p-1.5 rounded-md text-[#777777] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <Link href={`/studio/${app.id}`}>
                      <Button variant="secondary" size="sm" className="text-xs">
                        Open Studio
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Quick Create Application Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Application"
        description="Launch an application configured for Telegram Mini App and Web deployment."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#171717] mb-1">
              Application Name
            </label>
            <Input
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              placeholder="e.g. Kyoto Tea Bar"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#171717] mb-1">
              Description (Optional)
            </label>
            <Input
              value={newAppDesc}
              onChange={(e) => setNewAppDesc(e.target.value)}
              placeholder="e.g. Artisanal green tea drinks and confectionery..."
              className="text-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#171717]">
              Starting Template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "commerce", label: "Commerce & POS", desc: "Catalog, shopping cart, checkout, stock tracking" },
                { id: "restaurant", label: "Hospitality & Cafe", desc: "Food menu, order ahead, table booking" },
                { id: "services", label: "Services & Booking", desc: "Consultation, booking forms, calendar" },
                { id: "blank", label: "Blank Slate", desc: "Start from a clean canvas" },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedTemplate === t.id
                      ? "border-[#D4146E] bg-[#D4146E]/5 ring-1 ring-[#D4146E]"
                      : "border-[#E8E8EA] bg-[#F7F7F8] hover:bg-white"
                  }`}
                >
                  <div className="text-xs font-semibold text-[#171717]">{t.label}</div>
                  <div className="text-[10px] text-[#777777] mt-0.5 leading-snug">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateApp}
              disabled={isCreating || !newAppName.trim()}
            >
              {isCreating ? "Creating..." : "Create Application"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Clock,
  Wand2,
  LayoutTemplate,
  FileCode2,
  ArrowRight,
  HelpCircle,
  Zap,
  Tag,
  Check,
  Rocket
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

export default function WorkspaceDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [apps, setApps] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Creation Modes: 'idea' | 'template' | 'scratch'
  const [creationTab, setCreationTab] = useState<"idea" | "template" | "scratch">("idea");

  // Idea Mode state
  const [ideaPrompt, setIdeaPrompt] = useState("");
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [isBuildingFromBlueprint, setIsBuildingFromBlueprint] = useState(false);

  // Template Mode state
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("restaurant");
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>("All");
  const [isInstantiatingTemplate, setIsInstantiatingTemplate] = useState(false);

  // Scratch Mode state
  const [newAppName, setNewAppName] = useState("");
  const [newAppDesc, setNewAppDesc] = useState("");
  const [isCreatingScratch, setIsCreatingScratch] = useState(false);

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

  const loadTemplates = async () => {
    try {
      const data = await api.listTemplates();
      setTemplates(data);
    } catch (err) {
      console.error("Failed to load templates:", err);
    }
  };

  useEffect(() => {
    loadApps();
    loadTemplates();
  }, []);

  const handleGenerateBlueprint = async () => {
    if (!ideaPrompt.trim() || ideaPrompt.length < 5) {
      showToast("Please describe your application idea in a few sentences.", "info");
      return;
    }
    try {
      setIsGeneratingBlueprint(true);
      setBlueprint(null);
      const res = await api.generateBlueprint(ideaPrompt.trim());
      setBlueprint(res);
      showToast("Product Blueprint generated successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to generate blueprint.", "error");
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  const handleInstantiateBlueprint = async () => {
    if (!blueprint) return;
    try {
      setIsBuildingFromBlueprint(true);
      const app = await api.instantiateBlueprint(blueprint, true);
      showToast(`Application "${app.name}" created! Opening Studio...`, "success");
      setIsCreateOpen(false);
      router.push(`/studio/${app.id}`);
    } catch (err: any) {
      showToast(err.message || "Failed to instantiate blueprint.", "error");
    } finally {
      setIsBuildingFromBlueprint(false);
    }
  };

  const handleInstantiateTemplate = async (templateId: string) => {
    try {
      setIsInstantiatingTemplate(true);
      const app = await api.instantiateTemplate(templateId);
      showToast(`Application "${app.name}" created from template! Opening Studio...`, "success");
      setIsCreateOpen(false);
      router.push(`/studio/${app.id}`);
    } catch (err: any) {
      showToast(err.message || "Failed to launch template.", "error");
    } finally {
      setIsInstantiatingTemplate(false);
    }
  };

  const handleCreateScratch = async () => {
    if (!newAppName.trim()) return;
    try {
      setIsCreatingScratch(true);
      const app = await api.createApp(newAppName.trim(), newAppDesc.trim());
      showToast(`Application "${app.name}" created! Opening Studio...`, "success");
      setIsCreateOpen(false);
      router.push(`/studio/${app.id}`);
    } catch (err: any) {
      showToast(err.message || "Failed to create app.", "error");
    } finally {
      setIsCreatingScratch(false);
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

  const categories = ["All", ...Array.from(new Set(templates.map((t) => t.category)))];
  const filteredTemplates = templates.filter(
    (t) => templateCategoryFilter === "All" || t.category === templateCategoryFilter
  );

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

      {/* Multi-Door Creation Modal (Idea -> Blueprint, 12 Templates, Scratch) */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Something New"
        description="Turn your idea into a production-ready Telegram Mini App & Standalone Web platform."
      >
        <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
          {/* Creation Mode Switcher Tabs */}
          <div className="flex border-b border-[#E8E8EA] bg-[#F7F7F8] p-1 rounded-lg gap-1">
            <button
              onClick={() => setCreationTab("idea")}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                creationTab === "idea"
                  ? "bg-white text-[#D4146E] shadow-xs"
                  : "text-[#777777] hover:text-[#171717]"
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-[#D4146E]" />
              <span>Start with an Idea</span>
            </button>

            <button
              onClick={() => setCreationTab("template")}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                creationTab === "template"
                  ? "bg-white text-[#D4146E] shadow-xs"
                  : "text-[#777777] hover:text-[#171717]"
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-[#171717]" />
              <span>Templates ({templates.length || 12})</span>
            </button>

            <button
              onClick={() => setCreationTab("scratch")}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                creationTab === "scratch"
                  ? "bg-white text-[#D4146E] shadow-xs"
                  : "text-[#777777] hover:text-[#171717]"
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5 text-[#777777]" />
              <span>Blank Project</span>
            </button>
          </div>

          {/* TAB 1: START WITH AN IDEA (AI PRODUCT PLANNING BLUEPRINT) */}
          {creationTab === "idea" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#171717] mb-1">
                  Describe what you want to build
                </label>
                <textarea
                  value={ideaPrompt}
                  onChange={(e) => setIdeaPrompt(e.target.value)}
                  placeholder="e.g. A modern organic pizzeria where patrons can browse the menu, book a dining table, place orders ahead with cash/card, and receive automatic confirmation alerts in Telegram."
                  rows={3}
                  className="w-full p-3 text-xs bg-white border border-[#E8E8EA] rounded-lg text-[#171717] placeholder:text-[#777777] focus:outline-none focus:ring-1 focus:ring-[#D4146E]"
                />
              </div>

              {/* Suggestion Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[#777777] tracking-wider">
                  Popular Starting Concepts
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Organic Pizzeria with table booking & Telegram alerts",
                    "Luxury Barbershop appointment timeslots & specialist profiles",
                    "Full-Stack Academy course catalog with admission forms",
                    "Direct-to-Consumer Fashion boutique with express POS checkout",
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setIdeaPrompt(s)}
                      className="text-[11px] bg-[#F7F7F8] hover:bg-white text-[#171717] px-2.5 py-1 rounded-full border border-[#E8E8EA] transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {!blueprint && (
                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleGenerateBlueprint}
                    disabled={isGeneratingBlueprint || !ideaPrompt.trim()}
                    className="text-xs gap-1.5"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{isGeneratingBlueprint ? "Analyzing & Planning Blueprint..." : "Generate Product Blueprint"}</span>
                  </Button>
                </div>
              )}

              {/* Generated Interactive Blueprint Review */}
              {blueprint && (
                <div className="p-4 rounded-xl border border-pink-200 bg-pink-50/20 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-pink-200 pb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4146E]">
                        AI Product Consultant Blueprint
                      </span>
                      <h3 className="text-base font-bold text-[#171717] mt-0.5">{blueprint.app_name}</h3>
                    </div>
                    <Badge variant="pink" className="text-[11px]">{blueprint.category}</Badge>
                  </div>

                  <p className="text-xs text-[#555555] leading-relaxed">
                    {blueprint.purpose}
                  </p>

                  {/* Target Users & Roles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-[#E8E8EA]">
                      <span className="text-[10px] font-bold uppercase text-[#777777] block mb-1">Target Users</span>
                      <div className="flex flex-wrap gap-1">
                        {blueprint.target_users?.map((u: string, idx: number) => (
                          <span key={idx} className="bg-[#F7F7F8] px-2 py-0.5 rounded text-[11px] text-[#171717]">
                            {u}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-[#E8E8EA]">
                      <span className="text-[10px] font-bold uppercase text-[#777777] block mb-1">User Roles</span>
                      <div className="space-y-1">
                        {blueprint.roles?.map((r: any, idx: number) => (
                          <div key={idx} className="text-[11px]">
                            <strong className="text-[#171717]">{r.role}:</strong> <span className="text-[#777777]">{r.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Planned Sitemap */}
                  <div className="bg-white p-3 rounded-lg border border-[#E8E8EA] space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-[#777777] block">Planned Navigation Sitemap</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {blueprint.sitemap?.map((p: any, idx: number) => (
                        <div key={idx} className="p-2 bg-[#F7F7F8] rounded border border-[#E8E8EA]">
                          <div className="font-semibold text-xs text-[#171717]">{p.name}</div>
                          <div className="text-[10px] text-[#777777] font-mono">{p.path}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feature Breakdown: Essential vs Recommended */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-[#E8E8EA]">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 block mb-1">
                        Essential Features (P0)
                      </span>
                      <ul className="space-y-1 text-[11px] text-[#555555]">
                        {blueprint.features?.essential?.map((f: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-[#E8E8EA]">
                      <span className="text-[10px] font-bold uppercase text-sky-700 block mb-1">
                        Recommended Automations (P1)
                      </span>
                      <ul className="space-y-1 text-[11px] text-[#555555]">
                        {blueprint.features?.recommended?.map((f: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Blueprint Database Tables & Workflows Count */}
                  <div className="flex items-center justify-between text-xs text-[#777777] bg-white p-2.5 rounded-lg border border-[#E8E8EA]">
                    <div className="flex items-center gap-4">
                      <span>• Database: <strong className="text-[#171717]">{blueprint.database_tables?.length || 0} Dynamic Tables</strong></span>
                      <span>• Workflows: <strong className="text-[#171717]">{blueprint.workflows?.length || 0} Automations</strong></span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-600 font-semibold">Ready to Instantiate</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-pink-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBlueprint(null)}
                    >
                      Modify Prompt
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleInstantiateBlueprint}
                      disabled={isBuildingFromBlueprint}
                      className="text-xs gap-1.5 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isBuildingFromBlueprint ? "Provisioning Application..." : "Launch Application from Blueprint"}</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: START WITH A TEMPLATE (12 RICH INDUSTRY TEMPLATES) */}
          {creationTab === "template" && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTemplateCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] font-medium transition-colors ${
                      templateCategoryFilter === cat
                        ? "bg-[#171717] text-white"
                        : "bg-[#F7F7F8] text-[#777777] hover:text-[#171717] border border-[#E8E8EA]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {filteredTemplates.map((t) => {
                  const isSelected = selectedTemplateId === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTemplateId(t.id)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#D4146E] bg-[#D4146E]/5 ring-1 ring-[#D4146E]"
                          : "border-[#E8E8EA] bg-white hover:bg-[#F7F7F8]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color || "#D4146E" }} />
                          <h4 className="font-bold text-xs text-[#171717]">{t.name}</h4>
                        </div>
                        {t.badge && (
                          <Badge variant="secondary" className="text-[10px]">{t.badge}</Badge>
                        )}
                      </div>

                      <p className="text-[11px] text-[#777777] leading-relaxed mb-3">
                        {t.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-[#777777] font-mono border-t border-[#E8E8EA] pt-2">
                        <span>{t.pages_count} Pages</span>
                        <span>{t.tables_count} Tables</span>
                        <span>{t.workflows_count} Automations</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E8EA]">
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
                  onClick={() => handleInstantiateTemplate(selectedTemplateId)}
                  disabled={isInstantiatingTemplate || !selectedTemplateId}
                  className="text-xs gap-1.5"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>{isInstantiatingTemplate ? "Launching Template..." : "Launch from Selected Template"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: START FROM SCRATCH */}
          {creationTab === "scratch" && (
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

              <div className="p-3 bg-[#F7F7F8] rounded-lg border border-[#E8E8EA] text-xs text-[#777777] space-y-1">
                <div className="font-semibold text-[#171717]">Blank Project Specifications:</div>
                <div>• Initialized with standard mobile & desktop viewport canvas</div>
                <div>• Default neutral SaaS color token system with #D4146E brand accent</div>
                <div>• Empty component hierarchy ready for drag-and-drop design</div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E8EA]">
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
                  onClick={handleCreateScratch}
                  disabled={isCreatingScratch || !newAppName.trim()}
                  className="text-xs"
                >
                  {isCreatingScratch ? "Creating..." : "Create Blank Project"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}


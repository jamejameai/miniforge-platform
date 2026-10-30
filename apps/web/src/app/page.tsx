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
  Rocket,
  Cpu,
  Brain,
  Bell,
  CreditCard,
  Key,
  Sliders,
  Users,
  ShieldCheck,
  Receipt,
  FileText,
  Boxes,
  Plug,
  Mail,
  Moon,
  ChevronRight,
  Globe,
  Smartphone
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
  const [activeNavTab, setActiveNavTab] = useState("apps");

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
      setBlueprint(res.blueprint);
      showToast("Product Blueprint generated!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to generate blueprint.", "error");
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  const handleBuildFromBlueprint = async () => {
    if (!blueprint) return;
    try {
      setIsBuildingFromBlueprint(true);
      const res = await api.instantiateBlueprint(blueprint);
      showToast(`Created application "${res.app.name}"!`, "success");
      setIsCreateOpen(false);
      router.push(`/studio/${res.app.id}`);
    } catch (err: any) {
      showToast(err.message || "Failed to create app from blueprint.", "error");
    } finally {
      setIsBuildingFromBlueprint(false);
    }
  };

  const handleInstantiateTemplate = async () => {
    try {
      setIsInstantiatingTemplate(true);
      const res = await api.instantiateTemplate(selectedTemplateId);
      showToast(`Instantiated template "${res.app.name}"!`, "success");
      setIsCreateOpen(false);
      router.push(`/studio/${res.app.id}`);
    } catch (err: any) {
      showToast(err.message || "Failed to instantiate template.", "error");
    } finally {
      setIsInstantiatingTemplate(false);
    }
  };

  const handleCreateScratch = async () => {
    if (!newAppName.trim()) {
      showToast("Please provide an application name.", "error");
      return;
    }
    try {
      setIsCreatingScratch(true);
      const app = await api.createApp(
        newAppName.trim(),
        newAppDesc.trim() || undefined
      );
      showToast("Application created successfully!", "success");
      setIsCreateOpen(false);
      router.push(`/studio/${app.id}`);
    } catch (err: any) {
      showToast(err.message || "Failed to create application.", "error");
    } finally {
      setIsCreatingScratch(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await api.deleteApp(id);
      showToast(`Deleted "${name}"`, "success");
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* LEFT NAVIGATION SIDEBAR (Exact match to Appy/MiniForge Reference) */}
      <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col shrink-0 select-none">
        {/* Brand Logo Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">MiniForge</h1>
            <p className="text-[11px] text-gray-400 font-medium">Build native apps</p>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Section: DASHBOARD */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Dashboard
            </div>
            <button
              onClick={() => setActiveNavTab("apps")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeNavTab === "apps"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Apps</span>
            </button>
            <button
              onClick={() => setActiveNavTab("assistant")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeNavTab === "assistant"
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Assistant</span>
            </button>
            <button
              onClick={() => setActiveNavTab("notifications")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeNavTab === "notifications"
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>
            <button
              onClick={() => setActiveNavTab("billing")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeNavTab === "billing"
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Billing</span>
            </button>
            <button
              onClick={() => setActiveNavTab("api_keys")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeNavTab === "api_keys"
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Key className="w-4 h-4" />
              <span>API Keys</span>
            </button>
            <button
              onClick={() => setActiveNavTab("settings")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeNavTab === "settings"
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>

          {/* Section: ADMINISTRATION */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Administration
            </div>
            {[
              { id: "overview", label: "Overview", icon: Activity },
              { id: "users", label: "Users", icon: Users },
              { id: "subscriptions", label: "Subscriptions", icon: ShieldCheck },
              { id: "transactions", label: "Transactions", icon: Receipt },
              { id: "plans", label: "Plans", icon: Tag },
              { id: "builders", label: "Builders", icon: Boxes },
              { id: "plugins", label: "Plugins", icon: Plug },
              { id: "email_templates", label: "Email Templates", icon: Mail },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNavTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeNavTab === item.id
                      ? "bg-blue-600 text-white shadow-xs font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between text-gray-400">
          <button className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <Moon className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono">v1.2.0</span>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Row with Icon, Title, and Create Button */}
        <header className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">Apps</h2>
              <p className="text-xs text-gray-500">Create and manage your applications</p>
            </div>
          </div>

          <Button
            variant="primary"
            size="default"
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-2.5 shadow-sm active:scale-95 transition-all text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create App</span>
          </Button>
        </header>

        {/* Search Bar Input */}
        <div className="px-8 py-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search apps by name or URL..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#E2E8F0] rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs transition-all"
            />
          </div>
        </div>

        {/* Apps Grid (3 Columns, Exact Appy Layout) */}
        <main className="p-8 pt-4">
          {isLoading ? (
            <div className="py-20 text-center text-xs text-gray-400">Loading your applications...</div>
          ) : filteredApps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No applications found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Start by creating your first application or pick from 12 pre-built templates.
              </p>
              <Button
                variant="primary"
                onClick={() => setIsCreateOpen(true)}
                className="bg-blue-600 text-white text-xs gap-1.5 rounded-xl mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create App Now</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps.map((app, index) => {
                const isPublished = (app.active_version_number || 0) > 0;
                // Alternate tags for visual variety matching screenshot
                const layoutTags = [
                  "<> App Bar + Drawer",
                  "<> Blank",
                  "<> App Bar + Tabs",
                  "<> Navigation Rail"
                ];
                const tag = layoutTags[index % layoutTags.length];

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs hover:shadow-card hover:border-blue-200 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: App Icon & Deployment Badges */}
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                          <Brain className="w-6 h-6" />
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Telegram + Web</span>
                          </span>
                          <span className="inline-flex items-center text-[10px] font-mono text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                            {tag}
                          </span>
                        </div>
                      </div>

                      {/* App Name & URL */}
                      <div className="mt-4">
                        <h3 className="text-base font-bold text-gray-900 truncate">{app.name}</h3>
                        <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">
                          https://miniforge.app/r/{app.slug}
                        </p>
                      </div>

                      {/* Build Status Tag */}
                      <div className="mt-3 text-xs">
                        {isPublished ? (
                          <span className="text-gray-500">
                            Latest build: <strong className="text-emerald-600 font-semibold">Completed (v{app.active_version_number})</strong>
                          </span>
                        ) : (
                          <span className="text-gray-400">No builds yet (Draft)</span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Buttons: Edit (Blue) & Delete (Red Outline) */}
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
                      <Link
                        href={`/studio/${app.id}`}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl text-center shadow-xs transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(app.id, app.name)}
                        className="flex-1 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-xl text-center transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Creation Modal (Retaining AI Blueprint, 12 Templates & Blank options) */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Application"
        description="Choose how you want to build your visual Telegram Mini App or Web App."
      >
        <div className="space-y-4 pt-2">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-[#E2E8F0] gap-4 text-xs font-semibold">
            <button
              onClick={() => setCreationTab("idea")}
              className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors ${
                creationTab === "idea"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-400 hover:text-gray-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Idea Blueprint</span>
            </button>
            <button
              onClick={() => setCreationTab("template")}
              className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors ${
                creationTab === "template"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-400 hover:text-gray-900"
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Templates (12)</span>
            </button>
            <button
              onClick={() => setCreationTab("scratch")}
              className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors ${
                creationTab === "scratch"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-400 hover:text-gray-900"
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Blank Project</span>
            </button>
          </div>

          {/* TAB 1: AI IDEA BLUEPRINT */}
          {creationTab === "idea" && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-900">
                Describe your application idea in plain English:
              </label>
              <textarea
                value={ideaPrompt}
                onChange={(e) => setIdeaPrompt(e.target.value)}
                placeholder="e.g. A boutique bakery in Paris with an artisan pastry menu, cart, pickup order confirmation, and low-stock inventory alerts."
                className="w-full h-24 p-3 text-xs bg-white border border-[#E2E8F0] rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
              />

              {blueprint ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-blue-900 flex items-center justify-between">
                    <span>{blueprint.appName}</span>
                    <Badge variant="blue" className="text-[10px]">
                      Ready
                    </Badge>
                  </div>
                  <p className="text-[11px] text-blue-800">{blueprint.tagline}</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleBuildFromBlueprint}
                    disabled={isBuildingFromBlueprint}
                    className="w-full bg-blue-600 text-white rounded-xl text-xs gap-1"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Instantiate & Open Studio</span>
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleGenerateBlueprint}
                  disabled={isGeneratingBlueprint || !ideaPrompt.trim()}
                  className="w-full bg-blue-600 text-white rounded-xl text-xs gap-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>{isGeneratingBlueprint ? "Analyzing & Planning..." : "Generate Product Blueprint"}</span>
                </Button>
              )}
            </div>
          )}

          {/* TAB 2: 12 INDUSTRY TEMPLATES */}
          {creationTab === "template" && (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-2">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-3 rounded-xl border cursor-pointer text-left transition-all ${
                      selectedTemplateId === tpl.id
                        ? "border-blue-600 bg-blue-50/50 shadow-xs"
                        : "border-[#E2E8F0] hover:border-gray-400"
                    }`}
                  >
                    <h5 className="font-bold text-xs text-gray-900">{tpl.name}</h5>
                    <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">{tpl.description}</p>
                  </div>
                ))}
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleInstantiateTemplate}
                disabled={isInstantiatingTemplate}
                className="w-full bg-blue-600 text-white rounded-xl text-xs gap-1"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Instantiate Selected Template</span>
              </Button>
            </div>
          )}

          {/* TAB 3: BLANK PROJECT */}
          {creationTab === "scratch" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-900">Application Name</label>
                <Input
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="e.g. My Custom App"
                  className="text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-900">Description (Optional)</label>
                <Input
                  value={newAppDesc}
                  onChange={(e) => setNewAppDesc(e.target.value)}
                  placeholder="Brief summary..."
                  className="text-xs rounded-xl"
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateScratch}
                disabled={isCreatingScratch || !newAppName.trim()}
                className="w-full bg-blue-600 text-white rounded-xl text-xs gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Blank Application</span>
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

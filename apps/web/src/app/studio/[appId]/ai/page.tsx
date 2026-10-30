"use client";

import { useEffect, useState, use } from "react";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileCode,
  Layers,
  Database,
  GitBranch,
  RefreshCw,
  Zap,
  Check
} from "lucide-react";
import { api } from "@/lib/api";
import { StudioNav } from "@/components/studio/StudioNav";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ appId: string }>;
}

export default function AIStudioPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams.appId;

  const [appData, setAppData] = useState<any>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const app = await api.getApp(appId);
        setAppData(app);
      } catch (err) {
        console.error("Failed to load app:", err);
      }
    }
    loadData();
  }, [appId]);

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.length < 5) {
      alert("Please enter a more descriptive prompt for your application.");
      return;
    }
    try {
      setIsGenerating(true);
      setAiResult(null);
      setIsApplied(false);
      const res = await api.generateAppSpec(prompt.trim());
      setAiResult(res);
    } catch (err: any) {
      alert(err.message || "AI generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySpec = async () => {
    if (!aiResult) return;
    try {
      setIsApplying(true);
      await api.applyAISpec(appId, aiResult.suggested_spec);
      setIsApplied(true);
      alert("AI application specification applied successfully to your application draft!");
    } catch (err: any) {
      alert(err.message || "Failed to apply AI specification.");
    } finally {
      setIsApplying(false);
    }
  };

  const promptExamples = [
    "Build a gourmet artisanal bakery with croissant preorder, custom cake inquiries, and customer feedback",
    "Create a boutique specialty coffee shop with espresso drinks, bean subscriptions, and member loyalty",
    "Build an upscale Italian pizzeria with build-your-own pizza, beverage pairings, and table reservations",
    "Create a modern fitness studio with personal training session bookings, trainer profiles, and workout tracking",
  ];

  if (!appData) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-xs text-[#777777]">
        Loading AI Studio...
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

        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
          {/* AI Banner */}
          <div className="p-6 rounded-2xl border border-[#D4146E]/20 bg-linear-to-b from-[#D4146E]/5 to-transparent space-y-2">
            <div className="flex items-center gap-2 text-[#D4146E]">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Application Architect</span>
            </div>
            <h2 className="text-xl font-bold text-[#171717] tracking-tight">
              Design Software at the Speed of Thought
            </h2>
            <p className="text-xs text-[#777777] max-w-2xl leading-relaxed">
              Describe what kind of application you want to build. MiniForge AI analyzes your requirements,
              generates structured JSON application schemas, constructs responsive pages and components, creates custom database models, and wires automated workflows.
            </p>
          </div>

          {/* Prompt Input Box */}
          <div className="bg-white p-6 rounded-xl border border-[#E8E8EA] shadow-xs space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#171717]">Describe your application</label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Build an artisan sourdough bakery with bread preorder, custom cake catalog, shopping cart, and order alerts to Telegram..."
                className="w-full p-3 text-xs bg-[#F7F7F8] border border-[#E8E8EA] rounded-lg focus:border-[#D4146E] focus:outline-none leading-relaxed"
              />
            </div>

            {/* Quick Prompt Ideas */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#777777]">Try a prompt template:</span>
              <div className="flex flex-wrap gap-1.5">
                {promptExamples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(ex)}
                    className="text-[11px] text-[#171717] bg-[#F7F7F8] hover:bg-white hover:border-[#D4146E] border border-[#E8E8EA] px-2.5 py-1 rounded-md text-left transition-colors"
                  >
                    "{ex.slice(0, 48)}..."
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="default"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="text-xs font-semibold gap-2 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGenerating ? "Synthesizing Architecture..." : "Generate Application Spec"}</span>
              </Button>
            </div>
          </div>

          {/* AI Result Spec & Diff Preview */}
          {aiResult && (
            <div className="bg-white rounded-xl border border-[#E8E8EA] shadow-xs overflow-hidden space-y-6 p-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#E8E8EA] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#171717]">
                      {aiResult.app_name}
                    </h3>
                    <Badge variant="pink" className="text-[10px]">AI Generated</Badge>
                  </div>
                  <p className="text-xs text-[#777777] mt-0.5">{aiResult.description}</p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApplySpec}
                  disabled={isApplying || isApplied}
                  className="gap-1.5 text-xs font-semibold"
                >
                  {isApplied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Applied to Draft</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isApplying ? "Applying..." : "Apply Specification"}</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Summary of Changes */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                  Architecture Plan & Component Breakdown
                </span>
                <div className="p-3 bg-[#F7F7F8] rounded-lg border border-[#E8E8EA] space-y-1.5">
                  {aiResult.summary_of_changes?.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#171717]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pages & Components Generated */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-[#E8E8EA] bg-[#F7F7F8] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#171717]">
                    <Layers className="w-4 h-4 text-[#D4146E]" />
                    <span>Pages ({aiResult.suggested_spec.pages?.length})</span>
                  </div>
                  <ul className="text-xs text-[#777777] space-y-1">
                    {aiResult.suggested_spec.pages?.map((p: any) => (
                      <li key={p.id} className="flex justify-between bg-white px-2.5 py-1.5 rounded border border-[#E8E8EA]">
                        <span className="font-semibold text-[#171717]">{p.title}</span>
                        <span className="font-mono text-[10px] text-[#777777]">{p.components?.length} components</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-lg border border-[#E8E8EA] bg-[#F7F7F8] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#171717]">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span>Custom Tables ({aiResult.suggested_tables?.length})</span>
                  </div>
                  <ul className="text-xs text-[#777777] space-y-1">
                    {aiResult.suggested_tables?.map((t: any, i: number) => (
                      <li key={i} className="flex justify-between bg-white px-2.5 py-1.5 rounded border border-[#E8E8EA]">
                        <span className="font-semibold text-[#171717]">{t.display_name}</span>
                        <span className="font-mono text-[10px] text-[#777777]">{t.fields?.length} fields</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Raw JSON Spec Inspection */}
              <details className="group">
                <summary className="text-xs font-semibold text-[#777777] cursor-pointer hover:text-[#171717] flex items-center gap-1.5 select-none">
                  <FileCode className="w-3.5 h-3.5 text-[#D4146E]" />
                  <span>Inspect Generated AppSpec JSON</span>
                </summary>
                <pre className="mt-2 p-3 bg-[#171717] text-white rounded-lg text-[11px] font-mono overflow-x-auto max-h-80">
                  {JSON.stringify(aiResult.suggested_spec, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, use } from "react";
import {
  GitBranch,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Send,
  Zap,
  SlidersHorizontal,
  Layers
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

export default function WorkflowStudioPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams.appId;

  const [appData, setAppData] = useState<any>(null);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>("");
  const [executions, setExecutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Workflow Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWfName, setNewWfName] = useState("");
  const [newWfTrigger, setNewWfTrigger] = useState("ORDER_CREATED");
  const [newWfConditionField, setNewWfConditionField] = useState("total");
  const [newWfConditionOp, setNewWfConditionOp] = useState("greater_than");
  const [newWfConditionVal, setNewWfConditionVal] = useState("0");
  const [newWfActionMsg, setNewWfActionMsg] = useState("Order #{{order_number}} placed! Total: ${{total}}");

  // Test Runner state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const app = await api.getApp(appId);
      setAppData(app);
      const wfs = await api.listWorkflows(appId);
      setWorkflows(wfs);
      if (wfs.length > 0) {
        setActiveWorkflowId(wfs[0].id);
      }
    } catch (err) {
      console.error("Failed to load workflows:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [appId]);

  useEffect(() => {
    if (!activeWorkflowId) return;
    async function loadExecutions() {
      try {
        const execs = await api.listWorkflowExecutions(activeWorkflowId);
        setExecutions(execs);
      } catch (err) {
        console.error("Failed to load executions:", err);
      }
    }
    loadExecutions();
  }, [activeWorkflowId]);

  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId);

  const handleCreateWorkflow = async () => {
    if (!newWfName.trim()) return;
    try {
      const created = await api.createWorkflow(appId, {
        name: newWfName.trim(),
        trigger_type: newWfTrigger,
        conditions: [
          {
            field: newWfConditionField,
            operator: newWfConditionOp,
            value: newWfConditionVal,
          },
        ],
        actions: [
          {
            type: "TELEGRAM_NOTIFICATION",
            params: { message: newWfActionMsg },
          },
        ],
      });
      setWorkflows([...workflows, created]);
      setActiveWorkflowId(created.id);
      setIsCreateOpen(false);
      setNewWfName("");
    } catch (err: any) {
      alert(err.message || "Failed to create workflow.");
    }
  };

  const handleRunTest = async () => {
    if (!activeWorkflow) return;
    try {
      setIsTesting(true);
      setTestResult(null);
      const payload = {
        order_number: "ORD-9988",
        total: "42.50",
        customer_name: "Morgan Freeman",
        customer_telegram_id: "12345678",
      };
      const res = await api.runTestWorkflow(activeWorkflow.id, payload);
      setTestResult(res);
      // Refresh execution history
      const execs = await api.listWorkflowExecutions(activeWorkflow.id);
      setExecutions(execs);
    } catch (err: any) {
      alert(err.message || "Workflow test failed.");
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading || !appData) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-xs text-[#777777]">
        Loading Workflow Studio...
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
          {/* Workflows Left List */}
          <div className="w-64 border-r border-[#E8E8EA] bg-[#F7F7F8] flex flex-col shrink-0">
            <div className="p-3 border-b border-[#E8E8EA] flex items-center justify-between bg-white">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#777777]">
                <GitBranch className="w-3.5 h-3.5 text-[#171717]" />
                <span>Automations ({workflows.length})</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="h-6 px-2 text-[11px] gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </Button>
            </div>

            <div className="p-2 space-y-1 flex-1 overflow-y-auto">
              {workflows.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#777777]">
                  No workflows created yet. Click "New" to design an automation.
                </div>
              ) : (
                workflows.map((w) => {
                  const isActive = w.id === activeWorkflowId;
                  return (
                    <button
                      key={w.id}
                      onClick={() => setActiveWorkflowId(w.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium text-left transition-colors ${
                        isActive
                          ? "bg-white text-[#D4146E] shadow-xs font-semibold border border-[#E8E8EA]"
                          : "text-[#171717] hover:bg-white"
                      }`}
                    >
                      <div className="truncate">
                        <div className="truncate">{w.name}</div>
                        <div className="text-[10px] text-[#777777] font-mono mt-0.5">{w.trigger_type}</div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Workflow Designer Canvas & Execution Logs */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            {activeWorkflow ? (
              <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#171717]">{activeWorkflow.name}</h2>
                    <p className="text-xs text-[#777777] mt-0.5">
                      Server-side automation pipeline executing transactionally on backend events.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleRunTest}
                    disabled={isTesting}
                    className="text-xs gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isTesting ? "Executing Pipeline..." : "Test Trigger"}</span>
                  </Button>
                </div>

                {/* Visual Flow Representation */}
                <div className="p-6 rounded-xl border border-[#E8E8EA] bg-[#F7F7F8] space-y-4 shadow-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                    Automation Execution Flow
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-3">
                    {/* Node 1: Trigger */}
                    <div className="flex-1 bg-white p-4 rounded-lg border border-[#E8E8EA] shadow-xs w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                          Step 1: Trigger
                        </span>
                        <Zap className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="font-bold text-xs text-[#171717]">{activeWorkflow.trigger_type}</div>
                      <div className="text-[11px] text-[#777777] mt-0.5">When event is fired in backend</div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[#777777] shrink-0 hidden md:block" />

                    {/* Node 2: Conditions */}
                    <div className="flex-1 bg-white p-4 rounded-lg border border-[#E8E8EA] shadow-xs w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                          Step 2: Condition
                        </span>
                        <SlidersHorizontal className="w-4 h-4 text-sky-500" />
                      </div>
                      <div className="font-bold text-xs text-[#171717]">
                        {activeWorkflow.conditions?.[0]?.field || "condition"}{" "}
                        {activeWorkflow.conditions?.[0]?.operator || "=="}{" "}
                        {activeWorkflow.conditions?.[0]?.value || "value"}
                      </div>
                      <div className="text-[11px] text-[#777777] mt-0.5">Verifies payload rules</div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[#777777] shrink-0 hidden md:block" />

                    {/* Node 3: Actions */}
                    <div className="flex-1 bg-white p-4 rounded-lg border border-[#E8E8EA] shadow-xs w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4146E]">
                          Step 3: Action
                        </span>
                        <Send className="w-4 h-4 text-[#D4146E]" />
                      </div>
                      <div className="font-bold text-xs text-[#171717]">
                        {activeWorkflow.actions?.[0]?.type || "Action"}
                      </div>
                      <div className="text-[11px] text-[#777777] mt-0.5 truncate">
                        {activeWorkflow.actions?.[0]?.params?.message || "Execute payload"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Result Output Box */}
                {testResult && (
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Workflow Pipeline Executed ({testResult.duration_ms}ms)</span>
                      </span>
                      <Badge variant="success" className="text-[10px]">{testResult.status}</Badge>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-emerald-200 font-mono text-[11px] space-y-1">
                      {testResult.logs.map((log: string, i: number) => (
                        <div key={i} className="text-[#171717]">{log}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audit Execution History */}
                <div className="bg-white rounded-xl border border-[#E8E8EA] overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-[#E8E8EA] bg-[#F7F7F8] flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#171717]">Execution Audit History</h3>
                    <span className="text-xs text-[#777777]">{executions.length} runs</span>
                  </div>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F7F7F8] border-b border-[#E8E8EA] text-[#777777] font-semibold">
                        <th className="p-3">Run Timestamp</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Trigger Payload Sample</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E8EA]">
                      {executions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-[#777777]">
                            No previous runs. Click "Test Trigger" to execute this automation.
                          </td>
                        </tr>
                      ) : (
                        executions.map((ex) => (
                          <tr key={ex.id} className="hover:bg-[#F7F7F8]/50">
                            <td className="p-3 text-[11px] text-[#777777]">
                              {new Date(ex.created_at).toLocaleString()}
                            </td>
                            <td className="p-3">
                              <Badge
                                variant={ex.status === "SUCCESS" ? "success" : "warning"}
                                className="text-[10px]"
                              >
                                {ex.status}
                              </Badge>
                            </td>
                            <td className="p-3 font-mono text-[#171717]">{ex.duration_ms}ms</td>
                            <td className="p-3 font-mono text-[11px] text-[#777777] truncate max-w-xs">
                              {JSON.stringify(ex.trigger_payload)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <GitBranch className="w-10 h-10 text-[#777777]" />
                <h3 className="text-base font-bold text-[#171717]">No Workflow Selected</h3>
                <p className="text-xs text-[#777777] max-w-sm">
                  Design triggers, conditions, and actions to automate real business logic.
                </p>
                <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
                  Create Workflow
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Workflow Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Workflow"
        description="Configure automated actions when events occur in your application."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#171717] mb-1">Workflow Name</label>
            <Input
              value={newWfName}
              onChange={(e) => setNewWfName(e.target.value)}
              placeholder="e.g. Alert On High Value Order"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#171717] mb-1">Event Trigger</label>
            <select
              value={newWfTrigger}
              onChange={(e) => setNewWfTrigger(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-white border border-[#E8E8EA] rounded-md focus:border-[#D4146E] focus:outline-none"
            >
              <option value="ORDER_CREATED">When POS Order is Placed</option>
              <option value="LOW_STOCK">When Product Stock is Low</option>
              <option value="RECORD_CREATED">When Database Record is Created</option>
            </select>
          </div>

          <div className="p-3 bg-[#F7F7F8] rounded-lg border border-[#E8E8EA] space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">
              Condition Rule
            </span>
            <div className="grid grid-cols-3 gap-2">
              <Input
                value={newWfConditionField}
                onChange={(e) => setNewWfConditionField(e.target.value)}
                placeholder="Field (e.g. total)"
                className="text-xs"
              />
              <select
                value={newWfConditionOp}
                onChange={(e) => setNewWfConditionOp(e.target.value)}
                className="h-9 px-2 text-xs bg-white border border-[#E8E8EA] rounded-md focus:border-[#D4146E] focus:outline-none"
              >
                <option value="greater_than">Greater than (&gt;)</option>
                <option value="equals">Equals (==)</option>
                <option value="less_than">Less than (&lt;)</option>
              </select>
              <Input
                value={newWfConditionVal}
                onChange={(e) => setNewWfConditionVal(e.target.value)}
                placeholder="Value"
                className="text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#171717] mb-1">
              Telegram Notification Template
            </label>
            <Input
              value={newWfActionMsg}
              onChange={(e) => setNewWfActionMsg(e.target.value)}
              placeholder="e.g. Alert: {{total}} order placed by {{customer_name}}"
              className="text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateWorkflow}>
              Create Workflow
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useEffect, useState, use } from "react";
import {
  Package,
  ArrowDownRight,
  ArrowUpRight,
  Sliders,
  AlertTriangle,
  History,
  Plus
} from "lucide-react";
import { api } from "@/lib/api";
import { StudioNav } from "@/components/studio/StudioNav";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface PageProps {
  params: Promise<{ appId: string }>;
}

export default function InventoryStudioPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams.appId;
  const { showToast } = useToast();

  const [appData, setAppData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Adjustment Modal
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [movementType, setMovementType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN");
  const [quantityDelta, setQuantityDelta] = useState("10");
  const [adjustmentNotes, setAdjustmentNotes] = useState("Restock batch");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const app = await api.getApp(appId);
      setAppData(app);
      const prods = await api.listProducts(appId);
      setProducts(prods);
      const movs = await api.listInventoryMovements(appId);
      setMovements(movs);
      if (prods.length > 0 && !selectedProductId) {
        setSelectedProductId(prods[0].id);
      }
    } catch (err) {
      console.error("Failed to load inventory data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [appId]);

  const handleAdjustInventory = async () => {
    if (!selectedProductId) return;
    try {
      const delta = parseInt(quantityDelta, 10) * (movementType === "OUT" ? -1 : 1);
      await api.adjustInventory(appId, {
        product_id: selectedProductId,
        movement_type: movementType,
        quantity_delta: delta,
        notes: adjustmentNotes,
      });
      setIsAdjustOpen(false);
      showToast("Stock adjustment logged to ledger", "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Adjustment failed.", "error");
    }
  };

  if (isLoading || !appData) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-xs text-[#777777]">
        Loading Inventory Studio...
      </div>
    );
  }

  const lowStockCount = products.filter((p) => p.stock_quantity <= (p.low_stock_threshold || 5)).length;

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

        <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#171717] tracking-tight">Inventory Ledger</h2>
              <p className="text-xs text-[#777777] mt-1">
                Double-entry append-only inventory movement ledger with real-time stock levels.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAdjustOpen(true)}
              className="text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adjust Stock</span>
            </Button>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-[#E8E8EA] bg-white shadow-xs">
              <span className="text-xs text-[#777777] font-medium">Tracked SKUs</span>
              <div className="text-2xl font-bold text-[#171717] mt-1">{products.length}</div>
            </div>
            <div className="p-4 rounded-xl border border-[#E8E8EA] bg-white shadow-xs">
              <span className="text-xs text-[#777777] font-medium">Low Stock Alerts</span>
              <div className={`text-2xl font-bold mt-1 ${lowStockCount > 0 ? "text-amber-600" : "text-[#171717]"}`}>
                {lowStockCount} items
              </div>
            </div>
            <div className="p-4 rounded-xl border border-[#E8E8EA] bg-white shadow-xs">
              <span className="text-xs text-[#777777] font-medium">Total Movements Recorded</span>
              <div className="text-2xl font-bold text-[#171717] mt-1">{movements.length}</div>
            </div>
          </div>

          {/* Products Stock Table */}
          <div className="bg-white rounded-xl border border-[#E8E8EA] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E8E8EA] bg-[#F7F7F8]">
              <h3 className="text-sm font-bold text-[#171717]">Current Stock Levels</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F7F7F8] border-b border-[#E8E8EA] text-[#777777] font-semibold">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Stock on Hand</th>
                  <th className="p-3">Threshold</th>
                  <th className="p-3">Alert Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8EA]">
                {products.map((p) => {
                  const isLow = p.stock_quantity <= (p.low_stock_threshold || 5);
                  return (
                    <tr key={p.id} className="hover:bg-[#F7F7F8]/50">
                      <td className="p-3 font-semibold text-[#171717]">{p.name}</td>
                      <td className="p-3 font-mono text-[11px] text-[#777777]">{p.sku || "—"}</td>
                      <td className="p-3 font-bold text-[#171717]">{p.stock_quantity} units</td>
                      <td className="p-3 text-[#777777]">{p.low_stock_threshold || 5} units</td>
                      <td className="p-3">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        ) : (
                          <Badge variant="success" className="text-[10px]">Optimal</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Movement Ledger */}
          <div className="bg-white rounded-xl border border-[#E8E8EA] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E8E8EA] bg-[#F7F7F8] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#171717]">Movement History Ledger</h3>
              <span className="text-xs text-[#777777]">Append-only audit trail</span>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F7F7F8] border-b border-[#E8E8EA] text-[#777777] font-semibold">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Delta</th>
                  <th className="p-3">New Balance</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8EA]">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#777777]">
                      No stock movements recorded yet.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m.id} className="hover:bg-[#F7F7F8]/50">
                      <td className="p-3 text-[11px] text-[#777777]">{new Date(m.created_at).toLocaleString()}</td>
                      <td className="p-3 font-bold">
                        <Badge variant={m.quantity_delta > 0 ? "success" : "warning"} className="text-[10px]">
                          {m.movement_type}
                        </Badge>
                      </td>
                      <td className={`p-3 font-bold font-mono ${m.quantity_delta > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                        {m.quantity_delta > 0 ? `+${m.quantity_delta}` : m.quantity_delta}
                      </td>
                      <td className="p-3 font-semibold text-[#171717]">{m.quantity_after} units</td>
                      <td className="p-3 text-[#777777]">{m.notes || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        title="Adjust Inventory Stock"
        description="Records a verified transaction in the immutable stock ledger."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#171717] mb-1">Target Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-white border border-[#E8E8EA] rounded-md focus:border-[#D4146E] focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current: {p.stock_quantity})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-[#171717] mb-1">Movement Type</label>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as any)}
                className="w-full h-9 px-3 text-xs bg-white border border-[#E8E8EA] rounded-md focus:border-[#D4146E] focus:outline-none"
              >
                <option value="IN">IN (Purchase / Restock)</option>
                <option value="OUT">OUT (Damaged / Return)</option>
                <option value="ADJUSTMENT">ADJUSTMENT (Audit correction)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#171717] mb-1">Quantity</label>
              <Input
                type="number"
                min="1"
                value={quantityDelta}
                onChange={(e) => setQuantityDelta(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#171717] mb-1">Notes / Reason</label>
            <Input
              value={adjustmentNotes}
              onChange={(e) => setAdjustmentNotes(e.target.value)}
              placeholder="e.g. Received weekly supplier delivery..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsAdjustOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAdjustInventory}>
              Confirm Adjustment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


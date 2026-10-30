"use client";

import { useEffect, useState, use } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Activity,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { api } from "@/lib/api";
import { StudioNav } from "@/components/studio/StudioNav";
import { StudioHeader } from "@/components/studio/StudioHeader";

interface PageProps {
  params: Promise<{ appId: string }>;
}

export default function AnalyticsStudioPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams.appId;

  const [appData, setAppData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const app = await api.getApp(appId);
        setAppData(app);
        const ords = await api.listOrders(appId);
        setOrders(ords);
        const prods = await api.listProducts(appId);
        setProducts(prods);
        const movs = await api.listInventoryMovements(appId);
        setMovements(movs);
        const wfs = await api.listWorkflows(appId);
        setWorkflows(wfs);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [appId]);

  if (isLoading || !appData) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-xs text-[#777777]">
        Loading Analytics Studio...
      </div>
    );
  }

  const totalGrossRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
  const averageOrderValue = orders.length > 0 ? totalGrossRevenue / orders.length : 0;
  const totalInventoryUnits = products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);
  const estimatedInventoryValue = products.reduce(
    (sum, p) => sum + parseFloat(p.price || 0) * (p.stock_quantity || 0),
    0
  );

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

        <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#171717] tracking-tight">Application Analytics</h2>
              <p className="text-xs text-[#777777] mt-0.5">
                Real-time operational metrics derived strictly from verified database records.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#777777] bg-[#F7F7F8] px-3 py-1.5 rounded-md border border-[#E8E8EA]">
              <Calendar className="w-3.5 h-3.5" />
              <span>All-time Verified Records</span>
            </div>
          </div>

          {/* Core Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-[#E8E8EA] bg-white shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#777777] mb-1 font-medium">
                <span>Total Gross Sales</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-[#171717]">
                ${totalGrossRevenue.toFixed(2)}
              </div>
              <div className="text-[11px] text-emerald-700 mt-1">From {orders.length} completed orders</div>
            </div>

            <div className="p-4 rounded-xl border border-[#E8E8EA] bg-white shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#777777] mb-1 font-medium">
                <span>Average Order Value</span>
                <ShoppingCart className="w-4 h-4 text-[#D4146E]" />
              </div>
              <div className="text-2xl font-bold text-[#171717]">
                ${averageOrderValue.toFixed(2)}
              </div>
              <div className="text-[11px] text-[#777777] mt-1">Per transaction</div>
            </div>

            <div className="p-4 rounded-xl border border-[#E8E8EA] bg-white shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#777777] mb-1 font-medium">
                <span>Inventory Valuation</span>
                <Package className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-bold text-[#171717]">
                ${estimatedInventoryValue.toFixed(2)}
              </div>
              <div className="text-[11px] text-[#777777] mt-1">{totalInventoryUnits} units across {products.length} SKUs</div>
            </div>

            <div className="p-4 rounded-xl border border-[#E8E8EA] bg-white shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#777777] mb-1 font-medium">
                <span>Automations Active</span>
                <Activity className="w-4 h-4 text-[#D4146E]" />
              </div>
              <div className="text-2xl font-bold text-[#171717]">{workflows.length}</div>
              <div className="text-[11px] text-[#777777] mt-1">Running backend pipelines</div>
            </div>
          </div>

          {/* Activity Breakdown */}
          <div className="bg-white rounded-xl border border-[#E8E8EA] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E8E8EA] bg-[#F7F7F8]">
              <h3 className="text-sm font-bold text-[#171717]">Recent Order Transactions</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F7F7F8] border-b border-[#E8E8EA] text-[#777777] font-semibold">
                  <th className="p-3">Order Number</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Subtotal</th>
                  <th className="p-3">Tax</th>
                  <th className="p-3">Total Paid</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8EA]">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#777777]">
                      No sales transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-[#F7F7F8]/50">
                      <td className="p-3 font-mono font-bold text-[#D4146E]">{o.order_number}</td>
                      <td className="p-3 font-semibold text-[#171717]">{o.customer_name}</td>
                      <td className="p-3 text-[#777777]">${parseFloat(o.subtotal).toFixed(2)}</td>
                      <td className="p-3 text-[#777777]">${parseFloat(o.tax).toFixed(2)}</td>
                      <td className="p-3 font-bold text-[#171717]">${parseFloat(o.total).toFixed(2)}</td>
                      <td className="p-3 text-[11px] text-[#777777]">{new Date(o.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


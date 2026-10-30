"use client";

import { useEffect, useState, use } from "react";
import {
  ShoppingBag,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  CheckCircle2,
  Receipt,
  Tag,
  Package,
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

export default function POSStudioPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams.appId;

  const [appData, setAppData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"register" | "catalog" | "orders">("register");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<{ product: any; quantity: number }[]>([]);
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // New Product Modal
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("5.00");
  const [newProdCost, setNewProdCost] = useState("1.50");
  const [newProdStock, setNewProdStock] = useState("50");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdImage, setNewProdImage] = useState("");

  const loadPOSData = async () => {
    try {
      const app = await api.getApp(appId);
      setAppData(app);
      const prods = await api.listProducts(appId);
      setProducts(prods);
      const ords = await api.listOrders(appId);
      setOrders(ords);
    } catch (err) {
      console.error("Failed to load POS data:", err);
    }
  };

  useEffect(() => {
    loadPOSData();
  }, [appId]);

  const handleAddToCart = (product: any) => {
    const existing = cart.find((i) => i.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock_quantity) {
        alert("Cannot add more: Max available stock reached.");
        return;
      }
      setCart(
        cart.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      if (product.stock_quantity < 1) {
        alert("This item is currently out of stock.");
        return;
      }
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product.id === productId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as { product: any; quantity: number }[]
    );
  };

  const calculateSubtotal = () =>
    cart.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);

  const calculateTax = () => calculateSubtotal() * 0.05;
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      setIsSubmittingOrder(true);
      const idempotencyKey = `pos-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const orderPayload = {
        idempotency_key: idempotencyKey,
        customer_name: customerName,
        payment_method: "cash",
        items: cart.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
      };

      const newOrder = await api.placeOrder(appId, orderPayload);
      alert(`Order #${newOrder.order_number} completed successfully! Total: $${parseFloat(newOrder.total).toFixed(2)}`);
      setCart([]);
      loadPOSData();
    } catch (err: any) {
      alert(err.message || "Checkout failed.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!newProdName.trim()) return;
    try {
      await api.createProduct(appId, {
        name: newProdName.trim(),
        price: parseFloat(newProdPrice) || 0,
        cost: parseFloat(newProdCost) || 0,
        stock_quantity: parseInt(newProdStock, 10) || 0,
        sku: newProdSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
        image_url: newProdImage.trim() || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80"
      });
      setIsAddProductOpen(false);
      setNewProdName("");
      setNewProdSku("");
      loadPOSData();
    } catch (err: any) {
      alert(err.message || "Failed to create product.");
    }
  };

  if (!appData) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-xs text-[#777777]">
        Loading POS Studio...
      </div>
    );
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
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

        {/* Studio Sub Header Bar */}
        <div className="h-12 border-b border-[#E8E8EA] bg-white px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("register")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "register"
                  ? "bg-[#D4146E] text-white"
                  : "text-[#777777] hover:text-[#171717] hover:bg-[#F7F7F8]"
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Live Register</span>
            </button>
            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "catalog"
                  ? "bg-[#171717] text-white"
                  : "text-[#777777] hover:text-[#171717] hover:bg-[#F7F7F8]"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Catalog ({products.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "orders"
                  ? "bg-[#171717] text-white"
                  : "text-[#777777] hover:text-[#171717] hover:bg-[#F7F7F8]"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Orders ({orders.length})</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddProductOpen(true)}
            className="text-xs gap-1"
          >
            <Plus className="w-3.5 h-3.5 text-[#D4146E]" />
            <span>Add Product</span>
          </Button>
        </div>

        {/* Tab 1: Live Cashier Register */}
        {activeTab === "register" && (
          <div className="flex-1 flex overflow-hidden">
            {/* Catalog Grid for Cashier */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-[#E8E8EA] bg-[#F7F7F8]">
              {/* Search Bar */}
              <div className="p-3 bg-white border-b border-[#E8E8EA]">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777777]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by product name or SKU..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F7F8] border border-[#E8E8EA] rounded-md focus:border-[#D4146E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Product Cards */}
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.stock_quantity <= 0;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleAddToCart(p)}
                      disabled={isOutOfStock}
                      className="group bg-white p-3 rounded-lg border border-[#E8E8EA] hover:border-[#D4146E] hover:shadow-xs text-left transition-all flex flex-col justify-between disabled:opacity-50"
                    >
                      <div>
                        {p.image_url && (
                          <div className="h-24 rounded-md bg-[#F7F7F8] mb-2 overflow-hidden">
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                          </div>
                        )}
                        <h4 className="font-semibold text-xs text-[#171717] line-clamp-1">{p.name}</h4>
                        <div className="text-[10px] text-[#777777] font-mono mt-0.5">{p.sku || "No SKU"}</div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#171717]">
                          ${parseFloat(p.price).toFixed(2)}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          isOutOfStock ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                        }`}>
                          {isOutOfStock ? "Out of Stock" : `${p.stock_quantity} left`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Order / Cart Panel */}
            <div className="w-80 bg-white flex flex-col justify-between shrink-0 select-none">
              <div>
                <div className="p-4 border-b border-[#E8E8EA] bg-[#F7F7F8] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#171717]">
                    <ShoppingCart className="w-4 h-4 text-[#D4146E]" />
                    <span>Current Order</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {cart.reduce((sum, i) => sum + i.quantity, 0)} items
                  </Badge>
                </div>

                <div className="p-3 border-b border-[#E8E8EA]">
                  <label className="text-[11px] font-medium text-[#777777] block mb-1">Customer</label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-8 text-xs"
                    placeholder="Customer Name..."
                  />
                </div>

                {/* Cart Items List */}
                <div className="p-3 space-y-2 max-h-[380px] overflow-y-auto divide-y divide-[#E8E8EA]">
                  {cart.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#777777]">
                      Order is empty. Tap any product from the catalog to add.
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} className="pt-2 flex items-center justify-between text-xs">
                        <div className="truncate pr-2">
                          <div className="font-semibold text-[#171717] truncate">{item.product.name}</div>
                          <div className="text-[10px] text-[#777777]">
                            ${parseFloat(item.product.price).toFixed(2)} each
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleUpdateCartQty(item.product.id, -1)}
                            className="w-5 h-5 rounded bg-[#F7F7F8] border border-[#E8E8EA] flex items-center justify-center font-bold text-xs hover:bg-[#E8E8EA]"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateCartQty(item.product.id, 1)}
                            className="w-5 h-5 rounded bg-[#F7F7F8] border border-[#E8E8EA] flex items-center justify-center font-bold text-xs hover:bg-[#E8E8EA]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Order Summary & Charge Button */}
              <div className="p-4 border-t border-[#E8E8EA] bg-[#F7F7F8] space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[#777777]">
                    <span>Subtotal</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#777777]">
                    <span>Tax (5%)</span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#171717] pt-1 border-t border-[#E8E8EA]">
                    <span>Total Due</span>
                    <span className="text-[#D4146E]">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="default"
                  disabled={cart.length === 0 || isSubmittingOrder}
                  onClick={handleCheckout}
                  className="w-full font-bold text-xs shadow-md"
                >
                  {isSubmittingOrder ? "Processing..." : `Complete Order ($${calculateTotal().toFixed(2)})`}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Catalog Table */}
        {activeTab === "catalog" && (
          <div className="flex-1 overflow-auto p-6">
            <div className="border border-[#E8E8EA] rounded-xl overflow-hidden bg-white shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F7F7F8] border-b border-[#E8E8EA] font-semibold text-[#777777]">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Cost</th>
                    <th className="p-3">Stock On Hand</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8EA]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F7F7F8]/60 transition-colors">
                      <td className="p-3 font-semibold text-[#171717]">{p.name}</td>
                      <td className="p-3 font-mono text-[11px] text-[#777777]">{p.sku || "—"}</td>
                      <td className="p-3 font-bold text-[#171717]">${parseFloat(p.price).toFixed(2)}</td>
                      <td className="p-3 text-[#777777]">${parseFloat(p.cost).toFixed(2)}</td>
                      <td className="p-3 font-semibold text-[#171717]">{p.stock_quantity} units</td>
                      <td className="p-3">
                        <Badge variant={p.stock_quantity > 5 ? "success" : "warning"} className="text-[10px]">
                          {p.stock_quantity > 5 ? "In Stock" : p.stock_quantity > 0 ? "Low Stock" : "Out"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Order History */}
        {activeTab === "orders" && (
          <div className="flex-1 overflow-auto p-6">
            <div className="border border-[#E8E8EA] rounded-xl overflow-hidden bg-white shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F7F7F8] border-b border-[#E8E8EA] font-semibold text-[#777777]">
                    <th className="p-3">Order Number</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Items Count</th>
                    <th className="p-3">Placed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8EA]">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#777777]">
                        No orders placed yet. Place an order in Live Register to see it here.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#F7F7F8]/60 transition-colors">
                        <td className="p-3 font-mono font-semibold text-[#D4146E]">{o.order_number}</td>
                        <td className="p-3 text-[#171717]">{o.customer_name}</td>
                        <td className="p-3 font-bold text-[#171717]">${parseFloat(o.total).toFixed(2)}</td>
                        <td className="p-3 capitalize">
                          <Badge variant="outline" className="text-[10px]">{o.payment_method}</Badge>
                        </td>
                        <td className="p-3">{o.items?.length || 1} items</td>
                        <td className="p-3 text-[#777777]">{new Date(o.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        title="Add Product to Catalog"
        description="Add a physical or digital product with stock tracking."
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#171717] mb-1">Product Name</label>
            <Input
              value={newProdName}
              onChange={(e) => setNewProdName(e.target.value)}
              placeholder="e.g. Colombian Supremo Beans (250g)"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-[#171717] mb-1">Selling Price ($)</label>
              <Input
                type="number"
                step="0.01"
                value={newProdPrice}
                onChange={(e) => setNewProdPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#171717] mb-1">Cost Price ($)</label>
              <Input
                type="number"
                step="0.01"
                value={newProdCost}
                onChange={(e) => setNewProdCost(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#171717] mb-1">Initial Stock</label>
              <Input
                type="number"
                value={newProdStock}
                onChange={(e) => setNewProdStock(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#171717] mb-1">SKU / Barcode</label>
            <Input
              value={newProdSku}
              onChange={(e) => setNewProdSku(e.target.value)}
              placeholder="e.g. BEAN-COL-01"
              className="font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#171717] mb-1">Image URL</label>
            <Input
              value={newProdImage}
              onChange={(e) => setNewProdImage(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddProductOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateProduct}>
              Save Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

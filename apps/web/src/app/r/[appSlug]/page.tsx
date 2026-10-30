"use client";

import { useEffect, useState, use } from "react";
import { AppSpec, PageSpec, ComponentNode } from "@miniforge/app-schema";
import { api } from "@/lib/api";
import {
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Home,
  Grid,
  Menu,
  X
} from "lucide-react";

interface PageProps {
  params: Promise<{ appSlug: string }>;
}

export default function StandaloneWebRuntime({ params }: PageProps) {
  const resolvedParams = use(params);
  const appSlug = resolvedParams.appSlug;

  const [appData, setAppData] = useState<any>(null);
  const [activePageId, setActivePageId] = useState<string>("");
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadPublishedApp() {
      try {
        setIsLoading(true);
        const data = await api.getPublishedApp(appSlug);
        setAppData(data);
        const spec = data.spec as AppSpec;
        if (spec.pages && spec.pages.length > 0) {
          const home = spec.pages.find((p) => p.isHome) || spec.pages[0];
          setActivePageId(home.id);
        }
        // Load live products for this app
        const prods = await api.listProducts(data.id);
        setProducts(prods);
      } catch (err) {
        console.error("Failed to load published app:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPublishedApp();
  }, [appSlug]);

  if (isLoading || !appData) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-xs text-[#777777]">
        Loading application...
      </div>
    );
  }

  const spec = appData.spec as AppSpec;
  const theme = spec.theme;
  const activePage = spec.pages.find((p) => p.id === activePageId) || spec.pages[0];

  const handleAddToCart = (product: any) => {
    const existing = cart.find((i) => i.id === product.id);
    if (existing) {
      setCart(cart.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const idemKey = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const res = await api.placeOrder(appData.id, {
        idempotency_key: idemKey,
        customer_name: "Web Customer",
        items: cart.map((i) => ({ product_id: i.id, quantity: i.qty })),
      });
      setOrderSuccess(res.order_number);
      setCart([]);
    } catch (err: any) {
      alert(err.message || "Checkout failed.");
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price || 0) * item.qty, 0);

  const renderComponent = (comp: ComponentNode) => {
    const props = comp.props || {};

    switch (comp.type) {
      case "HeroBanner":
        return (
          <div
            key={comp.id}
            className="p-8 md:p-12 rounded-2xl border border-[#E8E8EA] bg-[#F7F7F8] mb-6 relative overflow-hidden"
            style={{ borderRadius: theme.borderRadius }}
          >
            {props.badge && (
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full mb-3"
                style={{ backgroundColor: `${theme.primaryColor}15`, color: theme.primaryColor }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {props.badge}
              </span>
            )}
            <h1 className="text-2xl md:text-4xl font-extrabold text-[#171717] tracking-tight mb-2">
              {props.title}
            </h1>
            <p className="text-sm text-[#777777] mb-6 max-w-lg leading-relaxed">
              {props.subtitle}
            </p>
            {props.buttonText && (
              <button
                onClick={() => {
                  if (props.buttonAction?.target) {
                    setActivePageId(props.buttonAction.target);
                  }
                }}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {props.buttonText}
              </button>
            )}
          </div>
        );

      case "SectionHeading":
        return (
          <div key={comp.id} className="py-3 mb-2">
            <h2 className="text-xl font-bold text-[#171717] tracking-tight">{props.title}</h2>
            {props.subtitle && <p className="text-xs text-[#777777] mt-0.5">{props.subtitle}</p>}
          </div>
        );

      case "ProductGrid":
        const displayProds = products.length > 0 ? products : [
          { id: "1", name: "Single Origin Pour Over", price: "5.50", image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80" },
          { id: "2", name: "Matcha Oat Latte", price: "6.00", image_url: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80" }
        ];

        return (
          <div key={comp.id} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {displayProds.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-[#E8E8EA] bg-white overflow-hidden shadow-xs hover:border-[#D4146E] transition-all flex flex-col justify-between"
                style={{ borderRadius: theme.borderRadius }}
              >
                {p.image_url && (
                  <div className="h-44 bg-[#F7F7F8] overflow-hidden">
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#171717]">{p.name}</h3>
                    <div className="text-sm font-extrabold text-[#171717] mt-1">
                      ${parseFloat(p.price).toFixed(2)}
                    </div>
                  </div>

                  {props.showAddToCart && (
                    <button
                      onClick={() => handleAddToCart(p)}
                      className="mt-3 w-full py-2 rounded-lg text-xs font-semibold text-white transition-opacity flex items-center justify-center gap-1.5 shadow-xs"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case "CartView":
        return (
          <div
            key={comp.id}
            className="p-6 rounded-2xl border border-[#E8E8EA] bg-white max-w-xl mx-auto shadow-xs space-y-4 mb-6"
            style={{ borderRadius: theme.borderRadius }}
          >
            <h3 className="text-base font-bold text-[#171717]">Shopping Cart</h3>
            {cart.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#777777]">
                {props.emptyText || "Your cart is currently empty."}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="divide-y divide-[#E8E8EA]">
                  {cart.map((item) => (
                    <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-semibold text-[#171717]">{item.name}</div>
                        <div className="text-[11px] text-[#777777]">
                          Qty: {item.qty} × ${parseFloat(item.price).toFixed(2)}
                        </div>
                      </div>
                      <span className="font-bold text-[#171717]">
                        ${(parseFloat(item.price) * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#E8E8EA] space-y-2">
                  <div className="flex justify-between font-bold text-sm text-[#171717]">
                    <span>Total</span>
                    <span style={{ color: theme.primaryColor }}>${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 rounded-lg text-xs font-bold text-white shadow-md transition-opacity"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {props.checkoutButtonText || "Place Order"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 bg-white border-b border-[#E8E8EA] px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white"
            style={{ backgroundColor: theme.primaryColor }}
          >
            {spec.name.slice(0, 2).toUpperCase()}
          </div>
          <span className="font-bold text-base text-[#171717]">{spec.name}</span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="flex items-center gap-1">
          {spec.navigation?.items?.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePageId(item.pageId)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activePageId === item.pageId
                  ? "text-white shadow-xs"
                  : "text-[#777777] hover:text-[#171717] hover:bg-[#F7F7F8]"
              }`}
              style={{
                backgroundColor: activePageId === item.pageId ? theme.primaryColor : undefined,
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Cart Counter */}
        <button
          onClick={() => {
            const cartPage = spec.pages.find((p) => p.slug === "/cart" || p.title.toLowerCase().includes("cart"));
            if (cartPage) setActivePageId(cartPage.id);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E8EA] bg-white text-xs font-semibold text-[#171717] hover:border-[#D4146E] transition-colors"
        >
          <ShoppingCart className="w-4 h-4 text-[#D4146E]" />
          <span>{cart.reduce((sum, i) => sum + i.qty, 0)}</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8">
        {orderSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Thank you! Order #{orderSuccess} has been confirmed.</span>
          </div>
        )}

        {activePage?.components.map((comp) => renderComponent(comp))}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#E8E8EA] bg-white text-center text-xs text-[#777777]">
        Powered by <strong className="text-[#171717]">MiniForge</strong> • Visual Application Runtime
      </footer>
    </div>
  );
}

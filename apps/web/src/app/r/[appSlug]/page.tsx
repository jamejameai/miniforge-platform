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
  X,
  Tag,
  Info,
  Activity,
  Table as TableIcon
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { resolveComponentStyles, resolveMotionStyles } from "@/lib/studio-runtime";

interface PageProps {
  params: Promise<{ appSlug: string }>;
}

export default function StandaloneWebRuntime({ params }: PageProps) {
  const resolvedParams = use(params);
  const appSlug = resolvedParams.appSlug;
  const { showToast } = useToast();

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
    showToast(`Added ${product.name} to cart`, "success");
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
      showToast(`Order #${res.order_number} confirmed!`, "success");
    } catch (err: any) {
      showToast(err.message || "Checkout failed.", "error");
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price || 0) * item.qty, 0);

  const renderComponent = (comp: ComponentNode) => {
    if (comp.isHidden) return null;

    const props = comp.props || {};
    const customStyles = resolveComponentStyles(comp.styles, theme);
    const motionStyles = resolveMotionStyles(comp.motion);

    let innerContent = null;

    switch (comp.type) {
      case "HeroBanner":
        innerContent = (
          <div
            className="p-8 md:p-12 rounded-2xl border border-[#E8E8EA] bg-[#F7F7F8] relative overflow-hidden"
            style={{ borderRadius: comp.styles?.borderRadius || theme.borderRadius, ...customStyles }}
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
        break;

      case "SectionHeading":
        innerContent = (
          <div className="py-3" style={customStyles}>
            <h2 className="text-xl font-bold text-[#171717] tracking-tight">{props.title}</h2>
            {props.subtitle && <p className="text-xs text-[#777777] mt-0.5">{props.subtitle}</p>}
          </div>
        );
        break;

      case "ProductGrid":
        const displayProds = products.length > 0 ? products : [
          { id: "1", name: "Single Origin Pour Over", price: "5.50", image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80" },
          { id: "2", name: "Matcha Oat Latte", price: "6.00", image_url: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80" },
          { id: "3", name: "Almond Croissant", price: "4.25", image_url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80" },
          { id: "4", name: "Cold Brew Reserve", price: "5.00", image_url: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80" }
        ].slice(0, props.limit || 4);

        innerContent = (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" style={customStyles}>
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
        break;

      case "CartView":
        innerContent = (
          <div
            className="p-6 rounded-2xl border border-[#E8E8EA] bg-white max-w-xl mx-auto shadow-xs space-y-4"
            style={{ borderRadius: theme.borderRadius, ...customStyles }}
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
        break;

      case "Button":
        innerContent = (
          <div style={customStyles}>
            <button
              onClick={() => {
                if (props.action?.type === "NAVIGATE" && props.action?.target) {
                  setActivePageId(props.action.target);
                } else if (props.action?.type === "SHOW_TOAST") {
                  showToast(props.action.payload?.message || "Action executed", "info");
                }
              }}
              className="px-6 py-2.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-transform active:scale-95"
              style={{
                backgroundColor: props.variant === "primary" ? theme.primaryColor : "#171717",
                borderRadius: theme.borderRadius
              }}
            >
              {props.label || "Action Button"}
            </button>
          </div>
        );
        break;

      case "Card":
        innerContent = (
          <div
            className="p-5 rounded-xl border border-[#E8E8EA] bg-white shadow-xs"
            style={{ borderRadius: theme.borderRadius, ...customStyles }}
          >
            <h4 className="text-sm font-bold text-[#171717]">{props.title}</h4>
            <p className="text-xs text-[#777777] mt-1 leading-relaxed">{props.description}</p>
          </div>
        );
        break;

      case "StatCard":
        innerContent = (
          <div
            className="p-4 rounded-xl border border-[#E8E8EA] bg-white flex items-center justify-between"
            style={{ borderRadius: theme.borderRadius, ...customStyles }}
          >
            <div>
              <span className="text-xs font-medium text-[#777777]">{props.title}</span>
              <div className="text-xl font-extrabold text-[#171717] mt-0.5">{props.value}</div>
            </div>
            {props.change && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {props.change}
              </span>
            )}
          </div>
        );
        break;

      case "Badge":
        innerContent = (
          <div style={customStyles}>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                props.variant === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : props.variant === "warning"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : props.variant === "secondary"
                  ? "bg-gray-100 text-gray-700 border border-gray-200"
                  : "text-white"
              }`}
              style={{
                backgroundColor: props.variant === "primary" ? theme.primaryColor : undefined,
              }}
            >
              <Tag className="w-3 h-3" />
              <span>{props.text || "Badge"}</span>
            </span>
          </div>
        );
        break;

      case "Image":
        innerContent = (
          <div
            className="w-full rounded-2xl overflow-hidden border border-[#E8E8EA] bg-[#F7F7F8]"
            style={{ borderRadius: theme.borderRadius, ...customStyles }}
          >
            <img
              src={props.url || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80"}
              alt={props.alt || "Banner image"}
              className={`w-full object-cover ${
                props.aspectRatio === "16/9"
                  ? "aspect-video"
                  : props.aspectRatio === "4/3"
                  ? "aspect-4/3"
                  : props.aspectRatio === "1/1"
                  ? "aspect-square"
                  : "h-64"
              }`}
            />
          </div>
        );
        break;

      case "Notice":
        innerContent = (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
              props.status === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : props.status === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : props.status === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
            style={{ borderRadius: theme.borderRadius, ...customStyles }}
          >
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-xs">{props.title || "Notice"}</h5>
              <p className="text-[11px] opacity-90 mt-0.5">{props.message}</p>
            </div>
          </div>
        );
        break;

      case "Divider":
        innerContent = (
          <div
            className="h-px bg-[#E8E8EA] w-full"
            style={{ margin: `${props.margin || 16}px 0`, ...customStyles }}
          />
        );
        break;

      default:
        innerContent = null;
    }

    return (
      <div key={comp.id} style={motionStyles.style} className="mb-4">
        {innerContent}
      </div>
    );
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

"use client";

import { useEffect, useState, use } from "react";
import Script from "next/script";
import { AppSpec, PageSpec, ComponentNode } from "@miniforge/app-schema";
import { api } from "@/lib/api";
import {
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShoppingCart
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

interface PageProps {
  params: Promise<{ appSlug: string }>;
}

export default function TelegramMiniAppRuntime({ params }: PageProps) {
  const resolvedParams = use(params);
  const appSlug = resolvedParams.appSlug;
  const { showToast } = useToast();

  const [appData, setAppData] = useState<any>(null);
  const [activePageId, setActivePageId] = useState<string>("");
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [telegramUser, setTelegramUser] = useState<any>(null);

  // Load app data
  useEffect(() => {
    async function loadData() {
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
        console.error("Failed to load Telegram Mini App:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [appSlug]);

  // Hook into Telegram WebApp SDK when loaded
  const handleTelegramSDKReady = () => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Attempt verification if initData present
      if (tg.initData && appData?.id) {
        api.verifyTelegramData(appData.id, tg.initData).then((res) => {
          if (res.is_valid && res.telegram_user) {
            setTelegramUser(res.telegram_user);
          }
        });
      }
    }
  };

  const spec = appData?.spec as AppSpec;
  const theme = spec?.theme;
  const activePage = spec?.pages.find((p) => p.id === activePageId) || spec?.pages[0];

  // Configure Telegram BackButton and MainButton
  useEffect(() => {
    if (typeof window === "undefined" || !window.Telegram?.WebApp) return;
    const tg = window.Telegram.WebApp;

    // BackButton logic
    if (activePage && !activePage.isHome) {
      tg.BackButton.show();
      const onBack = () => {
        const home = spec?.pages.find((p) => p.isHome) || spec?.pages[0];
        if (home) setActivePageId(home.id);
      };
      tg.BackButton.onClick(onBack);
      return () => {
        tg.BackButton.offClick(onBack);
        tg.BackButton.hide();
      };
    } else {
      tg.BackButton.hide();
    }
  }, [activePage, spec]);

  // MainButton for Checkout
  useEffect(() => {
    if (typeof window === "undefined" || !window.Telegram?.WebApp) return;
    const tg = window.Telegram.WebApp;

    if (cart.length > 0) {
      const total = cart.reduce((sum, item) => sum + parseFloat(item.price || 0) * item.qty, 0);
      tg.MainButton.setText(`CHECKOUT ($${total.toFixed(2)})`);
      tg.MainButton.show();
      if (theme?.primaryColor) {
        tg.MainButton.setParams({ color: theme.primaryColor });
      }

      const onMainClick = async () => {
        tg.HapticFeedback?.impactOccurred("medium");
        try {
          const idemKey = `tg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const res = await api.placeOrder(appData.id, {
            idempotency_key: idemKey,
            customer_name: telegramUser ? `${telegramUser.first_name} (@${telegramUser.username || "tg"})` : "Telegram User",
            items: cart.map((i) => ({ product_id: i.id, quantity: i.qty })),
          });
          tg.HapticFeedback?.notificationOccurred("success");
          setOrderSuccess(res.order_number);
          setCart([]);
          tg.MainButton.hide();
        } catch (err: any) {
          tg.HapticFeedback?.notificationOccurred("error");
          showToast(err.message || "Checkout failed.", "error");
        }
      };

      tg.MainButton.onClick(onMainClick);
      return () => {
        tg.MainButton.offClick(onMainClick);
        tg.MainButton.hide();
      };
    } else {
      tg.MainButton.hide();
    }
  }, [cart, appData, telegramUser, theme]);

  const handleAddToCart = (product: any) => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback?.impactOccurred("light");
    }
    const existing = cart.find((i) => i.id === product.id);
    if (existing) {
      setCart(cart.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  if (isLoading || !appData) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-xs text-[#777777]">
        Loading Telegram Mini App...
      </div>
    );
  }

  const renderComponent = (comp: ComponentNode) => {
    const props = comp.props || {};

    switch (comp.type) {
      case "HeroBanner":
        return (
          <div
            key={comp.id}
            className="p-5 rounded-2xl border border-[#E8E8EA] bg-[#F7F7F8] mb-4 relative overflow-hidden"
            style={{ borderRadius: theme.borderRadius }}
          >
            {props.badge && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-2"
                style={{ backgroundColor: `${theme.primaryColor}15`, color: theme.primaryColor }}
              >
                <Sparkles className="w-3 h-3" />
                {props.badge}
              </span>
            )}
            <h1 className="text-xl font-bold text-[#171717] tracking-tight mb-1">
              {props.title}
            </h1>
            <p className="text-xs text-[#777777] mb-4 leading-relaxed">
              {props.subtitle}
            </p>
            {props.buttonText && (
              <button
                onClick={() => {
                  if (props.buttonAction?.target) {
                    setActivePageId(props.buttonAction.target);
                  }
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-xs"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {props.buttonText}
              </button>
            )}
          </div>
        );

      case "SectionHeading":
        return (
          <div key={comp.id} className="py-2 mb-1">
            <h2 className="text-base font-bold text-[#171717] tracking-tight">{props.title}</h2>
            {props.subtitle && <p className="text-xs text-[#777777] mt-0.5">{props.subtitle}</p>}
          </div>
        );

      case "ProductGrid":
        const displayProds = products.length > 0 ? products : [
          { id: "1", name: "Single Origin Pour Over", price: "5.50", image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80" },
          { id: "2", name: "Matcha Oat Latte", price: "6.00", image_url: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80" }
        ];

        return (
          <div key={comp.id} className="grid grid-cols-2 gap-3 mb-4">
            {displayProds.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-[#E8E8EA] bg-white overflow-hidden shadow-xs flex flex-col justify-between"
                style={{ borderRadius: theme.borderRadius }}
              >
                {p.image_url && (
                  <div className="h-32 bg-[#F7F7F8] overflow-hidden">
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-xs text-[#171717] line-clamp-1">{p.name}</h3>
                    <div className="text-xs font-bold text-[#171717] mt-0.5">
                      ${parseFloat(p.price).toFixed(2)}
                    </div>
                  </div>

                  {props.showAddToCart && (
                    <button
                      onClick={() => handleAddToCart(p)}
                      className="mt-2.5 w-full py-1.5 rounded-md text-[11px] font-semibold text-white flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-transform"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Add</span>
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
            className="p-4 rounded-xl border border-[#E8E8EA] bg-white shadow-xs space-y-3 mb-4"
            style={{ borderRadius: theme.borderRadius }}
          >
            <h3 className="text-sm font-bold text-[#171717]">Order Cart</h3>
            {cart.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#777777]">
                Your cart is empty. Tap items in Menu to add.
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-[#E8E8EA]">
                    <div>
                      <div className="font-semibold text-[#171717]">{item.name}</div>
                      <div className="text-[10px] text-[#777777]">Qty: {item.qty}</div>
                    </div>
                    <span className="font-bold text-[#171717]">${(parseFloat(item.price) * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
        onLoad={handleTelegramSDKReady}
      />

      <div className="min-h-screen bg-white text-[#171717] flex flex-col pb-16">
        {/* Telegram Header */}
        <header className="p-4 border-b border-[#E8E8EA] flex items-center justify-between sticky top-0 bg-white z-20">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: theme?.primaryColor }}
            />
            <span className="font-bold text-sm text-[#171717]">{spec.name}</span>
          </div>

          {telegramUser && (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3" />
              <span>{telegramUser.first_name}</span>
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 p-4">
          {orderSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Order #{orderSuccess} confirmed! Telegram alert sent.</span>
            </div>
          )}

          {activePage?.components.map((c) => renderComponent(c))}
        </main>

        {/* Bottom Navigation for Telegram */}
        {spec.navigation?.type === "bottom_nav" && (
          <nav className="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-[#E8E8EA] flex items-center justify-around z-30">
            {spec.navigation.items.map((item) => {
              const isCurrent = item.pageId === activePageId;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
                      window.Telegram.WebApp.HapticFeedback?.selectionChanged();
                    }
                    setActivePageId(item.pageId);
                  }}
                  className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                    isCurrent ? "font-bold" : "text-[#777777]"
                  }`}
                  style={{ color: isCurrent ? theme?.primaryColor : undefined }}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </>
  );
}


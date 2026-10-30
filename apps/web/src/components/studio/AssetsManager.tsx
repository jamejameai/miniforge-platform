"use client";

import { useState } from "react";
import { Image as ImageIcon, Copy, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";

interface AssetPreset {
  id: string;
  name: string;
  category: "Cafe" | "Food" | "Retail" | "Tech" | "Services";
  url: string;
}

const ASSET_PRESETS: AssetPreset[] = [
  {
    id: "cafe-1",
    name: "Espresso Pour Over",
    category: "Cafe",
    url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "cafe-2",
    name: "Matcha Latte Ceramic",
    category: "Cafe",
    url: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "food-1",
    name: "Artisan Croissant",
    category: "Food",
    url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "retail-1",
    name: "Minimalist Tote Bag",
    category: "Retail",
    url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "tech-1",
    name: "Modern Mobile Devices",
    category: "Tech",
    url: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "services-1",
    name: "Salon & Wellness Studio",
    category: "Services",
    url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80"
  }
];

export function AssetsManager() {
  const { showToast } = useToast();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState("");

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    showToast("Image URL copied to clipboard", "success");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
      <div className="p-3 border-b border-[#E8E8EA] bg-[#F7F7F8]">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#777777]">
          <ImageIcon className="w-3.5 h-3.5 text-[#171717]" />
          <span>Curated Asset Library</span>
        </div>
        <p className="text-[11px] text-[#777777] mt-0.5">
          High-resolution royalty-free presets for your Mini App.
        </p>
      </div>

      <div className="p-3 border-b border-[#E8E8EA] space-y-2">
        <label className="text-xs font-semibold text-[#171717]">Quick Image URL Test</label>
        <div className="flex gap-2">
          <Input
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="Paste your image URL here..."
            className="text-xs flex-1"
          />
          <button
            onClick={() => customUrl && handleCopy(customUrl)}
            disabled={!customUrl}
            className="px-2.5 py-1 text-xs bg-[#171717] text-white rounded-md hover:bg-[#333333] disabled:opacity-30"
          >
            Copy
          </button>
        </div>
        {customUrl && (
          <div className="h-24 w-full rounded-md border border-[#E8E8EA] overflow-hidden bg-[#F7F7F8]">
            <img src={customUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2.5">
        {ASSET_PRESETS.map((asset) => (
          <div
            key={asset.id}
            className="rounded-lg border border-[#E8E8EA] overflow-hidden hover:border-[#D4146E] transition-all group"
          >
            <div className="h-28 bg-[#F7F7F8] relative overflow-hidden">
              <img
                src={asset.url}
                alt={asset.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 left-2 text-[10px] font-semibold bg-black/60 text-white px-1.5 py-0.5 rounded backdrop-blur-xs">
                {asset.category}
              </span>
            </div>
            <div className="p-2 flex items-center justify-between bg-white">
              <span className="text-xs font-semibold text-[#171717] truncate">{asset.name}</span>
              <button
                onClick={() => handleCopy(asset.url)}
                className="p-1 rounded text-[#777777] hover:text-[#D4146E] transition-colors"
                title="Copy Image URL"
              >
                {copiedUrl === asset.url ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


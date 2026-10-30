"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Bot,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Send,
  Lock,
  RefreshCw,
  Smartphone,
  Key
} from "lucide-react";
import { api } from "@/lib/api";
import { StudioNav } from "@/components/studio/StudioNav";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface PageProps {
  params: Promise<{ appId: string }>;
}

export default function BotStudioPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams.appId;
  const { showToast } = useToast();

  const [appData, setAppData] = useState<any>(null);
  const [botStatus, setBotStatus] = useState<any>(null);
  const [botToken, setBotToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSettingMenu, setIsSettingMenu] = useState(false);
  const [menuConfigured, setMenuConfigured] = useState(false);
  const [testInitData, setTestInitData] = useState("");
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const loadBotData = async () => {
    try {
      const app = await api.getApp(appId);
      setAppData(app);
      const status = await api.getBotStatus(appId);
      setBotStatus(status);
      setMenuConfigured(status.menu_button_configured);
    } catch (err) {
      console.error("Failed to load bot data:", err);
    }
  };

  useEffect(() => {
    loadBotData();
  }, [appId]);

  const handleConnectBot = async () => {
    if (!botToken.trim()) return;
    try {
      setIsConnecting(true);
      const status = await api.connectBot(appId, botToken.trim());
      setBotStatus(status);
      setBotToken("");
      showToast(`Bot @${status.bot_username} successfully connected!`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to connect Telegram Bot.", "error");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConfigureMenuButton = async () => {
    if (!appData) return;
    try {
      setIsSettingMenu(true);
      const miniAppUrl = `${window.location.origin}/tg/${appData.slug}`;
      await api.configureMenuButton(appId, miniAppUrl);
      setMenuConfigured(true);
      showToast("Telegram Mini App Menu Button successfully set up in your bot!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to configure menu button.", "error");
    } finally {
      setIsSettingMenu(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect this Telegram bot?")) return;
    try {
      await api.disconnectBot(appId);
      showToast("Telegram Bot disconnected.", "info");
      loadBotData();
    } catch (err: any) {
      showToast(err.message || "Failed to disconnect bot.", "error");
    }
  };

  const handleTestVerifyInitData = async () => {
    if (!testInitData.trim()) return;
    try {
      setIsVerifying(true);
      const res = await api.verifyTelegramData(appId, testInitData.trim());
      setVerifyResult(res);
    } catch (err: any) {
      setVerifyResult({ is_valid: false, message: err.message });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!appData) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-xs text-[#777777]">
        Loading Telegram Bot Studio...
      </div>
    );
  }

  const miniAppUrl = typeof window !== "undefined" ? `${window.location.origin}/tg/${appData.slug}` : `/tg/${appData.slug}`;

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
          {/* Header Card */}
          <div>
            <h2 className="text-xl font-bold text-[#171717] tracking-tight">Telegram Bot Studio</h2>
            <p className="text-xs text-[#777777] mt-1">
              Connect your own dedicated Telegram Bot to launch and serve your application inside Telegram.
            </p>
          </div>

          {/* Connection Status Card */}
          <div className="p-6 rounded-xl border border-[#E8E8EA] bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    botStatus?.is_connected ? "bg-sky-50 text-sky-600 border border-sky-200" : "bg-[#F7F7F8] text-[#777777] border border-[#E8E8EA]"
                  }`}
                >
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#171717]">
                      {botStatus?.is_connected ? `@${botStatus.bot_username}` : "No Bot Connected"}
                    </span>
                    {botStatus?.is_connected ? (
                      <Badge variant="success" className="text-[10px]">
                        Active & Encrypted
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        Disconnected
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-[#777777] mt-0.5">
                    {botStatus?.is_connected
                      ? "Connected via Telegram Bot API with AES-256 token protection"
                      : "Provide a Telegram bot token from @BotFather to link your bot"}
                  </div>
                </div>
              </div>

              {botStatus?.is_connected && (
                <Button variant="outline" size="sm" onClick={handleDisconnect} className="text-xs text-red-600 hover:text-red-700">
                  Disconnect
                </Button>
              )}
            </div>

            {/* Token Input Form (if not connected) */}
            {!botStatus?.is_connected && (
              <div className="pt-4 border-t border-[#E8E8EA] space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#171717] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#D4146E]" />
                    <span>Telegram Bot Token</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-[#777777]">
                    Bot tokens are encrypted using AES-256-GCM and never exposed to the client.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleConnectBot}
                    disabled={isConnecting || !botToken.trim()}
                    className="text-xs"
                  >
                    {isConnecting ? "Verifying Token..." : "Connect Bot"}
                  </Button>
                  <span className="text-xs text-[#777777]">or use "mock-bot-token" for sandbox testing</span>
                </div>
              </div>
            )}
          </div>

          {/* BotFather Instructions Card */}
          <div className="p-6 rounded-xl border border-[#E8E8EA] bg-[#F7F7F8] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
              Step-by-Step: How to create your bot with @BotFather
            </h3>
            <ol className="text-xs text-[#777777] space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Open Telegram and search for <strong className="text-[#171717]">@BotFather</strong> (the official Telegram bot creator).
              </li>
              <li>
                Send <code className="bg-white px-1.5 py-0.5 rounded border border-[#E8E8EA] font-mono text-[#D4146E]">/newbot</code> and choose a name and username ending in <code className="font-mono text-[#171717]">bot</code>.
              </li>
              <li>
                Copy the HTTP API access token provided by BotFather.
              </li>
              <li>
                Paste your token above and click <strong>Connect Bot</strong>.
              </li>
            </ol>
          </div>

          {/* Mini App Launch Configuration Card */}
          <div className="p-6 rounded-xl border border-[#E8E8EA] bg-white shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#171717]">Telegram Mini App Launch Configuration</h3>
            <div className="space-y-3 text-xs text-[#777777]">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7F7F8] border border-[#E8E8EA]">
                <div>
                  <div className="font-semibold text-[#171717]">Direct Mini App URL</div>
                  <div className="font-mono text-[11px] text-[#D4146E] break-all">{miniAppUrl}</div>
                </div>
                <Link href={`/tg/${appData.slug}`} target="_blank">
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    <span>Test View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7F7F8] border border-[#E8E8EA]">
                <div>
                  <div className="font-semibold text-[#171717]">Chat Menu Button</div>
                  <div className="text-[11px] text-[#777777]">
                    Configures Telegram so users tapping your bot see a prominent "Open App" button.
                  </div>
                </div>
                <Button
                  variant={menuConfigured ? "outline" : "primary"}
                  size="sm"
                  onClick={handleConfigureMenuButton}
                  disabled={!botStatus?.is_connected || isSettingMenu}
                  className="text-xs"
                >
                  {menuConfigured ? "Menu Button Active" : "Configure Menu Button"}
                </Button>
              </div>
            </div>
          </div>

          {/* HMAC-SHA256 Cryptographic Signature Tester Card */}
          <div className="p-6 rounded-xl border border-[#E8E8EA] bg-white shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-[#171717]">Cryptographic HMAC-SHA256 Verification Test</h3>
            </div>
            <p className="text-xs text-[#777777]">
              Verify incoming <code className="font-mono text-[#171717]">window.Telegram.WebApp.initData</code> strings against the official Telegram specification.
            </p>

            <div className="space-y-2">
              <textarea
                rows={3}
                placeholder="Paste Telegram initData string (e.g. query_id=...&user=...&auth_date=...&hash=...)"
                value={testInitData}
                onChange={(e) => setTestInitData(e.target.value)}
                className="w-full p-2.5 text-xs font-mono bg-[#F7F7F8] border border-[#E8E8EA] rounded-md focus:border-[#D4146E] focus:outline-none"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestVerifyInitData}
                disabled={isVerifying || !testInitData.trim() || !botStatus?.is_connected}
                className="text-xs"
              >
                {isVerifying ? "Verifying Signature..." : "Verify Telegram Signature"}
              </Button>
            </div>

            {verifyResult && (
              <div
                className={`p-3 rounded-md text-xs font-mono border ${
                  verifyResult.is_valid
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}
              >
                <div className="font-bold mb-1">
                  {verifyResult.is_valid ? "✓ Valid Telegram Signature" : "✗ Verification Failed"}
                </div>
                <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(verifyResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

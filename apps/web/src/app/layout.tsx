import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/toast";
import { LearningProvider } from "@/lib/learning-mode";
import "./globals.css";

export const metadata: Metadata = {
  title: "MiniForge — Visual App Development Platform",
  description: "Build your own software. Control your own data. Launch to Telegram and the Web.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-[#171717] antialiased selection:bg-[#D4146E] selection:text-white">
        <ToastProvider>
          <LearningProvider>
            {children}
          </LearningProvider>
        </ToastProvider>
      </body>
    </html>
  );
}


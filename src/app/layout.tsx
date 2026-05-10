import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartOps AI - Intelligent Business Automation",
  description: "AI-powered automation hub for lead capture, support triage, and invoice follow-up.",
};

import { Toaster } from "react-hot-toast";

import Navigation from "@/components/Navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} antialiased bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-screen text-slate-50 relative selection:bg-emerald-500/30 overflow-x-hidden`}>
        <Navigation />
        <main className="relative z-10 pt-16">
          {children}
        </main>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
            }
          }}
        />
      </body>
    </html>
  );
}

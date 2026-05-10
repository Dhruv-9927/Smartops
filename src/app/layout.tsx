import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 min-h-screen text-slate-900`}>
        <Navigation />
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}

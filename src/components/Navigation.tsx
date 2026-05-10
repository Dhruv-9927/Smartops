"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/submit-lead", label: "Submit Lead" },
    { href: "/support", label: "Support" },
    { href: "/invoices", label: "Invoices" },
  ];

  return (
    <nav className="backdrop-blur-md bg-black/40 border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center gap-3">
              <span className="font-bold text-2xl text-white tracking-wide text-glow">SmartOps</span>
              <span className="bg-emerald-400 rounded-full w-2 h-2 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" title="Live"></span>
            </div>
            <div className="hidden sm:-my-px sm:ml-10 sm:flex sm:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "border-emerald-400 text-white"
                      : "border-transparent text-slate-400 hover:text-white hover:border-slate-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

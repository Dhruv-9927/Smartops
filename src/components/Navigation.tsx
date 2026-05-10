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
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="font-bold text-xl text-slate-900">SmartOps</span>
              <span className="bg-emerald-500 rounded-full w-2 h-2 animate-pulse" title="Live"></span>
            </div>
            <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === link.href
                      ? "border-emerald-500 text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
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

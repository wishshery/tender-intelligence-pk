"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Building2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const links = [
    { href: "/tenders", label: "Tenders" },
    { href: "/pricing", label: "Pricing" },
    { href: "/#features", label: "Features" },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-900 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-brand-900 text-lg font-display">TenderIQ</span>
              <span className="text-gold-700 text-sm font-medium ml-1">Pakistan</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                className="text-gray-600 hover:text-brand-900 font-medium transition-colors text-sm">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-primary py-2 px-4 text-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-600 hover:text-brand-900 font-medium text-sm">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary py-2 px-5 text-sm">
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                className="block py-2 text-gray-700 font-medium" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
              <Link href="/auth/login" className="btn-outline py-2 text-center text-sm" onClick={() => setOpen(false)}>Sign In</Link>
              <Link href="/auth/signup" className="btn-primary py-2 text-center text-sm" onClick={() => setOpen(false)}>Get Started Free</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

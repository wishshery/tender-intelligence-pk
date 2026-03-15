"use client";

import Link from "next/link";
import { useState } from "react";
import { X, Menu } from "lucide-react";
import { useAuthStore } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/tenders",   label: "Tenders" },
  { href: "/#services", label: "Services" },
  { href: "/#about",    label: "About" },
  { href: "/#contact",  label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  return (
    <nav className="bg-cream-100 border-b border-cream-300 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-charcoal-900 flex items-center justify-center text-cream-100 text-xs font-bold font-serif">
              T
            </span>
            <span className="font-serif text-xl text-charcoal-900 tracking-tight">TenderIQ</span>
            <span className="text-forest-600 text-sm font-semibold ml-0.5">PK</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href}
                className="text-sm text-charcoal-800 hover:text-charcoal-900 transition-colors tracking-wide">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-dark text-sm px-5 py-2">Dashboard</Link>
            ) : (
              <>
                <Link href="/auth/login"
                  className="text-sm text-charcoal-800 hover:text-charcoal-900 font-medium transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-dark text-sm px-5 py-2">
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-1.5 border border-charcoal-800 text-charcoal-900"
            onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-cream-300 bg-cream-100 px-6 py-5 space-y-4">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className="block text-sm text-charcoal-800 font-medium" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-4 border-t border-cream-300">
            <Link href="/auth/login"
              className="text-sm text-center py-2.5 border border-charcoal-900 text-charcoal-900 font-medium hover:bg-charcoal-900 hover:text-white transition-colors"
              onClick={() => setOpen(false)}>Sign In</Link>
            <Link href="/auth/signup"
              className="text-sm text-center py-2.5 bg-charcoal-900 text-white font-medium hover:bg-charcoal-800 transition-colors"
              onClick={() => setOpen(false)}>Get Started Free</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
